import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Uploads an image Buffer directly to Cloudinary using upload_stream.
// This is serverless-compatible — no local filesystem reads or writes.
const uploadOnCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer) {
      resolve(null);
      return;
    }

    const uploadOptions = {
      resource_type: "image",
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
        } else {
          console.log("Image uploaded to Cloudinary:", result.secure_url);
          resolve(result);
        }
      }
    );

    stream.end(fileBuffer);
  });
};

export { uploadOnCloudinary };
