import { Router } from "express";
import {
    createBlog,
    getAllBlogs,
    getBlogBySlug,
    getBlogById,
    updateBlog,
    deleteBlog,
    getBlogsByAuthor,
    getMyBlogs,
    addBlogComment,
    getBlogComments
} from "../controllers/blog.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllBlogs);
router.route("/slug/:slug").get(getBlogBySlug);

// Protected routes (require authentication)
router.route("/").post(verifyJWT, upload.single("thumbnail"), createBlog);
router.route("/my/blogs").get(verifyJWT, getMyBlogs);
router.route("/author/:userId").get(getBlogsByAuthor);

// Blog comments
router.route("/:blogId/comments").get(getBlogComments);
router.route("/:blogId/comments").post(verifyJWT, addBlogComment);

// Routes with parameters (must be after specific routes)
router.route("/:blogId").get(verifyJWT, getBlogById);
router.route("/:blogId").patch(verifyJWT, upload.single("thumbnail"), updateBlog);
router.route("/:blogId").delete(verifyJWT, deleteBlog);

export default router;
