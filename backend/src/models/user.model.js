import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: [true, 'Username is required'],
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,

    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,

    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Video'
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    refreshToken: {
        type: String,
    },
    role: {
        type: String,
        enum: ["learner", "tutor", "admin"],
        default: "learner"
    },
    tutorStatus: {
        type: String,
        enum: ["none", "pending", "approved", "rejected"],
        default: "none"
    }
}
    , {
        timestamps: true
    })

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})
userSchema.methods.isPasswordCorrect = async function (password) {
    if (!password || !this.password) {
        console.error("Missing password for comparison:", {
            hasInputPassword: !!password,
            hasStoredPassword: !!this.password
        });
        return false;
    }

    try {
        const result = await bcrypt.compare(password, this.password);
        if (!result) {
            console.log("Password verification failed for user:", {
                userId: this._id,
                email: this.email,
                passwordLength: password.length,
                storedPasswordLength: this.password.length
            });
        }
        return result;
    } catch (error) {
        console.error("bcrypt.compare error:", error);
        throw error;
    }
}
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
            role: this.role,
            tutorStatus: this.tutorStatus
        },
        process.env.ACCESS_TOKEN_SECRET || "your-access-token-secret-fallback",
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "1d"
        }
    );
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET || "your-refresh-token-secret-fallback",
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "10d"
        }
    );
}
export const User = mongoose.model('User', userSchema);
