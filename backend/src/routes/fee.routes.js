import { Router } from "express";
import {
    createFee,
    getAllFees,
    getUserFees,
    updateFeeStatus,
    recordPayment,
    getFeePayments,
    generateInvoice,
    getAllInvoices,
    getInvoiceById
} from "../controllers/fee.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Fee routes
router.route("/").post(createFee);
router.route("/").get(getAllFees);
router.route("/user/:userId").get(getUserFees);
router.route("/:feeId/status").patch(updateFeeStatus);

// Payment routes
router.route("/payment").post(recordPayment);
router.route("/:feeId/payments").get(getFeePayments);

// Invoice routes
router.route("/invoice").post(generateInvoice);
router.route("/invoices").get(getAllInvoices);
router.route("/invoice/:invoiceId").get(getInvoiceById);

export default router;
