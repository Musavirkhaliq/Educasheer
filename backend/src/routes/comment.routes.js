import { Router } from "express";
import {
    addVideoComment,
    addCourseComment,
    addBlogComment,
    addProgramComment,
    addReply,
    getVideoComments,
    getCourseComments,
    getBlogComments,
    getProgramComments,
    updateComment,
    deleteComment,
    likeComment
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Video comments
router.route("/video/:videoId").get(getVideoComments);
router.route("/video/:videoId").post(verifyJWT, addVideoComment);

// Course comments
router.route("/course/:courseId").get(getCourseComments);
router.route("/course/:courseId").post(verifyJWT, addCourseComment);

// Blog comments
router.route("/blog/:blogId").get(getBlogComments);
router.route("/blog/:blogId").post(verifyJWT, addBlogComment);

// Program comments
router.route("/program/:programId").get(getProgramComments);
router.route("/program/:programId").post(verifyJWT, addProgramComment);

// Replies
router.route("/reply/:commentId").post(verifyJWT, addReply);

// Comment operations
router.route("/:commentId").patch(verifyJWT, updateComment);
router.route("/:commentId").delete(verifyJWT, deleteComment);
router.route("/:commentId/like").post(verifyJWT, likeComment);

export default router;
