import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Accepts fileBuffer and uploads to Cloudinary
const uploadOnCloudinary = async (fileBuffer, folder = "uploads") => {
  if (!fileBuffer) return "";

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto", // allows image/video/etc
        folder: folder,
      },
      (error, result) => {
        if (result) {
          console.log("✅ Uploaded:", result.secure_url);
          resolve(result);
        } else {
          console.log("❌ Failed:", error);
          reject(error);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

const deleteCloudinary = async (cloudUrl) => {
    try {
        if(!cloudUrl) return ""
        const response = await cloudinary.uploader.destroy(cloudUrl);
        console.log("File Has Been Deleted, Successfully!! YEEE! Hurrah!");
        return response;
    } catch (error) {
        return null;
    }
};

export { uploadOnCloudinary, deleteCloudinary };
