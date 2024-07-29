import mongoose from "mongoose";
import { PlayList } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    throw new ApiError(400, "Name is required to create playlist!");
  }

  const playlist = await PlayList.create({
    name,
    description,
  });

  if (!playlist) {
    throw new ApiError(500, "Error while creating playlist");
  }

  playlist.owner = req.user?._id;
  await playlist.save();

  res.status(200).json(new ApiResponse(200, playlist, "playList created!"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  const playlist = await PlayList.find({ owner: userId });

  if (!playlist?.length) {
    throw new ApiError(400, "playlist not found");
  }

  const countPlaylists = await PlayList.countDocuments(playlist);

  res
    .status(200)
    .json(new ApiResponse(200, playlist, `${countPlaylists} Playlist fetched`));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!mongoose.isValidObjectId(playlistId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  const playlist = await PlayList.find({ _id: playlistId });

  if (!playlist?.length) {
    throw new ApiError(400, "playlist not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, playlist[0], `${playlist[0].name} Playlist fetched`)
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (
    !mongoose.isValidObjectId(playlistId) ||
    !mongoose.isValidObjectId(videoId)
  ) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  const playlist = await PlayList.findById(playlistId);

  if (!playlist) {
    throw new ApiError(400, "playlist not found");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "video not found");
  }

  if (playlist?.videos?.includes(videoId)) {
    return res.status(400).json({ message: "Video already in the playlist" });
  }

  playlist.videos.push(videoId);
  await playlist.save();

  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video added to playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (
    !mongoose.isValidObjectId(playlistId) ||
    !mongoose.isValidObjectId(videoId)
  ) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  // const playlist = await PlayList.findById(playlistId);
  // const video = await Video.findById(videoId);

  // if (!playlist || !video) {
  //   throw new ApiError(400, "playlist or video is incorrect");
  // }

  const playlist = await PlayList.findOneAndUpdate(
    { _id: playlistId },
    { $pull: { videos: videoId } },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(400, "playlist not found!");
  }

  // await PlayList.updateOne({ _id: playlistId }, { $pull: { videos: videoId } });

  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video deleted from playlist"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!mongoose.isValidObjectId(playlistId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  if (!name) {
    throw new ApiError(400, "Name filed is required");
  }

  const playlist = await PlayList.findByIdAndUpdate(
    { _id: playlistId },
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  ).select("name description updatedAt owner");

  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist details updated!"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!mongoose.isValidObjectId(playlistId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  const playlist = await PlayList.findByIdAndDelete({ _id: playlistId });

  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully!"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
  deletePlaylist,
};
