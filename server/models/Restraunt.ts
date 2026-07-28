import { model, Schema, Document, Types } from "mongoose";

export interface IRestraunt extends Document {
  name: string;
  slug: string;
  description: string;
  cusine: string;
  priceRange: "$" | "$$" | "$$$" | "$$$$";
  rating: number;
  reviewCount: number;
  location: string;
  address: string;
  image: string;
  chef: string;
  tags: string[];
  availableSlots: string[];
  featured: boolean;
  exclusive: boolean;
  owner: Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  totalSeats: number;
  createdAt: Date;
  updatedAt: Date;
}

const RestrauntSchema = new Schema<IRestraunt>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: { type: String, required: true },
    cusine: { type: String, trim: true, required: true },
    priceRange: {
      type: String,
      enum: ["$", "$$", "$$$", "$$$$"],
      required: true,
    },
    rating: { type: Number, required: true, default: 5.0, min: 1, max: 5 },
    reviewCount: { type: Number, default: 0 },
    location: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    image: { type: String, default: "" },
    chef: { type: String, required: true },
    tags: [{ type: String }],
    availableSlots: [{ type: String }],
    featured: { type: Boolean, default: false },
    exclusive: { type: Boolean, default: false },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    totalSeats: { type: Number, default: 20 },
  },
  { timestamps: true },
);



export const Restraunt = model<IRestraunt>("Restraunt", RestrauntSchema);
