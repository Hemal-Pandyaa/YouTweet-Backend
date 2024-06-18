import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const stats = await Video.aggregate([
        {
            $match: {
                owner: req.user._id,
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "subscriptions",
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
            }
        },
        {
            $group: {
                _id: req.user._id,
                totalViews: {
                    $sum: "$views",
                },
                totalVideoUploaded: {
                    $sum: 1,
                },
                totalSubscribers: {
                    $sum: {
                        $size: "$subscriptions",
                    },
                },
                totalLikes: {
                    $sum: {
                        $size: "$likes",
                    },
                }
            },
        },

    ]);

    res.status(200).json(
        new ApiResponse(200, { stats }, "Channel Stats fetched successfully")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find({
        owner: req.user._id,
    });

    return res.status(200).json(
        new ApiResponse(200, { videos }, "Channel Videos fetched successfully")
    )
});

export { getChannelStats, getChannelVideos };
