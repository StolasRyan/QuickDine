import {Router} from "express";
import { createOwnerRestraunt, getOwnerBookings, getOwnerRestraunt, updateBookingStatus, updateOwnerRestraunt } from "../controllers/ownerController.js";
import upload from "../config/multer.js";
import { ownerOnly, protect } from "../middlewares/auth.js";

const ownerRouter = Router();

ownerRouter.use(protect);
ownerRouter.use(ownerOnly);

ownerRouter.get("/restraunt", getOwnerRestraunt);
ownerRouter.post("/restraunt", upload.single("image"), createOwnerRestraunt);
ownerRouter.put("/restraunt", upload.single("image"), updateOwnerRestraunt);
ownerRouter.get("/bookings", getOwnerBookings);
ownerRouter.put("/bookings/:id/status", updateBookingStatus)

export default ownerRouter

