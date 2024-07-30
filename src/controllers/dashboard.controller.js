import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const videoViews = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      $group: {
        _id: null,
        totalViews: { $sum: "$views" },
      },
    },
  ]);
  const totalVideoViews = videoViews ? videoViews[0]?.totalViews : 0; //counts total video views
  const subscribers = await Subscription.countDocuments({ channel: userId }); //counts total subscriber of user's channel
  const totalVideos = await Video.countDocuments({ owner: userId }); //counts total video uploaded by user

  const videoId = await Video.find({ owner: userId }).distinct("_id");
  const totalLikes = await Like.countDocuments({ video: { $in: videoId } }); // counts total likes on video uploaded by user

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalVideoViews, subscribers, totalVideos, totalLikes },
        "success"
      )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const videos = await Video.find({ owner: userId });

  if (videos.length === 0) {
    return res.status(200).json({ message: "No videos found" });
  }

  const countVideo = await Video.countDocuments({ owner: userId });

  return res
    .status(200)
    .json(new ApiResponse(200, videos, `Total videos uploaded: ${countVideo}`));
});

export { getChannelStats, getChannelVideos };
