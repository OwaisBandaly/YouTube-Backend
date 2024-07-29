import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content field is required!");
  }

  const tweet = await Tweet.create({ content, owner: req.user._id });

  if (!tweet) {
    throw new ApiError(500, "Error while creating tweet");
  }

  return res.status(200).json(new ApiResponse(200, tweet, "New tweet created"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  const tweet = await Tweet.find({ owner: userId });

  if (!tweet) {
    throw new ApiError(404, "No tweets found!");
  }

  const tweetsCount = await Tweet.countDocuments(tweet);

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, `${tweetsCount} tweets found`));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!mongoose.isValidObjectId(tweetId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  if (!content) {
    throw new ApiError(400, "Content field is required");
  }

  const tweet = await Tweet.findByIdAndUpdate(
    { _id: tweetId },
    { $set: { content } },
    { new: true }
  ).select("-createdAt");

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.isValidObjectId(tweetId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  const tweet = await Tweet.findByIdAndDelete({ _id: tweetId });

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  return res.status(200).json(new ApiResponse(200, {}, "Tweet Deleted"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
