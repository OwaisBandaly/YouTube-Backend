import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/new-playlist").post(createPlaylist);
router.route("/all-playlists/:userId").get(getUserPlaylists);
router.route("/playlist-id/:playlistId").get(getPlaylistById);
router.route("/add-video/:playlistId/:videoId").post(addVideoToPlaylist);
router
  .route("/remove-video/:playlistId/:videoId")
  .patch(removeVideoFromPlaylist);
router.route("/update/:playlistId").patch(updatePlaylist);
router.route("/delete-playlist/:playlistId").delete(deletePlaylist);

export default router;
