import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    roomId: String,
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    chats: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    }]
});

export const Room = mongoose.model("Room", RoomSchema)