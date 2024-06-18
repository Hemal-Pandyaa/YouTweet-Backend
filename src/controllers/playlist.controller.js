import { Playlist } from "../models/playlist.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, videos } = req.body;

    if (!(name || description)) {
        throw new ApiError(400, "Name and Description is required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        videos,
        owner: req.user._id,
    });

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist created successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!playlistId) {
        throw new ApiError(404, "Playlist not found");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    );
});

const updatePlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!playlistId) {
        throw new ApiError(404, "Playlist not found");
    }

    const { title, description } = req.body;
    if (!(title || description)) {
        throw new ApiError(400, "Title and Description is required");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    playlist.title = title;
    playlist.description = description;
    playlist.save();

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist updated successfully")
    );
});

const getUserPlaylist = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError(404, "User not found");
    }

    const playlists = await Playlist.find({
        owner: userId,
    });

    res.status(200).json(
        new ApiResponse(200, playlists, "Playlist fetched successfully")
    );
});

const addVideosToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!playlistId) {
        throw new ApiError(404, "Playlist not found");
    }

    const { videos } = req.body;
    if (!videos) {
        throw new ApiError(400, "Videos is required");
    }

    const playlist = await Playlist.findById(playlistId);
    videos.forEach((video) => {
        if (playlist.videos.indexOf(video) === -1) {
            playlist.videos.push(video);
        }
    });

    playlist.save();

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist updated successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!playlistId) {
        throw new ApiError(404, "Playlist not found");
    }

    const { videoId } = req.body;
    if (!videoId) {
        throw new ApiError(400, "Video is required");
    }

    const playlist = await Playlist.findById(playlistId);
    const index = playlist.videos.indexOf(videoId);
    if (index == -1) {
        throw new ApiError(404, "Video not found in playlist");
    }

    playlist.videos.pop(index);
    playlist.save();

    res.status(200).json(
        new ApiResponse(200, playlist, "Video remove successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!playlistId) {
        throw new ApiError(404, "Playlist not found");
    }
    const playlist = await Playlist.findByIdAndDelete(playlistId);

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist deleted successfully")
    );
});

export {
    createPlaylist,
    getPlaylistById,
    updatePlaylistById,
    getUserPlaylist,
    addVideosToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
};
