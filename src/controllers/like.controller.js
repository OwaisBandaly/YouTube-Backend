import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    return res.status(400).json({ message: "Invalid videoId format" });
  }

  const isliked = await Like.findOne({
    likedBy: req.user._id,
    video: videoId,
  });

  if (!isliked) {
    await Like.create({
      likedBy: req.user._id,
      video: videoId,
    });
  } else {
    await Like.findByIdAndDelete(isliked._id);
  }

  const liked = !!(await Like.findOne({
    likedBy: req.user._id,
    video: videoId,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, { isliked: liked }, "success"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.isValidObjectId(commentId)) {
    return res.status(400).json({ message: "Invalid commentId format" });
  }

  const isliked = await Like.findOne({
    likedBy: req.user._id,
    comment: commentId,
  });

  if (!isliked) {
    await Like.create({
      likedBy: req.user._id,
      comment: commentId,
    });
  } else {
    await Like.findByIdAndDelete(isliked._id);
  }

  const liked = !!(await Like.findOne({
    likedBy: req.user._id,
    comment: commentId,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, { isliked: liked }, "success"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.isValidObjectId(tweetId)) {
    return res.status(400).json({ message: "Invalid commentId format" });
  }

  const isliked = await Like.findOne({
    likedBy: req.user._id,
    tweet: tweetId,
  });

  if (!isliked) {
    await Like.create({
      likedBy: req.user._id,
      tweet: tweetId,
    });
  } else {
    await Like.findByIdAndDelete(isliked._id);
  }

  const liked = !!(await Like.findOne({
    likedBy: req.user._id,
    tweet: tweetId,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, { isliked: liked }, "success"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.find({
    likedBy: req.user._id,
    video: { $exists: true, $ne: null },
  }).populate("video");

  if (!likedVideos) {
    throw new ApiError(400, "error while fetching liked videos");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        likedVideos[0],
        `${req.user.username} liked videos fetched`
      )
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
