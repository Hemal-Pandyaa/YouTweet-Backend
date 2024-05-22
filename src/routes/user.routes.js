import {
    logInUser,
    logOutUser,
    registerUser,
    refreshAccessToken,
    updatePassword,
    updateAccountDetails,
    getUser,
    updateAvatar,
    updateCoverImage,
    getUserProfile,
    getWatchHistory
} from "../controllers/user.controller.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);
router.route("/logIn").post(logInUser);
router.route("/logOut").post(verifyJWT, logOutUser);
router.route("/refreshAccessToken").post(refreshAccessToken);
router.route("/updatePassword").post(verifyJWT, updatePassword);
router.route("/updateAccountDetails").patch(verifyJWT, updateAccountDetails);
router.route("/getUser").get(verifyJWT, getUser);
router.route("/updateCoverImage").post(verifyJWT,  upload.single("coverImage"), updateCoverImage);
router.route("/updateAvatar").post(verifyJWT, upload.single("avatar"), updateAvatar);
router.route("/getUserProfile/:username").get(getUserProfile);    
router.route("/getWatchHistory").get(verifyJWT, getWatchHistory);

export default router;
