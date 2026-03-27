import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import ticketRouter from "./ticketRaising/ticket.routes.js";
// import usersRoutes from "./routes/vd_usersRoutes.js";
// import adminRoutes from "./routes/vd_adminRoutes.js";
import { connectDB } from "./config/db.js";
// import { initializeRentCronJobs } from "./jobs/sn_monthlyReminder.js";
// import { initSocket } from "./socket.js";
// import "./jobs/ks_ParcelRemaiderJob.js";
// import searchRoutes from "./routes/vd_searchRoutes.js";
// import { initializeParcelCronJobs } from "./jobs/ks_ParcelRemaiderJob.js";

dotenv.config();

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

app.use("/api/tickets", ticketRouter);

app.listen(PORT, () => {
    console.log("Server started on port:", PORT);

    // initSocket(serverInstance);
    // initializeRentCronJobs();
    // initializeParcelCronJobs(); 
});

