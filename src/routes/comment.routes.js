import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/new-comment/:videoId").post(addComment);
router.route("/all-comments/:videoId").get(getVideoComments);
router.route("/update/:commentId").patch(updateComment);
router.route("/delete/:commentId").delete(deleteComment);
export default router;
