import { Router } from "express";
import { userAuth } from "../middlewares/auth.middleware";
import { createRoom } from "../controllers/user.controllers";
import { Room } from "../models";
const userRouter = Router();

userRouter.post('/room/create', userAuth, createRoom)
userRouter.get('/rooms', userAuth, async (req, res) => {
    const rooms = await Room.find({
        admin: req.userId
    })

    return res.json( rooms )
})
export  {userRouter}