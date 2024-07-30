import { Router } from "express";
import {
  updateAccountDetails,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  getCurrentUser,
  changeUserPassword,
  getUserChannelProfile,
  userWatchHistory,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/update").patch(verifyJWT, updateAccountDetails);
router.route("/change-avatar").patch(upload.single("avatar"), updateUserAvatar);
router
  .route("/change-cover")
  .patch(upload.single("coverImage"), updateUserCoverImage);
router.route("/getuser").get(verifyJWT, getCurrentUser);
router.route("/changepassword").patch(verifyJWT, changeUserPassword);
router.route("/channel").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, userWatchHistory);

export default router;
