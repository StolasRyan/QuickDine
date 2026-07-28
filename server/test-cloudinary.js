import "dotenv/config"
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// console.log("Config:", cloudinary.config());

// cloudinary.api.ping((error, result) => {
//   console.log("Error:", error);
//   console.log("Result:", result);
// });
cloudinary.uploader.upload(
  "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  { folder: "QuickDine" },
  (error, result) => {
    console.log("Upload error:", error);
    console.log("Upload result:", result);
  }
);