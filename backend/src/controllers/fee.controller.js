import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Fee } from "../models/fee.model.js";
import { Payment } from "../models/payment.model.js";
import { Invoice } from "../models/invoice.model.js";
import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import mongoose from "mongoose";

// Create a new fee for a user
const createFee = asyncHandler(async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized access. Only admins can create fees");
        }

        const { userId, courseId, amount, dueDate, description } = req.body;

        if (!userId || !courseId || !amount || !dueDate) {
            throw new ApiError(400, "User ID, Course ID, Amount, and Due Date are required");
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        // Check if user is enrolled in the course
        if (!course.enrolledStudents.includes(userId)) {
            throw new ApiError(400, "User is not enrolled in this course");
        }

        // Check if fee already exists for this user and course
        const existingFee = await Fee.findOne({ user: userId, course: courseId });
        if (existingFee) {
            throw new ApiError(400, "Fee already exists for this user and course");
        }

        // Create new fee
        const fee = await Fee.create({
            user: userId,
            course: courseId,
            amount,
            dueDate: new Date(dueDate),
            description: description || "",
            createdBy: req.user._id
        });

        return res.status(201).json(
            new ApiResponse(201, fee, "Fee created successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while creating fee");
    }
});

// Get all fees (admin only)
const getAllFees = asyncHandler(async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized access. Only admins can view all fees");
        }

        const { status, userId, courseId } = req.query;
        const filter = {};

        // Filter by status if provided
        if (status) {
            filter.status = status;
        }

        // Filter by user if provided
        if (userId) {
            filter.user = userId;
        }

        // Filter by course if provided
        if (courseId) {
            filter.course = courseId;
        }

        const fees = await Fee.find(filter)
            .populate("user", "fullName username email avatar")
            .populate("course", "title slug")
            .populate("createdBy", "fullName username")
            .sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(200, fees, "Fees retrieved successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while retrieving fees");
    }
});

// Get fees for a specific user
const getUserFees = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if user is admin or the user themselves
        if (req.user.role !== "admin" && req.user._id.toString() !== userId) {
            throw new ApiError(403, "Unauthorized access");
        }

        const fees = await Fee.find({ user: userId })
            .populate("course", "title slug thumbnail")
            .sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(200, fees, "User fees retrieved successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while retrieving user fees");
    }
});

// Update fee status
const updateFeeStatus = asyncHandler(async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized access. Only admins can update fee status");
        }

        const { feeId } = req.params;
        const { status } = req.body;

        if (!status || !["pending", "partial", "paid"].includes(status)) {
            throw new ApiError(400, "Valid status is required (pending, partial, or paid)");
        }

        const fee = await Fee.findByIdAndUpdate(
            feeId,
            { status },
            { new: true }
        ).populate("user", "fullName username email");

        if (!fee) {
            throw new ApiError(404, "Fee not found");
        }

        return res.status(200).json(
            new ApiResponse(200, fee, "Fee status updated successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while updating fee status");
    }
});

// Record a payment
const recordPayment = asyncHandler(async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized access. Only admins can record payments");
        }

        const { feeId, amount, paymentMethod, paymentDate, transactionId, notes } = req.body;

        if (!feeId || !amount) {
            throw new ApiError(400, "Fee ID and Amount are required");
        }

        // Check if fee exists
        const fee = await Fee.findById(feeId).populate("user", "fullName username email");
        if (!fee) {
            throw new ApiError(404, "Fee not found");
        }

        // Create payment record
        const payment = await Payment.create({
            user: fee.user._id,
            fee: feeId,
            amount,
            paymentMethod: paymentMethod || "cash",
            paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
            transactionId,
            notes,
            recordedBy: req.user._id
        });

        // Calculate total payments for this fee
        const payments = await Payment.find({ fee: feeId });
        const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

        // Update fee status based on payment
        let newStatus = "pending";
        if (totalPaid >= fee.amount) {
            newStatus = "paid";
        } else if (totalPaid > 0) {
            newStatus = "partial";
        }

        // Update fee status
        fee.status = newStatus;
        await fee.save();

        return res.status(201).json(
            new ApiResponse(201, { payment, feeStatus: newStatus }, "Payment recorded successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while recording payment");
    }
});

