import asyncHandler from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { deleteCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

console.log("Hereee1");

const getAllVideos = asyncHandler(async (req, res) => {
    console.log("Retriving all videos...");
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const aggregatedVideo = await Video.aggregate([
        {
            $match: {
                isPublished: true,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
            },
        },
        {
            $unwind: "$owner",
        },
        {
            $group: {
                _id: "$_id",
                title: { $first: "$title" },
                description: { $first: "$description" },
                video: { $first: "$video" },
                thumbnail: { $first: "$thumbnail" },
                duration: { $first: "$duration" },
                owner: { $first: "$owner" },
            },
        },
        {
            $project: {
                _id: 1,
                title: 1,
                video: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                owner: {
                    _id: "$owner._id",
                    username: "$owner.username",
                    avatar: "$owner.avatar",
                    coverImage: "$owner.coverImage",
                },
            },
        },
        {
            $skip: skip
        },
        {
            $limit: parseInt(limit)
        },
    ]);

    res.status(200).json(
        new ApiResponse(200, { aggregatedVideo }, "Videos fetched Successfully")
    );
});

const uploadVideo = asyncHandler(async (req, res) => {
    const title = req.body.title;
    const description = req.body.description;

    const videoFile = req.files?.video?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];
    console.log(videoFile)
    console.log(thumbnailFile)

    if (!(videoFile && thumbnailFile)) {
        throw new ApiError(400, "Video and Thumbnail are required");
    }

    const uploadedVideo = await uploadOnCloudinary(videoFile.buffer, "video");
    const thumbnail = await uploadOnCloudinary(thumbnailFile.buffer, "thumbnail");

    if (!(uploadedVideo && thumbnail)) {
        throw new ApiError(500, "Error happened while uploading video or thumbnail");
    }

    const videoDuration = parseInt(uploadedVideo?.duration || 0);

    const video = await Video.create({
        title,
        description,
        video: uploadedVideo.url,
        thumbnail: thumbnail.url,
        duration: videoDuration,
        owner: req.user,
        isPublished: true,
    });

    res.status(201).json(
        new ApiResponse(201, video, "Video uploaded successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (!video.owner.equals(req.user._id)) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    await deleteCloudinary(video.video);
    await deleteCloudinary(video.thumbnail);

    await Video.deleteOne({ _id: req.params.videoId });

    res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
    const videoId = req.params.videoId;

    if (!videoId) {
        throw new ApiError(404, "Video not found");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    video.views += 1;
    await video.save();

    res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    );
});

const updateVideoDetails = asyncHandler(async (req, res) => {
    const videoId = req.params.videoId;
    if (!videoId) {
        throw new ApiError(404, "Video not found");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (!video.owner.equals(req.user._id)) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    const { title, description } = req.body;

    if (!(title && description)) {
        throw new ApiError(400, "Title and Description are required");
    }

    const thumbnailFile = req.file;

    if (thumbnailFile) {
        await deleteCloudinary(video.thumbnail);
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailFile.buffer, "image");
        video.thumbnail = uploadedThumbnail.url;
    }

    video.title = title;
    video.description = description;

    await video.save();

    res.status(200).json(
        new ApiResponse(200, video, "Video updated successfully")
    );
});

const togglePublished = asyncHandler(async (req, res) => {
    const videoId = req.params.videoId;
    if (!videoId) {
        throw new ApiError(404, "Video not found");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (!video.owner.equals(req.user._id)) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    video.isPublished = !video.isPublished;

    await video.save();

    res.status(200).json(
        new ApiResponse(200, video, "Video publish status toggled successfully")
    );
});

export {
    getAllVideos,
    uploadVideo,
    deleteVideo,
    getVideoById,
    updateVideoDetails,
    togglePublished
};
