import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.isValidObjectId(videoId)) {
    return res.status(400).json({ message: "Invalid videoId format" });
  }

  let pageNumber = parseInt(page);
  let pageSize = parseInt(limit);

  if (isNaN(pageNumber) || pageNumber < 1) {
    throw new ApiError(400, "Invalid page number");
  }
  if (isNaN(pageSize) || pageSize < 1) {
    throw new ApiError(400, "Invalid limit");
  }

  const comment = await Comment.find({ video: videoId })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .populate({
      path: "video",
      select: "title",
    })
    .populate({
      path: "owner",
      select: "username fullName avatar",
    });

  if (!comment) {
    throw new ApiError(500, "Error while fetching comments");
  }

  const commnetCount = await Comment.countDocuments({ video: videoId });

  if (commnetCount === 0) {
    return res.status(404).json({ message: "No comments found" });
  }

  res
    .status(200)
    .json(new ApiResponse(200, comment, `${commnetCount} Comments fetched`));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!mongoose.isValidObjectId(videoId)) {
    return res.status(400).json({ message: "Invalid videoId format" });
  }

  if (content === "") {
    throw new ApiError(400, "Comment cannot be empty");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  if (!comment) {
    throw new ApiError(400, "Error while commenting");
  }

  return res.status(200).json(new ApiResponse(200, comment, "Comment success"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!mongoose.isValidObjectId(commentId)) {
    return res.status(400).json({ message: "Invalid videoId format" });
  }

  if (content === "") {
    throw new ApiError(400, "Comment cannot be empty");
  }

  const comment = await Comment.findByIdAndUpdate(
    {
      _id: commentId,
      content,
    },
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  )
    .populate({
      path: "video",
      select: "title",
    })
    .select("-createdAt");

  if (!comment) {
    throw new ApiError(404, "Comment not found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully!"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.isValidObjectId(commentId)) {
    return res.status(400).json({ message: "Invalid videoId format" });
  }

  const comment = await Comment.findByIdAndDelete({ _id: commentId });

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  return res.status(200).json(new ApiResponse(200, {}, "Comment Deleted!"));
});

export { addComment, getVideoComments, updateComment, deleteComment };
