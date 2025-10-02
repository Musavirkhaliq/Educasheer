import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getCart,
    addToCart,
    removeFromCart,
    clearCart
} from "../controllers/cart.controller.js";

const router = Router();

// All cart routes require authentication
router.use(verifyJWT);

router.route("/").get(getCart);
router.route("/add").post(addToCart);
router.route("/remove").post(removeFromCart);
router.route("/clear").post(clearCart);

export default router;