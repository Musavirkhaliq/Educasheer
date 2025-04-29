import { Router } from "express";
import {
    addVideoComment,
    addCourseComment,
    addBlogComment,
    addReply,
    getVideoComments,
    getCourseComments,
    getBlogComments,
    updateComment,
    deleteComment,
    likeComment
} from "../controllers/comment.controller.js";
import { varifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Video comments
router.route("/video/:videoId").get(getVideoComments);
router.route("/video/:videoId").post(varifyJWT, addVideoComment);

// Course comments
router.route("/course/:courseId").get(getCourseComments);
router.route("/course/:courseId").post(varifyJWT, addCourseComment);

// Blog comments
router.route("/blog/:blogId").get(getBlogComments);
router.route("/blog/:blogId").post(varifyJWT, addBlogComment);

// Replies
router.route("/reply/:commentId").post(varifyJWT, addReply);

// Comment operations
router.route("/:commentId").patch(varifyJWT, updateComment);
router.route("/:commentId").delete(varifyJWT, deleteComment);
router.route("/:commentId/like").post(varifyJWT, likeComment);

export default router;
