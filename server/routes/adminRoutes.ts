import { Router } from "express";
import { approveRestraunt, getAdminStats, getAllRestraunts } from "../controllers/adminController.js";
import { adminOnly, protect } from "../middlewares/auth.js";

const adminRouter = Router();

adminRouter.use(protect);
adminRouter.use(adminOnly);

adminRouter.get("/restraunts", getAllRestraunts);
adminRouter.put("/restraunts/:id/approve", approveRestraunt);
adminRouter.get("/stats", getAdminStats);

export default adminRouter
