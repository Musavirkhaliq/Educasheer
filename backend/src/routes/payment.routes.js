import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createOrder,
    processPaymentSuccess,
    getUserOrders,
    getOrderDetails
} from "../controllers/payment.controller.js";

const router = Router();

// All payment routes require authentication
router.use(verifyJWT);

router.route("/create-order").post(createOrder);
router.route("/success").post(processPaymentSuccess);
router.route("/orders").get(getUserOrders);
router.route("/orders/:orderId").get(getOrderDetails);

export default router;