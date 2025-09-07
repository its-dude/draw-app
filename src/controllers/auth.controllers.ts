import { Request, Response } from "express"
import { number, z } from "zod"
import { User } from "../models"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { config } from "../config/config"

const signupSchema = z.object({
  firstName: z.string().min(2).max(20),
  lastName: z.string().min(3).max(20),
  username: z.string().min(3).max(20),
  password: z.string().min(5).max(20)
})

const signinSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(5).max(20)
})

export const signup = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const result = signupSchema.safeParse(body);
    console.log(result)

    if (!result.success) {
      return res.status(403).json("Incorrect inputs")
    }

    const isUserExists = await User.findOne({
      username: result.data.username
    })

    if (isUserExists) {
      return res.status(403).json({
        message: "user already exists!"
      })
    }

    result.data.password = await bcrypt.hash(result.data.password, 10);
    
    const user = await User.create(result.data)
    const token = jwt.sign({userId: user._id}, config.jwt.secret as jwt.Secret, {expiresIn: Number(config.jwt.expires_in) })

    res.json({
      token
    })

  } catch (err) {
    res.status(403).json({
      message: (err as Error).message
    })
  }

}

export const signin = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const result = signinSchema.safeParse(body)

    if (!result.success) {
      return res.status(403).json({
        message: "username or password is incorrect"
      })
    }

    const user = await User.findOne({
      username: result.data.username
    })

    if( !user ) {
      return res.status(403).json({
        message: "username or password is incorrect"
      })
    }

    //compare passowrd
    const isPasswordCorrect = await bcrypt.compare(result.data.password, user.password);

    if (!isPasswordCorrect){
      return res.status(403).json({
        message: "username or password is incorrect"
      })
    }

    const token = jwt.sign({userId: user._id}, config.jwt.secret as jwt.Secret, {expiresIn: Number(config.jwt.expires_in) })

    res.json({
      token
    })

  } catch (err) {
      return res.status(403).json({
        message: "username or password is incorrect"
      })
  }
}