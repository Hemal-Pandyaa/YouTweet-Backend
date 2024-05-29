import { Router } from "express";
import {
    createPlaylist,
    updatePlaylistById,
    getPlaylistById,
    getUserPlaylist,
    addVideosToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/create").post(verifyJWT, createPlaylist);
router.route("/update/:playlistId").patch(verifyJWT, updatePlaylistById);
router.route("/get/:playlistId").get(verifyJWT, getPlaylistById);
router.route("/getUser/:userId").get(verifyJWT, getUserPlaylist);
router.route("/addVideos/:playlistId").patch(verifyJWT, addVideosToPlaylist);
router.route("/removeVideos/:playlistId").delete(verifyJWT, removeVideoFromPlaylist);
router.route("/delete/:playlistId").delete(verifyJWT, deletePlaylist);
export default router;
