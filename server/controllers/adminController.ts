import { AuthRequest } from "../middlewares/auth.js";
import { Response } from "express";
import { Restraunt } from "../models/Restraunt.js";
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";

//Get /api/admin/restraunts
export const getAllRestraunts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const restraunts = await Restraunt.find({})
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    res.json(restraunts);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

//PUT /api/admin/restraunts/:id/approve
export const approveRestraunt = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {status} = req.body;
    if(!status || !["approved", "rejected", "pending"].includes(status)){
        res.status(400).json({message: "Please provide a valid status"});
        return;
    }
    const restraunt = await Restraunt.findById(req.params.id);
    if(!restraunt){
        res.status(404).json({message: "Restraunt profile not found"});
        return;
    }
    restraunt.status = status;
    await restraunt.save();
    res.json(restraunt);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

//GET /api/admin/stats
export const getAdminStats = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments({role: "user"});
    const totalOwners = await User.countDocuments({role: "owner"});
    const totalBookings = await Booking.countDocuments({});
    const totalRestraunts = await Restraunt.countDocuments({});

    const latestBookings = await Booking.find({}).populate("user", "name email").populate("restraunt", "name").sort({createdAt: -1}).limit(10);

    res.json({
        users:{
            totalUsers,
            totalOwners,
            total: totalUsers + totalOwners
        },
         restaurants: {
             total: totalRestraunts
         },
          bookings: {
              total: totalBookings
          },
          latestBookings
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};
