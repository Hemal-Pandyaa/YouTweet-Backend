import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const toggleSubscribed = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    const { username } = req.body;
    if (!username) {
        throw new ApiError(400, "username is required");
    }

    const channel = await User.findOne({ username });
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    if(channel == req.user){
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    let isSubscribed = false;
    let sub = await Subscription.findOneAndDelete({
        channel: channel,
        subscriber: req.user,
    });

    if(!sub) {
        isSubscribed = true;
        sub = await Subscription.create({
            channel: channel,
            subscriber: req.user,
        })
    }

    res.status(200).json(
        new ApiResponse(200, {sub}, isSubscribed ? "Channel Subscribed Successfully" : "Channel Unsubscribed Successfully")
    );
});

const getUserSubscription = asyncHandler( async( req, res) => {
    const user = await User.findById(req.params.userId);
    if(!user) {
        throw new ApiError(404, "User not found");
    }

    const subscriptions = await Subscription.aggregate([
        {
            $match: {
                subscriber: user._id
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel"
            }
        },
        {
            $unwind: "$channel"
        },
        {
            $group: {
                _id: user._id,
                username: {$first: "$channel.username"},
                avatar: {$first: "$channel.avatar"},
            }
        },
    ])  

    console.log(subscriptions, )
    res.status(200).json(new ApiResponse(200, { subscriptions }, "User Subscriptions"));
})

const getSubscription = asyncHandler( async (req, res) => {
    const user = req.user
    if(!user) {
        throw new ApiError(404, "User not found");
    }

    const subscriptions = await Subscription.aggregate([
        {
            $match: {
                subscriber: user._id
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel"
            }
        },
        {
            $unwind: "$channel"
        },
        {
            $group: {
                _id: user._id,
                username: {$first: "$channel.username"},
                avatar: {$first: "$channel.avatar"},
            }
        },
    ])  

    console.log(subscriptions, )
    res.status(200).json(new ApiResponse(200, { subscriptions }, "User Subscriptions"));
})

export { toggleSubscribed, getUserSubscription, getSubscription };
