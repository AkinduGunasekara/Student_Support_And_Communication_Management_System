import express from "express";
import multer from "multer";

import {
  createEvent,
  getApprovedEvents,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getMyEvents,
} from "./event.controller.js";

import {
  authMiddleware,
  requireRole,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔥 MULTER CONFIG
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// 🔹 PUBLIC
router.get("/", getApprovedEvents);

// 🔹 USER
router.get("/my-events", authMiddleware, getMyEvents);

// 🔹 ADMIN
router.get("/admin/pending", authMiddleware, requireRole("admin"), getPendingEvents);

router.put("/admin/:id/approve", authMiddleware, requireRole("admin"), approveEvent);

router.put("/admin/:id/reject", authMiddleware, requireRole("admin"), rejectEvent);

// 🔹 CREATE WITH IMAGE
router.post("/", authMiddleware, upload.single("image"), createEvent);

export default router;