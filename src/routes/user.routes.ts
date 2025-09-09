import { Router } from "express";
import { userAuth } from "../middlewares/auth.middleware";
import { createRoom } from "../controllers/user.controllers";
const userRouter = Router();

userRouter.post('/room', userAuth, createRoom)

export  {userRouter}