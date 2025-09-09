import { Request, Response } from "express";
import { Room } from "../models";
import { nanoid } from "nanoid";

export async function createRoom(req: Request, res: Response) {
    try {
        const userId = req.userId
        const { slug } = req.body
        const roomId = nanoid(6)

        const room = await Room.create({
            slug,
            userId,
            roomId
        })

        res.json({
            roomId
        })
    } catch (err) {
        res.status(500).json({
            message: "Failed to create room, try again later."
        })
    }
}