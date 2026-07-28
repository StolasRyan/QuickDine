import { Request, Response } from "express";
import { Restraunt } from "../models/Restraunt.js";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";

//GET /api/restraunts
export const getRestraunts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { search, priceRange, location, rating, sort } = req.query;

    const queryObj: any = { status: "approved" };

    if (search) {
      queryObj.$or = [
        { name: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }
    if (priceRange) {
      const prices = Array.isArray(priceRange) ? priceRange : [priceRange];
      queryObj.priceRange = { $in: prices };
    }

    if (rating) {
      queryObj.rating = { $gte: parseFloat(rating as string) };
    }

    if (location) {
      queryObj.location = { $regex: location as string, $options: "i" };
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === "rating") {
      sortOption = { rating: -1 };
    } else if (sort === "price_low") {
      sortOption = { priceRange: 1 };
    } else if (sort === "price_high") {
      sortOption = { priceRange: -1 };
    }

    const restraunt = await Restraunt.find(queryObj).sort(sortOption);
    res.json(restraunt);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

//GET /api/restraunts/featured
export const getFeaturedRestraunts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const featured = await Restraunt.find({
      status: "approved",
      $or: [{ featured: true }, { exclusive: true }],
    }).limit(6);
    res.json(featured);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//GET /api/restraunts/:slug
export const getRestrauntBySlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const slug = req.params.slug;
    const restraunt = await Restraunt.findOne({ slug });
    if (!restraunt) {
      res.status(404).json({ message: "Restraunt not found" });
      return;
    }
    if (restraunt.status !== "approved") {
      let isAutorized = false;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        try {
          const token = req.headers.authorization.split(" ")[1];
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET! as string,
          ) as { id: string };
          const user = await User.findById(decoded.id);
          if (
            user &&
            (user.role === "admin" ||
              (user.role === "owner" &&
                restraunt.owner.toString() === user._id.toString()))
          ) {
            isAutorized = true;
          }
        } catch (error) {}
      }
      if(!isAutorized){
        res.status(404).json({ message: "Restraunt not found or pending approval" });
        return;
      }
    }
    res.json(restraunt);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

//GET /api/restraunts/:id/availability
export const getRestrauntAvailability = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {date} = req.query;
    if(!date){
        res.status(400).json({message: "Please provide a date"});
        return;
    }
    const restraunt = await Restraunt.findById(req.params.id);
    if(!restraunt){
        res.status(404).json({message: "Restraunt not found"});
        return;
    }

    const bookingDate = new Date(date as string);
    const bookings = await Booking.find({
        restraunt: restraunt._id,
        date: bookingDate,
        status: "confirmed"
    });

    const avability = restraunt.availableSlots.map((slot)=>{
        const bookSeats = bookings.filter((booking)=>booking.time === slot)
        .reduce((total, booking)=>total + booking.guests,0);
        const totalSeats = restraunt.totalSeats || 20;
        const availableSeats = Math.max(0, totalSeats - bookSeats);
        return {
            time: slot,
            availableSeats,
            isAvailable: availableSeats > 0
        }
    })

    res.json(avability);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};
