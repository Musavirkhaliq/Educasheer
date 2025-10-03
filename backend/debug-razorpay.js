import dotenv from "dotenv";
dotenv.config();

console.log('Environment variables check:');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'SET' : 'NOT SET');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Test Razorpay initialization
import Razorpay from "razorpay";

let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        console.log('Razorpay initialized successfully:', !!razorpay);
    } catch (error) {
        console.error('Razorpay initialization error:', error);
    }
} else {
    console.log('Razorpay credentials missing');
}

console.log('Final razorpay instance:', razorpay ? 'INITIALIZED' : 'NULL');