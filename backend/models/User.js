const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true, trim:true, match:[/\S+@\S+\.\S+/, 'is invalid'],index:true},
    passwordHash: {type: String},
    emailVerified: {type: Boolean, default: false},
    role: {type: String, enum : ['user', 'admin','instructor'],default: 'user'},
    profilePictureUrl: {type: String,default: '/default.png/'},
    socialProvider : {type: String, enum : ['null', 'google', 'facebook'],default: 'null'},
    socialId : {type: String, unique: true, sparse : true},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
},
{timestamps: true});

// password hashing middleware
UserSchema.pre('save', async function(next) {
    // only hash the password if it has been modified (or is new) and is not null/undefined
    if (!this.isModified('passwordHash') || !this.passwordHash) return next();
    try{
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
        next();
    }
    catch(err){
        next(err);
    }
});

// method to compare password

UserSchema.methods.comparePassword = async function(candidatePassword) {
    if(!this.passwordHash) {
        return false; //cannot compare password if the password is not set
    }
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);