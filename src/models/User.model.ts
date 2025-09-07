import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    photo: Buffer,
    rooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
    }],
    
}, {timestamps: true})

export const User = mongoose.model("User", UserSchema)