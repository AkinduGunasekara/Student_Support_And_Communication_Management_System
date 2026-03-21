import express from "express";
import User from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

//Student registration
router.post("/register", async (req, res) => {
    try{
        const { name, email, password, department, course, year } = req.body;

        if (!name || !email || !password){
            return res.status(400).json({ message: "Name, email and password are required" });
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered"});
        
        }

        const user = await User.create({
            name,
            email,
            password,
            department,
            course,
            year,
            role: "student",

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
  
  // Current user
  router.get("/me", authMiddleware, (req, res) => {
    return res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department,
      course: req.user.course,
      year: req.user.year,
    });
  });
  
  export default router;