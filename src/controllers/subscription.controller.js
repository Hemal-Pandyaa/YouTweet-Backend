import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const subscribeChannel = asyncHandler(async (req, res) => {
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
    console.log(channel);

    let sub;
    try {
        sub = await Subscription.create({
            channel: channel,
            subscriber: req.user,
        });
    } catch (err) {
        console.log(err);
        throw new ApiError(402, "Duplicate subscription");
    }

    console.log(sub);

    res.status(200).json(
        new ApiResponse(200, { sub }, "Channel Subscription saved successfully")
    );
});

export { subscribeChannel };
