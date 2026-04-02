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

// import sn_expenseRoutes from "./routes/sn_expenseRoutes.js";
// import usersRoutes from "./routes/vd_usersRoutes.js";
// import adminRoutes from "./routes/vd_adminRoutes.js";
// import parcelRoutes from "./routes/ks_parcelRoutes.js";
// import serviceRequestRouter from "./routes/GKServicceRequestRoutes.js";
// import announcementRoutes from "./routes/GKAnnouncementRouter.js";
import { connectDB } from "./config/db.js";
// import { initializeRentCronJobs } from "./jobs/sn_monthlyReminder.js";
// import noteRoutes from "./routes/SDnotesRoutes.js";
// import purchaseRoutes from "./routes/SDpurchaseRoutes.js";
// import conventionHallBookingRoutes from "./routes/SDConventionHallBookingRoutes.js";
// import laundryRoutes from "./routes/SDlaundryRoutes.js";
// import feedbackRoutes from "./routes/vd_feedbackRoutes.js";
// import notificationRoutes from "./routes/vd_notificaionRoutes.js";
// import { initSocket } from "./socket.js";
// import "./jobs/ks_ParcelRemaiderJob.js";
// import searchRoutes from "./routes/vd_searchRoutes.js";
// import { initializeParcelCronJobs } from "./jobs/ks_ParcelRemaiderJob.js";


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
app.use("/api/events", eventRoutes);

// Events UPLOADS (VERY IMPORTANT)
app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => {
  console.log("Server started on port:", PORT);

  // initSocket(serverInstance);
  // initializeRentCronJobs();
  // initializeParcelCronJobs();
});