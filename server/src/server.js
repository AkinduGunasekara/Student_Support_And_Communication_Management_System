import dotenv from "dotenv";
import express from "express";
 //import cors from "cors";
import ticketRouter from "./ticketRaising/ticket.routes.js";
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

connectDB();

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//     credentials: true,
//   })
// );

//middleware
app.use(express.json());

app.use("/api/tickets", ticketRouter);

app.listen(PORT, () => {
    console.log("Server started on port:", PORT);

    // initSocket(serverInstance);
    // initializeRentCronJobs();
    // initializeParcelCronJobs(); 
});

