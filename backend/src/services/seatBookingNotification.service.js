import { SeatBooking } from "../models/seat.model.js";
import { User } from "../models/user.model.js";

// Notification service for seat booking events
export class SeatBookingNotificationService {
    
    // Send booking confirmation notification
    static async sendBookingConfirmation(bookingId) {
        try {
            const booking = await SeatBooking.findById(bookingId)
                .populate("user", "fullName email")
                .populate("seat", "seatNumber")
                .populate({
                    path: "seat",
                    populate: {
                        path: "center",
                        select: "name location contactPhone contactEmail"
                    }
                })
                .populate("timeSlot", "name startTime endTime");

            if (!booking) {
                console.error("Booking not found for confirmation:", bookingId);
                return;
            }

            const notificationData = {
                type: "booking_confirmation",
                user: booking.user,
                booking: {
                    id: booking._id,
                    seatNumber: booking.seat.seatNumber,
                    centerName: booking.seat.center.name,
                    centerLocation: booking.seat.center.location,
                    date: booking.bookingDate.toLocaleDateString(),
                    startTime: this.formatTime(booking.startTime),
                    endTime: this.formatTime(booking.endTime),
                    timeSlotName: booking.timeSlot.name,
                    totalAmount: booking.totalAmount,
                    contactPhone: booking.seat.center.contactPhone,
                    contactEmail: booking.seat.center.contactEmail
                }
            };

            // Here you would integrate with your preferred notification service
            // For example: email service, SMS service, push notifications, etc.
            console.log("Booking confirmation notification:", notificationData);
            
            // Example: Send email (you would implement actual email sending)
            await this.sendEmail(
                booking.user.email,
                "Seat Booking Confirmation",
                this.generateBookingConfirmationEmail(notificationData.booking)
            );

        } catch (error) {
            console.error("Error sending booking confirmation:", error);
        }
    }

    // Send booking cancellation notification
    static async sendBookingCancellation(bookingId, cancellationReason) {
        try {
            const booking = await SeatBooking.findById(bookingId)
                .populate("user", "fullName email")
                .populate("seat", "seatNumber")
                .populate({
                    path: "seat",
                    populate: {
                        path: "center",
                        select: "name location"
                    }
                });

            if (!booking) {
                console.error("Booking not found for cancellation:", bookingId);
                return;
            }

            const notificationData = {
                type: "booking_cancellation",
                user: booking.user,
                booking: {
                    id: booking._id,
                    seatNumber: booking.seat.seatNumber,
                    centerName: booking.seat.center.name,
                    date: booking.bookingDate.toLocaleDateString(),
                    startTime: this.formatTime(booking.startTime),
                    endTime: this.formatTime(booking.endTime),
                    cancellationReason
                }
            };

            console.log("Booking cancellation notification:", notificationData);
            
            // Send cancellation email
            await this.sendEmail(
                booking.user.email,
                "Seat Booking Cancelled",
                this.generateBookingCancellationEmail(notificationData.booking)
            );

        } catch (error) {
            console.error("Error sending booking cancellation:", error);
        }
    }

    // Send booking reminder (to be called by a scheduled job)
    static async sendBookingReminders() {
        try {
            // Find bookings that start in the next 2 hours
            const reminderTime = new Date();
            reminderTime.setHours(reminderTime.getHours() + 2);
            
            const upcomingBookings = await SeatBooking.find({
                bookingDate: {
                    $gte: new Date().setHours(0, 0, 0, 0),
                    $lte: new Date().setHours(23, 59, 59, 999)
                },
                status: "confirmed",
                checkedIn: false
            })
            .populate("user", "fullName email")
            .populate("seat", "seatNumber")
            .populate({
                path: "seat",
                populate: {
                    path: "center",
                    select: "name location"
                }
            });

            for (const booking of upcomingBookings) {
                const bookingDateTime = new Date(booking.bookingDate);
                const [hours, minutes] = booking.startTime.split(':').map(Number);
                bookingDateTime.setHours(hours, minutes);

                // Check if booking starts within the next 2 hours
                if (bookingDateTime <= reminderTime && bookingDateTime > new Date()) {
                    await this.sendBookingReminder(booking);
                }
            }

        } catch (error) {
            console.error("Error sending booking reminders:", error);
        }
    }

    // Send individual booking reminder
    static async sendBookingReminder(booking) {
        try {
            const notificationData = {
                type: "booking_reminder",
                user: booking.user,
                booking: {
                    id: booking._id,
                    seatNumber: booking.seat.seatNumber,
                    centerName: booking.seat.center.name,
                    centerLocation: booking.seat.center.location,
                    date: booking.bookingDate.toLocaleDateString(),
                    startTime: this.formatTime(booking.startTime),
                    endTime: this.formatTime(booking.endTime)
                }
            };

            console.log("Booking reminder notification:", notificationData);
            
            // Send reminder email
            await this.sendEmail(
                booking.user.email,
                "Seat Booking Reminder",
                this.generateBookingReminderEmail(notificationData.booking)
            );

        } catch (error) {
            console.error("Error sending booking reminder:", error);
        }
    }

    // Format time string for display
    static formatTime(timeString) {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    // Mock email sending function (replace with actual email service)
    static async sendEmail(to, subject, content) {
        // This is a placeholder - integrate with your email service
        // Examples: SendGrid, AWS SES, Nodemailer, etc.
        console.log(`Email sent to ${to}:`);
        console.log(`Subject: ${subject}`);
        console.log(`Content: ${content}`);
        
        // Return success for now
        return Promise.resolve(true);
    }

    // Generate booking confirmation email content
    static generateBookingConfirmationEmail(booking) {
        return `
Dear User,

Your seat booking has been confirmed!

Booking Details:
- Seat: ${booking.seatNumber}
- Center: ${booking.centerName}
- Location: ${booking.centerLocation}
- Date: ${booking.date}
- Time: ${booking.startTime} - ${booking.endTime}
- Time Slot: ${booking.timeSlotName}
${booking.totalAmount > 0 ? `- Amount: ₹${booking.totalAmount}` : ''}

Contact Information:
- Phone: ${booking.contactPhone}
- Email: ${booking.contactEmail}

Please arrive on time and bring a valid ID for verification.

Thank you for choosing our service!

Best regards,
Educasheer Team
        `;
    }

    // Generate booking cancellation email content
    static generateBookingCancellationEmail(booking) {
        return `
Dear User,

Your seat booking has been cancelled.

Cancelled Booking Details:
- Seat: ${booking.seatNumber}
- Center: ${booking.centerName}
- Date: ${booking.date}
- Time: ${booking.startTime} - ${booking.endTime}
${booking.cancellationReason ? `- Reason: ${booking.cancellationReason}` : ''}

If you have any questions, please contact our support team.

Best regards,
Educasheer Team
        `;
    }

    // Generate booking reminder email content
    static generateBookingReminderEmail(booking) {
        return `
Dear User,

This is a reminder for your upcoming seat booking.

Booking Details:
- Seat: ${booking.seatNumber}
- Center: ${booking.centerName}
- Location: ${booking.centerLocation}
- Date: ${booking.date}
- Time: ${booking.startTime} - ${booking.endTime}

Please arrive on time and bring a valid ID for verification.

Best regards,
Educasheer Team
        `;
    }
}

export default SeatBookingNotificationService;
