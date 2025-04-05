import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { deleteCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { unlink } from "../utils/unlink.js";

var options = {
    httpOnly: true,
    secure: true,
};

async function generateAccessAndRefreshToken(userId) {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
}

const registerUser = asyncHandler(async (req, res) => {
    console.log("HEllo World ! You got here at least")
    try {
        
        const { username, email, password, fullName } = req.body;
    
        if (
            [username, email, password, fullName].some((feild) => {
                return feild?.trim() === "" || feild == undefined;
            })
        ) {
            throw new ApiError(
                400,
                "Username, email, password and fullName is required"
            );
        }
    
        if (
            await User.findOne({
                $or: [{ username }, { email }],
            })
        ) {
            throw new ApiError(400, "Username or email is already registered");
        }
    
        const avatarLocalPath = req.files?.avatar[0]?.path;
        let coverImageLocalPath;
        if (
            req.files &&
            Array.isArray(req.files.coverImage) &&
            req.files.coverImage.length > 0
        ) {
            coverImageLocalPath = req.files?.coverImage[0]?.path;
        }
    
        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar is required");
        }
    
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        let coverImage = await uploadOnCloudinary(coverImageLocalPath);
    
        console.log(coverImage, coverImageLocalPath);
        const user = await User.create({
            username,
            email,
            password,
            fullName,
            avatar: avatar?.url,
            coverImage: coverImage?.url || "",
        });
    
        const userCreated = await User.findById(user._id).select(
            "-password -refreshToken"
        );
    
        if (!userCreated) {
            throw new ApiError(500, "Error happened while creating new user");
        }
    
        res.status(201).json(
            new ApiResponse(200, userCreated, "User created successfully!")
        );
    } catch (error) {
        console.log(error)
        const avatarLocalPath = req.files?.avatar[0]?.path;
        let coverImageLocalPath;
        if (
            req.files &&
            Array.isArray(req.files.coverImage) &&
            req.files.coverImage.length > 0
        ) {
            coverImageLocalPath = req.files?.coverImage[0]?.path;
        }

        unlink(coverImageLocalPath);
        unlink(avatarLocalPath);

        throw new ApiError(500, "Error happend in registering process avatar and coverImage has been deleted")
    }
});

const logInUser = asyncHandler(async (req, res) => {
    // Get username and password from request
    // check if user exists
    // check if password is correct
    // generate access token
    // generate refresh token
    // send response
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const passwordCorrect = await user.isPasswordCorrect(password);
    if (!passwordCorrect) {
        throw new ApiError(401, "Password is incorrect");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    user.password = undefined;
    user.refreshToken = undefined;

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user, accessToken, refreshToken },
                "User logged in successfully!"
            )
        );
});

const logOutUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    user.refreshToken = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully!"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const recivedRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!recivedRefreshToken) {
        throw new ApiError(404, "Refresh token not found!");
    }

    const decodedToken = jwt.verify(
        recivedRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    res.status(200)
        .cookie("accessToken", accessToken)
        .cookie("refreshToken", refreshToken)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "Refreshed Access Token!"
            )
        );
});

const updatePassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const { oldPassword, newPassword } = req.body;

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "User Entered incorrect password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(
        new ApiResponse(200, {}, "Password updated successfully!")
    );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!(fullName && email)) {
        throw new ApiError(400, "Full Name and Email is required");
    }

    user.fullName = fullName;
    user.email = email;

    user.save({ validateBeforeSave: false });

    res.status(200).json(
        new ApiResponse(
            200,
            { fullName, email },
            "Account details updated successfully!"
        )
    );
});

const getUser = asyncHandler(async (req, res) => {
    res.status(200).json(
        new ApiResponse(200, { user: req.user }, "User Info Sent Successfully!")
    );
});

const updateAvatar = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const avatarLocalPath = req.file.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(500, "Error happened while uploading avatar");
    }

    const response = deleteCloudinary(user.avatar);
    if (!response) {
        throw new ApiError(500, "Error happened while deleting old avatar");
    }

    user.avatar = avatar.url;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(
        new ApiResponse(
            200,
            { avatar: avatar.url },
            "Avatar updated successfully!"
        )
    );
});

const updateCoverImage = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const coverImageLocalPath = req.file.path;
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image is required");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage) {
        throw new ApiError(500, "Error happened while uploading cover image");
    }

    const response = deleteCloudinary(user.coverImage);
    if (!response) {
        throw new ApiError(500, "Error happened while deleting old coverImage");
    }

    user.coverImage = coverImage.url;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(
        new ApiResponse(
            200,
            { coverImage: coverImage.url },
            "Cover Image updated successfully!"
        )
    );
});

const getUserProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    console.log(username);
    const user = await User.findOne({ username });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username,
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "Subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "Subscription",
            },
        },
        {
            $project: {
                _id: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                fullName: 1,
                Subscribers: {
                    $size: "$Subscribers",
                },
                Subscription: {
                    $size: "$Subscription",
                },
            },
        },
    ]);


    res.status(200).json(
        new ApiResponse(
            200,
            { user, channel },
            "User Profile Info Sent Successfully!"
        )
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const watchHistory = await User.aggregate([
        {
            $match: {
                _id: req.user._id,
            },
        },
        {
            $lookup: {
                from: "video",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                        },
                    },
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            coverImage: 1,
                            fullName: 1,
                            owner: 1,
                            views: 1,
                        },
                    },
                ],
            },
        },
        
    ]);

    console.log(watchHistory);

    res.status(200).json(
        new ApiResponse(
            200,
            { watchHistory },
            "Watch History Sent Successfully!"
        )
    );
});

export {
    registerUser,
    logInUser,
    logOutUser,
    refreshAccessToken,
    updatePassword,
    updateAccountDetails,
    getUser,
    updateAvatar,
    updateCoverImage,
    getUserProfile,
    getWatchHistory,
};
