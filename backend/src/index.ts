import express from "express"
import {authRouter, userRouter} from "./routes"
import { createServer } from "http"
import { connectDB } from "./config/db.config"
import initSocket  from "./webSockets"
import cors from "cors"

const app = express()
const server = createServer(app)
initSocket(server)

app.use(express.json())
app.use(cors())
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

app.get('/',(req,res)=>res.send("hello from the backend"))

 connectDB()
 .then( ()=> {
     server.listen(3000, ()=> {
         console.log("server is running on port 3000")
     }) 

 })