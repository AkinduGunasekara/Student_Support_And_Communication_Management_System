import express from "express";
import User, { USER_ROLES } from "../models/user.model.js";
import { authMiddleware, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin: create new user (any role)
router.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { studentId, name, email, password, role, faculty, course, year, isActive } =
        req.body;

      if (!name || !email || !password || !role) {
        return res
          .status(400)
          .json({ message: "name, email, password and role are required" });
      }

      if (!USER_ROLES.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const existingUser = await User.findOne({ email: String(email).toLowerCase() });
      if (existingUser) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const user = await User.create({
        studentId: role === "student" ? studentId : undefined,
        name,
        email,
        password,
        role,
        faculty,
        course,
        year,
        isActive: typeof isActive === "boolean" ? isActive : undefined,
      });

      const safeUser = await User.findById(user._id).select("-password");
      return res.status(201).json(safeUser);
    } catch (error) {
      console.error("Create user error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

//Admin list all users
router.get(
    "/",
    authMiddleware,
    requireRole("admin"),
    async (req, res) => {
        try {
            const users = await User.find().select("-password").sort({ createdAt: -1});
            return res.json(users);
        } catch (error) {
            console.error("Get users error:", error);
            return res.status(500).json({ message: "Server error" });
        }
        }
);

//Admin get single user
router.get(
    "/:id",
    authMiddleware,
    requireRole("admin"),
    async (req, res) => {
        try {
          const user = await User.findById(req.params.id).select("-password");
          if (!user) return res.status(404).json({ message: "User not found" });
          return res.json(user);
        } catch (error) {
          console.error("Get user error:", error);
          return res.status(500).json({ message: "Server error" });
        }
      }
);

// Admin: update role / activation / details
router.patch(
    "/:id",
    authMiddleware,
    requireRole("admin"),
    async (req, res) => {
      try {
        const { studentId, role, isActive, faculty, course, year } = req.body;
        const update = {};
  
        if (role) {
          if (!USER_ROLES.includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
          }
          update.role = role;
        }
  
        if (typeof isActive === "boolean") {
          update.isActive = isActive;
        }
  
        if (studentId !== undefined) update.studentId = studentId;
        if (faculty !== undefined) update.faculty = faculty;
        if (course !== undefined) update.course = course;
        if (year !== undefined) update.year = year;
  
        const user = await User.findByIdAndUpdate(req.params.id, update, {
          new: true,
          runValidators: true,
        }).select("-password");
  
        if (!user) return res.status(404).json({ message: "User not found" });
  
        return res.json(user);
      } catch (error) {
        console.error("Update user error:", error);
        return res.status(500).json({ message: "Server error" });
      }
    }
  );

// Admin: delete a user
router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const deleted = await User.findByIdAndDelete(req.params.id).select("-password");
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);
  
  export default router;