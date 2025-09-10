import { Request, Response, NextFunction, response } from "express"
import bcypt from "bcrypt"
import jwt from "jsonwebtoken"
import { config } from "../config/config"
import { User } from "../models"

export async function userAuth(req: Request, res: Response, next: NextFunction) {
    try {
        let token = req.headers['authorization']
        if (!token) {
            return res.status(403).json({
                message: "Not authorized"
            })
        }
        token = token.split("Bearer ")[1] as string

        const decoded = jwt.verify(token, config.jwt.secret)

        if (typeof decoded == "string") {
            return res.status(403).json({
                message: "Not authorized"
            })
        }

        if (!decoded || !decoded.userId) {
            return res.status(403).json({
                message: "Not authorized"
            })
        }

        const user = await User.findOne({
            _id: decoded.userId
        })

        if (!user) {
            return res.status(403).json({
                message: "Not authorized"
            })
        }

        req.userId = decoded.userId
        next()
    } catch (err) {
        return res.status(403).json({
            message: "Not authorized"
        })
    }
}