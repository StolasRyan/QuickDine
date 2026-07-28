import { Router } from "express";
import { getFeaturedRestraunts, getRestrauntAvailability, getRestrauntBySlug, getRestraunts } from "../controllers/restrauntController.js";

const restrauntRouter = Router();

restrauntRouter.get("/", getRestraunts);
restrauntRouter.get("/featured", getFeaturedRestraunts);
restrauntRouter.get("/:slug", getRestrauntBySlug);
restrauntRouter.get("/:id/availability", getRestrauntAvailability);


export default restrauntRouter;