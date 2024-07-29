import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // Validate channelId format
  if (!mongoose.isValidObjectId(channelId)) {
    return res.status(400).json({ message: "Invalid channelId format" });
  }

  try {
    const subscription = await Subscription.findOne({
      subscriber: req.user._id,
      channel: channelId,
    });

    if (subscription) {
      await Subscription.findByIdAndDelete(subscription._id);
    } else {
      await Subscription.create({
        subscriber: req.user._id,
        channel: channelId,
      });
    }

    const isSubscribed = !!(await Subscription.findOne({
      channel: channelId,
      subscriber: req.user._id,
    }));

    return res
      .status(200)
      .json(new ApiResponse(200, { issubscribed: isSubscribed }, "success"));
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.isValidObjectId(channelId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  const channelSubscribers = await Subscription.aggregate([
    { $match: { channel: new mongoose.Types.ObjectId(`${channelId}`) } },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        totalSubscriber: {
          $size: "$subscriber",
        },
      },
    },
    {
      $unwind: "$subscriber",
    },
    {
      $project: {
        subscriber: 1,
        totalSubscriber: 1,
        createdAt: 1,
      },
    },
  ]);

  if (channelSubscribers.length === 0) {
    return res.status(200).json({ message: "No subscriber found" });
  }
  return res
    .status(200)
    .json(new ApiResponse(200, channelSubscribers[0], "Subscriber fetched."));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!mongoose.isValidObjectId(subscriberId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  const channelsSubscribedTo = await Subscription.aggregate([
    { $match: { subscriber: new mongoose.Types.ObjectId(`${subscriberId}`) } },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        totalChannelSubscribed: {
          $size: "$channel",
        },
      },
    },
    {
      $unwind: "$channel",
    },
    {
      $project: {
        channel: 1,
        totalChannelSubscribed: 1,
      },
    },
  ]);

  if (channelsSubscribedTo.length === 0) {
    return res.status(200).json({ message: "No channel subscribed" });
  }
  return res
    .status(200)
    .json(new ApiResponse(200, channelsSubscribedTo[0], "channels fetched."));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
