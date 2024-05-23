import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import {unlink} from "../utils/unlink.js"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return "";
        const result = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
        console.log("File Has Been Uploaded, Successfully!! YEEE! Hurrah!", result.url);
        unlink(localFilePath);
        return result;
    } catch {
        unlink(localFilePath)
        return "File Unlinked becuase there was error uploading file...! 😭";
    }
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
