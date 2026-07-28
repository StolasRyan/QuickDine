import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import restrauntRouter from "./routes/restrauntRoute.js";
import bookingRouter from "./routes/bookingRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import adminRouter from "./routes/adminRoutes.js";

const app = express();

await connectDB();

app.use(cors({
  origin:  process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from the server!");
});

app.use("/api/auth", authRouter);
app.use("/api/restraunts", restrauntRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/admin", adminRouter);

//Global Error Handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error", error);
  res
    .status(500)
    .json({
      message: error.message || "Internal server error",
      stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
    });
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;