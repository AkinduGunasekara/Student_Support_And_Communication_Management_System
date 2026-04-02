import express from "express";
import crypto from "crypto";
import User from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { isMailConfigured, sendPasswordResetEmail } from "../utils/mailer.js";
import {
  COURSES,
  COURSE_BY_FACULTY,
  FACULTIES,
  USER_ROLES,
} from "../models/user.model.js";

const router = express.Router();
const NAME_REGEX = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;

//Student registration
router.post("/register", async (req, res) => {
    try{
  const { studentId, name, email, password, role = "student", faculty, course, year } = req.body;
  const numericYear = Number(year);

        if (!name || !email || !password){
            return res.status(400).json({ message: "Name, email and password are required" });
        }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (!NAME_REGEX.test(String(name).trim())) {
      return res.status(400).json({ message: "Name can contain only alphabetic letters and spaces" });
    }

    if (!["student", "lecturer"].includes(role) || !USER_ROLES.includes(role)) {
      return res.status(400).json({ message: "Role must be student or lecturer" });
    }

    if (!faculty || !FACULTIES.includes(faculty)) {
      return res.status(400).json({ message: "Please select a valid faculty" });
    }

    if (["student", "lecturer"].includes(role)) {
      if (!course || !COURSES.includes(course)) {
        return res.status(400).json({ message: "Please select a valid course" });
      }

      const allowedCourses = COURSE_BY_FACULTY[faculty] || [];
      if (!allowedCourses.includes(course)) {
        return res.status(400).json({ message: "Invalid course for selected faculty" });
      }

    }

    if (role === "student") {
      if (!studentId || !String(studentId).trim()) {
        return res.status(400).json({ message: "Student ID is required for students" });
      }
      if (!Number.isInteger(numericYear) || numericYear < 1 || numericYear > 4) {
        return res.status(400).json({ message: "Please select a valid year between 1 and 4" });
      }
    }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered"});
        
        }

        const user = await User.create({
            studentId: role === "student" ? String(studentId).trim() : undefined,
            name,
            email,
            password,
            faculty,
            course: ["student", "lecturer"].includes(role) ? course : undefined,
            year: role === "student" ? numericYear : undefined,
            role,

        });

        const token = generateToken(user);

        return res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
        }catch (error) {
          console.error("REGISTER ERROR FULL:", error); // 👈 shows full error in terminal
          return res.status(500).json({ message: error.message }); // 👈 shows exact error in Postman
}
    });

    // Login (all roles)
router.post("/login", async (req, res) => {
    try {
      const { identifier, password } = req.body;
  
      if (!identifier || !password) {
        return res
          .status(400)
          .json({ message: "Email/Student ID and password are required" });
      }
  
      const identifierTrimmed = String(identifier).trim();
      const query = identifierTrimmed.includes("@")
        ? { email: identifierTrimmed.toLowerCase() }
        : { studentId: identifierTrimmed };

      const user = await User.findOne(query).select("+password");
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      const token = generateToken(user);
  
      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          studentId: user.studentId,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Request a password reset link by email
  router.post("/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const emailAddress = String(email).trim().toLowerCase();
      const user = await User.findOne({ email: emailAddress });

      if (!user || !user.isActive) {
        return res.json({
          message:
            "If an account exists for that email, a password reset link has been sent.",
        });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
      const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;

      user.resetPasswordToken = resetTokenHash;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save({ validateBeforeSave: false });

      let emailSent = false;
      try {
        emailSent = await sendPasswordResetEmail({
          to: user.email,
          name: user.name,
          resetUrl,
        });
      } catch (mailError) {
        console.error("Password reset email error:", mailError);
      }

      const response = {
        message:
          "If an account exists for that email, a password reset link has been sent.",
      };

      if (!emailSent && !isMailConfigured) {
        response.resetUrl = resetUrl;
      }

      return res.json(response);
    } catch (error) {
      console.error("Forgot password error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Reset password using the emailed token
  router.post("/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res
          .status(400)
          .json({ message: "Token and newPassword are required" });
      }

      if (String(newPassword).length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }

      const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");
      const user = await User.findOne({
        resetPasswordToken: tokenHash,
        resetPasswordExpires: { $gt: new Date() },
      }).select("+password");

      if (!user) {
        return res.status(400).json({ message: "Reset link is invalid or has expired" });
      }

      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Update current user profile (limited fields)
  router.patch("/me", authMiddleware, async (req, res) => {
    try {
      const { name, faculty, course, year, studentId } = req.body;

      const update = {};
      if (name !== undefined) update.name = name;
      if (faculty !== undefined) update.faculty = faculty;
      if (course !== undefined) update.course = course;
      if (year !== undefined) update.year = year;

      // Allow studentId update only for students
      if (studentId !== undefined && req.user.role === "student") {
        update.studentId = studentId;
      }

      const updated = await User.findByIdAndUpdate(req.user._id, update, {
        new: true,
        runValidators: true,
      }).select("-password");

      return res.json({
        id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        studentId: updated.studentId,
        faculty: updated.faculty,
        course: updated.course,
        year: updated.year,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Change current user password
  router.patch("/me/password", authMiddleware, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: "currentPassword and newPassword are required" });
      }

      if (String(newPassword).length < 6) {
        return res
          .status(400)
          .json({ message: "New password must be at least 6 characters" });
      }

      const user = await User.findById(req.user._id).select("+password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      user.password = newPassword;
      // Avoid blocking password changes because of legacy missing profile fields.
      await user.save({ validateBeforeSave: false });

      return res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Get active lecturers by faculty and course
  router.get("/lecturers", authMiddleware, async (req, res) => {
    try {
      const { faculty, course } = req.query;

      if (!faculty || !course) {
        return res
          .status(400)
          .json({ message: "faculty and course query parameters are required" });
      }

      if (!FACULTIES.includes(faculty)) {
        return res.status(400).json({ message: "Please select a valid faculty" });
      }

      if (!COURSES.includes(course)) {
        return res.status(400).json({ message: "Please select a valid course" });
      }

      const allowedCourses = COURSE_BY_FACULTY[faculty] || [];
      if (!allowedCourses.includes(course)) {
        return res.status(400).json({ message: "Invalid course for selected faculty" });
      }

      const lecturers = await User.find({
        role: "lecturer",
        isActive: true,
        faculty,
        course,
      }).select("_id name email faculty course");

      return res.json(lecturers);
    } catch (error) {
      console.error("Get lecturers error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Current user
  router.get("/me", authMiddleware, (req, res) => {
    return res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      studentId: req.user.studentId,
      faculty: req.user.faculty,
      course: req.user.course,
      year: req.user.year,
    });
  });

  // Delete current user account permanently
  router.delete("/me", authMiddleware, async (req, res) => {
    try {
      await User.findByIdAndDelete(req.user._id);
      return res.json({ message: "Account deleted permanently" });
    } catch (error) {
      console.error("Delete account error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  export default router;