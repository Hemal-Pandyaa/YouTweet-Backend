import { Router } from "express";
import {
    deleteVideo,
    getAllVideos,
    uploadVideo,
    getVideoById,
    updateVideoDetails,
    togglePublished,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/all").get(getAllVideos);
router.route("/upload").post(
    verifyJWT,
    upload.fields([
        {
            name: "video",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    uploadVideo
);
router.route("/delete/:videoId").get(verifyJWT, deleteVideo);
router.route("/video/:videoId").get(getVideoById);
router
    .route("/update/:videoId")
    .post(verifyJWT, upload.single("thumbnail"), updateVideoDetails);

router.route("/togglePublished/:videoId").post(verifyJWT, togglePublished);

export default router;
