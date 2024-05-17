import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res) => {
    //* Register user
    // Get user details from request.body
    // validate information
    // check if user is already registered with same username or email address
    // Send information on cloudinary server
    // create new user's db entry
    // confirm user has been registered
    // send response
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
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        console.log("Conditional")
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
});

export { registerUser };
