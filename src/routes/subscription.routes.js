import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/:channelId").post(toggleSubscription);
router.route("/channel-subs/:channelId").get(getUserChannelSubscribers);
router.route("/subscribed-channels/:subscriberId").get(getSubscribedChannels);

export default router;
