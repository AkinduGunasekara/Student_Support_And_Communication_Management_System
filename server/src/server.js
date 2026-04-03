import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRouter from "./userManagement/auth.routes.js";
import userRouter from "./userManagement/user.routes.js";
import ticketRouter from "./ticketRaising/ticket.routes.js";
import messageRouter from "./officialMessaging/message.routes.js";
import feedbackRouter from "./feedback/feedback.routes.js";
import eventRoutes from "./event/event.routes.js";
import path from "path";

import { connectDB } from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 5001;

connectDB();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

//middleware
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/tickets", ticketRouter);
app.use("/api/messages", messageRouter);
app.use("/api/feedback", feedbackRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.listen(PORT, () => {
  console.log("Server started on port:", PORT);

  // initSocket(serverInstance);
  // initializeRentCronJobs();
  // initializeParcelCronJobs();
});