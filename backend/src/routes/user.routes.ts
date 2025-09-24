import { Router } from "express";
import { userAuth } from "../middlewares/auth.middleware";
import { createRoom } from "../controllers/user.controllers";
import { Chat, Room } from "../models";
const userRouter = Router();

userRouter.post('/room/create', userAuth, createRoom)
userRouter.get('/rooms', userAuth, async (req, res) => {
    const rooms = await Room.find({
        admin: req.userId
    })

    return res.json(rooms)
})
userRouter.get('/chats/:roomId', userAuth, async (req, res) => {
    try {
        const roomId = req.params.roomId
        const room = await Room.findOne({roomId}).populate("chats");
            
        if (!room){
            return res.status(400).json({
                message: "Room doesn't exists"
            })
        }
        
        const chats = room.chats
        return res.json({
            chats: chats
        })
    } catch (err) {
        console.error((err as Error).message)
        return res.status(400).json({
            message: "Failed getting chats, try again after some time"
        })
    }
})
export { userRouter }