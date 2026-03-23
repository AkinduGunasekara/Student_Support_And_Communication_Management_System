import express from "express";
import {
  createEvent,
  getApprovedEvents,
  getEventById,
  getPendingEvents,
  approveEvent,
  rejectEvent,
} from "./event.controller.js";

import { authMiddleware, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();


// 🔹 PUBLIC
router.get("/", getApprovedEvents);
router.get("/:id", getEventById);


// 🔹 CREATE EVENT (student special + lecturer + admin)
router.post("/", authMiddleware, createEvent);


// 🔹 ADMIN ROUTES
router.get("/admin/pending", authMiddleware, requireRole("admin"), getPendingEvents);

router.put("/admin/:id/approve", authMiddleware, requireRole("admin"), approveEvent);

router.put("/admin/:id/reject", authMiddleware, requireRole("admin"), rejectEvent);


export default router;