import express from "express";
import User from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
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
  const { name, email, password, role = "student", faculty, course, year } = req.body;
  const numericYear = Number(year);

        if (!name || !email || !password){
            return res.status(400).json({ message: "Name, email and password are required" });
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
      if (!Number.isInteger(numericYear) || numericYear < 1 || numericYear > 4) {
        return res.status(400).json({ message: "Please select a valid year between 1 and 4" });
      }
    }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered"});
        
        }

        const user = await User.create({
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
            console.error("Register error:", error);
            return res.status(500).json({ message: "Server error"});
        }
    });

    // Login (all roles)
router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }
  
      const user = await User.findOne({ email }).select("+password");
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
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
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