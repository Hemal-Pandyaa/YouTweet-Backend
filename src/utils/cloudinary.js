import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return "File not found!!";
        cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
        console.log("File Has Been Uploaded, Successfully!! YEEE! Hurrah!");
    } catch {
        fs.unlinkSync(localFilePath);
        return "File Unlinked becuase there was error uploading file...! 😭";
    }
};

export { uploadOnCloudinary };
