import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createOrder,
    processPaymentSuccess,
    getUserOrders,
    getOrderDetails,
    verifyRazorpayPayment,
    verifyStripePayment,
    handleRazorpayWebhook,
    handleStripeWebhook,
    getPaymentGatewayStatus,
    generateReceiptPDF,
    generateReceiptPreview
} from "../controllers/payment.controller.js";

const router = Router();

// Webhook routes (no authentication required)
router.route("/webhook/razorpay").post(handleRazorpayWebhook);
router.route("/webhook/stripe").post(handleStripeWebhook);

// Status route (no authentication required for health checks)
router.route("/status").get(getPaymentGatewayStatus);

// All other payment routes require authentication
router.use(verifyJWT);

router.route("/create-order").post(createOrder);
router.route("/success").post(processPaymentSuccess);
router.route("/verify/razorpay").post(verifyRazorpayPayment);
router.route("/verify/stripe").post(verifyStripePayment);
router.route("/orders").get(getUserOrders);
router.route("/orders/:orderId").get(getOrderDetails);
router.route("/orders/:orderId/receipt").get(generateReceiptPDF);
router.route("/orders/:orderId/receipt/preview").get(generateReceiptPreview);

export default router;