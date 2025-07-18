import mongoose, { Schema } from "mongoose";

// Schema for individual seats in a center
const seatSchema = new Schema({
    seatNumber: {
        type: String,
        required: false, // Generated automatically in controller
        trim: true
    },
    center: {
        type: Schema.Types.ObjectId,
        ref: "Center",
        required: true
    },
    row: {
        type: String,
        required: true,
        trim: true // e.g., "A", "B", "C"
    },
    column: {
        type: Number,
        required: true // e.g., 1, 2, 3
    },
    seatType: {
        type: String,
        enum: ["regular", "premium", "vip"],
        default: "regular"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    facilities: [{
        type: String // e.g., "power_outlet", "wifi", "desk_lamp"
    }],
    notes: {
        type: String,
        trim: true
    },
    qrCode: {
        type: String, // Base64 encoded QR code image
        required: false
    },
    qrCodeData: {
        type: String, // JSON string containing seat info for QR code
        required: false
    }
}, {
    timestamps: true
});

// Schema for time slots
const timeSlotSchema = new Schema({
    center: {
        type: Schema.Types.ObjectId,
        ref: "Center",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true // e.g., "Morning Session", "Afternoon Session"
    },
    startTime: {
        type: String,
        required: true // e.g., "09:00"
    },
    endTime: {
        type: String,
        required: true // e.g., "12:00"
    },
    daysOfWeek: [{
        type: String,
        enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        required: true
    }],
    maxBookingDuration: {
        type: Number,
        default: 180 // in minutes, default 3 hours
    },
    isActive: {
        type: Boolean,
        default: true
    },
    price: {
        type: Number,
        default: 0 // price per hour
    }
}, {
    timestamps: true
});

// Schema for seat bookings
const seatBookingSchema = new Schema({
    seat: {
        type: Schema.Types.ObjectId,
        ref: "Seat",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    timeSlot: {
        type: Schema.Types.ObjectId,
        ref: "TimeSlot",
        required: false // Made optional since time slot is not needed
    },
    bookingDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true // e.g., "09:00"
    },
    endTime: {
        type: String,
        required: true // e.g., "12:00"
    },
    duration: {
        type: Number,
        required: true // in minutes
    },
    status: {
        type: String,
        enum: ["confirmed", "cancelled", "completed", "no_show"],
        default: "confirmed"
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "refunded"],
        default: "pending"
    },
    bookingNotes: {
        type: String,
        trim: true
    },
    checkedIn: {
        type: Boolean,
        default: false
    },
    checkedInAt: {
        type: Date
    },
    checkedOut: {
        type: Boolean,
        default: false
    },
    checkedOutAt: {
        type: Date
    },
    cancelledAt: {
        type: Date
    },
    cancellationReason: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Compound indexes for better query performance
seatSchema.index({ center: 1, seatNumber: 1 }, { unique: true });
seatSchema.index({ center: 1, row: 1, column: 1 });
timeSlotSchema.index({ center: 1, name: 1 });
seatBookingSchema.index({ seat: 1, bookingDate: 1, startTime: 1, endTime: 1 });
seatBookingSchema.index({ user: 1, bookingDate: 1 });
seatBookingSchema.index({ bookingDate: 1, status: 1 });

// Virtual for seat display name
seatSchema.virtual('displayName').get(function() {
    return `${this.row}${this.column}`;
});

// Virtual for booking duration in hours
seatBookingSchema.virtual('durationHours').get(function() {
    return Math.round((this.duration / 60) * 100) / 100;
});

// Pre-save middleware to generate seat number if not provided
seatSchema.pre('save', function(next) {
    if (!this.seatNumber) {
        // If no seatNumber provided, use row+column as fallback
        this.seatNumber = `${this.row}${this.column}`;
    }
    next();
});

// Pre-save middleware to calculate total amount
seatBookingSchema.pre('save', async function(next) {
    if (this.isModified('duration') || this.isModified('timeSlot')) {
        try {
            const timeSlot = await mongoose.model('TimeSlot').findById(this.timeSlot);
            if (timeSlot && timeSlot.price > 0) {
                const hours = this.duration / 60;
                this.totalAmount = Math.round(hours * timeSlot.price * 100) / 100;
            }
        } catch (error) {
            console.error('Error calculating booking amount:', error);
        }
    }
    next();
});

export const Seat = mongoose.model('Seat', seatSchema);
export const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);
export const SeatBooking = mongoose.model('SeatBooking', seatBookingSchema);
