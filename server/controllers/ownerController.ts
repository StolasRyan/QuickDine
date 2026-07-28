import { AuthRequest } from "../middlewares/auth.js";
import { Response } from "express";
import { Restraunt } from "../models/Restraunt.js";
import { v2 as cloudinary } from "cloudinary";
import { Booking } from "../models/Booking.js";

console.log("Cloudinary config check:", cloudinary.config().cloud_name);

const uploadToCloudinary = (
  fileBuffer: Buffer,
): Promise<{ secure_url: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "QuickDine" },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed"));
        resolve({ secure_url: result.secure_url });
      },
    );
    stream.end(fileBuffer);
  });
};

//GET /api/owner/restraunt
export const getOwnerRestraunt = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const restraunt = await Restraunt.findOne({ owner: req.user?._id });
    if (!restraunt) {
      res.status(200).json(null);
      return;
    }
    res.json(restraunt);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

//POST /api/owner/restraunt
export const createOwnerRestraunt = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const existingRestraunt = await Restraunt.findOne({ owner: req.user?._id });
    if (existingRestraunt) {
      res
        .status(400)
        .json({ message: "You already have a restraunt registered" });
      return;
    }
    const {
      name,
      description,
      cusine,
      priceRange,
      location,
      address,
      chef,
      tags,
      availableSlots,
      totalSeats,
    } = req.body;
    if (
      !name ||
      !description ||
      !cusine ||
      !priceRange ||
      !location ||
      !address ||
      !chef
    ) {
      res
        .status(400)
        .json({ message: "Please provide all required restraunt details" });
      return;
    }

    //Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const slugExists = await Restraunt.findOne({ slug });
    if (slugExists) {
      res
        .status(400)
        .json({ message: "Restraunt with this name already exists" });
      return;
    }
    //image

    let imageUrl = "";
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const parsedTags =
      typeof tags === "string"
        ? tags.split(",").map((tag) => tag.trim())
        : tags || [];
    const parsedSlots =
      typeof availableSlots === "string"
        ? availableSlots.split(",").map((slot) => slot.trim())
        : availableSlots || ["17:00", "18:00", "19:00", "20:00", "21:00"];

    const restraunt = await Restraunt.create({
      name,
      slug,
      description,
      cusine,
      priceRange,
      location,
      address,
      chef,
      image: imageUrl,
      tags: parsedTags,
      availableSlots: parsedSlots,
      totalSeats: totalSeats ? Number(totalSeats) : 20,
      owner: req.user?._id,
      status: "pending",
    });

    res.status(201).json(restraunt);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

//PUT /api/owner/restraunt
export const updateOwnerRestraunt = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const restraunt = await Restraunt.findOne({ owner: req.user?._id });
    if (!restraunt) {
      res.status(404).json({ message: "Restraunt not found" });
      return;
    }

    const {
      name,
      description,
      cusine,
      priceRange,
      location,
      address,
      chef,
      tags,
      availableSlots,
      totalSeats,
    } = req.body;

    if (name) restraunt.name = name;
    if (description) restraunt.description = description;
    if (cusine) restraunt.cusine = cusine;
    if (priceRange) restraunt.priceRange = priceRange;
    if (location) restraunt.location = location;
    if (address) restraunt.address = address;
    if (chef) restraunt.chef = chef;
    if (totalSeats) restraunt.totalSeats = Number(totalSeats);

    if (tags) {
      restraunt.tags =
        typeof tags === "string"
          ? tags.split(",").map((tag) => tag.trim())
          : tags;
    }

    if (availableSlots) {
      restraunt.availableSlots =
        typeof availableSlots === "string"
          ? availableSlots.split(",").map((slot) => slot.trim())
          : availableSlots;
    }

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      restraunt.image = result.secure_url;
    }

    const updated = await restraunt.save();
    res.json(updated);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

//GET /api/owner/bookings
export const getOwnerBookings = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const restraunt = await Restraunt.findOne({ owner: req.user?._id });
    if (!restraunt) {
      res.status(404).json({ message: "Restraunt profile not found" });
      return;
    }
    const bookings = await Booking.find({ restraunt: restraunt._id })
      .populate("user", "name email phone")
      .sort({ date: -1, time: -1 });

      res.json(bookings);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

//PUT /api/owner/bookings/:id/status
export const updateBookingStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.body;
    if(!status || !["completed", "cancelled"].includes(status)){
        res.status(400).json({message: "Please provide a valid status"});
        return;
    }
    const boking = await Booking.findById(req.params.id);
    if(!boking){
        res.status(404).json({message: "Booking not found"});
        return;
    } 
    const restraunt = await Restraunt.findById(boking.restraunt);
    if(!restraunt || restraunt.owner.toString() !== req.user?._id.toString()){
        res.status(401).json({message: "Unauthorized"});
        return;
    }

    boking.status = status;
    await boking.save();
    res.json(boking);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};
