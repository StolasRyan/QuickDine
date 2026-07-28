import { AuthRequest } from "../middlewares/auth.js";
import { Response } from "express";
import { Booking } from "../models/Booking.js";
import { Restraunt } from "../models/Restraunt.js";

//POST /api/bookings
//@access Private
export const createBooking = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { restrauntId, date, time, guests, occasion, specialRequests } =
      req.body;
    if (!restrauntId || !date || !time || !guests) {
      res
        .status(400)
        .json({ message: "Please provide all required reservation details" });
      return;
    }
    const restraunt = await Restraunt.findById(restrauntId);
    if (!restraunt) {
      res.status(404).json({ message: "Restraunt not found" });
      return;
    }
    if (restraunt.status !== "approved") {
      res.status(400).json({
        message: "Reseservation not available for this restraunt yet",
      });
      return;
    }
    const requestedGuests = Number(guests);
    const existingBookings = await Booking.find({
      restraunt: restrauntId,
      date: new Date(date),
      time,
      status: "confirmed",
    });
    const bookedSeats = existingBookings.reduce(
      (total, booking) => total + booking.guests,
      0,
    );
    const totalSeats = restraunt.totalSeats || 20;
    const availableSeats = totalSeats - bookedSeats;
    if (requestedGuests > availableSeats) {
      res.status(400).json({
        message: `Unable to reserve. Only ${availableSeats} seats are available for this time slot`,
      });
      return;
    }

    const booking = await Booking.create({
      user: req.user?._id,
      restraunt: restrauntId,
      date: new Date(date),
      time,
      guests: Number(guests),
      occasion,
      specialRequests,
      status: "confirmed",
    });

    const populatedBooking = await booking.populate(
      "restraunt",
      "name location image address",
    );

    res.status(201).json(populatedBooking);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

//GET /api/bookings/my
//@access Private
export const getMyBookings = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const bookings = await Booking.find({ user: req.user?._id })
      .populate("restraunt", "name location image address slug")
      .sort({ date: -1, time: -1 });

    res.json(bookings);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

//Cancel booking
//PUT /api/bookings/:id/cancel
//@access Private
export const cancelBooking = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    if (booking.user.toString() !== req.user?._id.toString()) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    booking.status = "cancelled";
    await booking.save();
    const populatedBooking = await booking.populate(
      "restraunt",
      "name location image address",
    );

    res.json(populatedBooking);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};
