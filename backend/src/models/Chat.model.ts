import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  message: {
    type: {
      text: { type: String },      
      x: { type: Number },         
      y: { type: Number },         
      shape: { type: String },    
      tool: { type: String },     
    },
    default: {},  // allows empty when not used
  },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
    }
}, {timestamps: true})

export const Chat = mongoose.model("Chat", ChatSchema)