import express from "express";
import User, { USER_ROLES } from "../models/user.model.js";
import { authMiddleware, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

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
        const { role, isActive, faculty, course, year } = req.body;
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
  
  export default router;