// Get payments for a fee
const getFeePayments = asyncHandler(async (req, res) => {
    try {
        const { feeId } = req.params;

        // Check if user is admin or the fee belongs to the user
        const fee = await Fee.findById(feeId);
        if (!fee) {
            throw new ApiError(404, "Fee not found");
        }

        if (req.user.role !== "admin" && fee.user.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "Unauthorized access");
        }

        const payments = await Payment.find({ fee: feeId })
            .populate("recordedBy", "fullName username")
            .sort({ paymentDate: -1 });

        return res.status(200).json(
            new ApiResponse(200, payments, "Fee payments retrieved successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while retrieving fee payments");
    }
});

// Generate invoice
const generateInvoice = asyncHandler(async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized access. Only admins can generate invoices");
        }

        const { feeId, notes } = req.body;

        if (!feeId) {
            throw new ApiError(400, "Fee ID is required");
        }

        // Check if fee exists
        const fee = await Fee.findById(feeId)
            .populate("user", "fullName username email")
            .populate("course", "title");
        
        if (!fee) {
            throw new ApiError(404, "Fee not found");
        }

        // Get all payments for this fee
        const payments = await Payment.find({ fee: feeId });
        const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const balance = fee.amount - totalPaid;

        // Generate invoice number
        const invoiceNumber = await Invoice.generateInvoiceNumber();

        // Create invoice
        const invoice = await Invoice.create({
            invoiceNumber,
            user: fee.user._id,
            fee: feeId,
            payments: payments.map(payment => payment._id),
            totalAmount: fee.amount,
            amountPaid: totalPaid,
            balance,
            dueDate: fee.dueDate,
            status: balance <= 0 ? "paid" : "issued",
            notes,
            createdBy: req.user._id
        });

        // Populate the invoice with related data
        const populatedInvoice = await Invoice.findById(invoice._id)
            .populate("user", "fullName username email")
            .populate("fee", "amount dueDate description")
            .populate({
                path: "fee",
                populate: {
                    path: "course",
                    select: "title"
                }
            })
            .populate("payments");

        return res.status(201).json(
            new ApiResponse(201, populatedInvoice, "Invoice generated successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while generating invoice");
    }
});

// Get all invoices (admin only)
const getAllInvoices = asyncHandler(async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Unauthorized access. Only admins can view all invoices");
        }

        const { status, userId } = req.query;
        const filter = {};

        // Filter by status if provided
        if (status) {
            filter.status = status;
        }

        // Filter by user if provided
        if (userId) {
            filter.user = userId;
        }

        const invoices = await Invoice.find(filter)
            .populate("user", "fullName username email avatar")
            .populate("fee", "amount description")
            .populate({
                path: "fee",
                populate: {
                    path: "course",
                    select: "title"
                }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(200, invoices, "Invoices retrieved successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while retrieving invoices");
    }
});

// Get invoice by ID
const getInvoiceById = asyncHandler(async (req, res) => {
    try {
        const { invoiceId } = req.params;

        const invoice = await Invoice.findById(invoiceId)
            .populate("user", "fullName username email avatar")
            .populate("fee", "amount dueDate description")
            .populate({
                path: "fee",
                populate: {
                    path: "course",
                    select: "title"
                }
            })
            .populate({
                path: "payments",
                populate: {
                    path: "recordedBy",
                    select: "fullName username"
                }
            });

        if (!invoice) {
            throw new ApiError(404, "Invoice not found");
        }

        // Check if user is admin or the invoice belongs to the user
        if (req.user.role !== "admin" && invoice.user._id.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "Unauthorized access");
        }

        return res.status(200).json(
            new ApiResponse(200, invoice, "Invoice retrieved successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while retrieving invoice");
    }
});

export {
    createFee,
    getAllFees,
    getUserFees,
    updateFeeStatus,
    recordPayment,
    getFeePayments,
    generateInvoice,
    getAllInvoices,
    getInvoiceById
};
