import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/FileUpload.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  let pageNumber = parseInt(page);
  let pageSize = parseInt(limit);

  if (isNaN(pageNumber) || pageNumber < 1) {
    throw new ApiError(400, "Invalid page number");
  }
  if (isNaN(pageSize) || pageSize < 1) {
    throw new ApiError(400, "Invalid limit");
  }

  let filter = {};
  if (query) {
    filter = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    };
  }

  if (userId) {
    if (mongoose.isValidObjectId(userId)) {
      filter.owner = userId;
    } else {
      return res.status(400).json({ message: "Invalid userId format" });
    }
  }

  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortType === "asc" ? 1 : -1;
  }

  const videos = await Video.find(filter)
    .sort(sort)
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize);

  if (!videos) {
    throw new ApiError(500, "Error while fetching videos");
  }

  const videoCount = await Video.countDocuments(filter);

  if (videoCount === 0) {
    return res.status(404).json({ message: "No videos found" });
  }

  res
    .status(200)
    .json(new ApiResponse(200, { videos, videoCount }, "videos fetched"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // get video, upload to cloudinary, create video

  if (!title || !description) {
    throw new ApiError(401, "title or description is missing");
  }

  if (!req.files?.videoFile) {
    throw new ApiError(400, "No video file uploaded!");
  }

  if (!req.files?.thumbnail) {
    throw new ApiError(400, "Thumbnail is missing!");
  }

  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  const publishedVideo = await uploadOnCloudinary(videoLocalPath);
  const publishedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!publishedVideo || !publishedThumbnail) {
    throw new ApiError(400, "Error while uploading ");
  }

  const video = await Video.create({
    title,
    description,
    videoFile: publishedVideo.url,
    thumbnail: publishedThumbnail.url,
    duration: publishedVideo.duration,
    owner: req.user._id,
  });

  res
    .status(200)
    .json(new ApiResponse(200, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  try {
    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    res.status(200).json(new ApiResponse(200, video, "Video fetched"));
  } catch (error) {
    return res.status(404).json({ message: "Video not found" });
  }
});

const updateVideo = asyncHandler(async (req, res) => {
  //update video details like title, description, thumbnail
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!mongoose.isValidObjectId(videoId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  if (!title || !description) {
    throw new ApiError(400, "Title & description is required");
  }

  let thumbnail;
  const thumbnailLocalPath = req.file?.path;

  if (thumbnailLocalPath) {
    // throw new ApiError(400, "Please upload Thumbnail")
    thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  }

  try {
    const video = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          title,
          description,
          thumbnail: thumbnail.url,
        },
      },
      { new: true }
    ).select("title description thumbnail");

    if (!video) {
      throw new ApiError(400, "Error while updating.");
    }

    res
      .status(200)
      .json(new ApiResponse(200, video, "Details updated successfully"));
  } catch (error) {
    return res.status(404).json({ message: "Video not found" });
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  //delete video
  const { videoId } = req.params;

  try {
    await Video.findByIdAndDelete(videoId);

    res.status(200).json(new ApiResponse(200, {}, "Video Deleted"));
  } catch (error) {
    throw new ApiError(400, "Error deleting video: Check if videoId is valid");
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  try {
    const video = await Video.findById(videoId);

    video.isPublished = !video.isPublished;
    await video.save();

    return res.json(
      new ApiResponse(200, video, `PublishedStatus = ${video.isPublished}`)
    );
  } catch (error) {
    throw new ApiError(
      400,
      "Error (un)publishing video: *either videoId is invalid or video file is deleted*"
    );
  }
});
export {
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getAllVideos,
};
