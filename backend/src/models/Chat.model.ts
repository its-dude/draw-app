import mongoose from "mongoose";
import { number } from "zod";

const ShapeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["rect", "circle", "line", "pencil", "text"],
      required: true,
    },
    // Rectangle
    x: Number,
    y: Number,
    width: Number,
    height: Number,

    // Circle
    centerX: Number,
    centerY: Number,
    radius: Number,
    startAngle: Number,
    endAngle: Number,
    direction: Boolean,

    // Line
    startX: Number,
    startY: Number,
    endX: Number,
    endY: Number,

    // Pencil
    points: {
      type: [
        {
          x: Number,
          y: Number,
          thickness: Number
        },
      ],
      default:undefined
    },

    lines: [{
      text: String,
      x: number,
      y: number
    }],

    id: String
  },
  { _id: false }
);

const ChatSchema = new mongoose.Schema({
  shape: {
    type: ShapeSchema,
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
}, { timestamps: true })

export const Chat = mongoose.model("Chat", ChatSchema)