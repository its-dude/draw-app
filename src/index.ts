import express from "express"
import authRouter from "./routes/auth.routes"
import { createServer } from "http"
import { connectDB } from "./config/db.config"

const app = express()
const server = createServer(app)

app.use(express.json())
app.use('/api/auth', authRouter)

app.get('/',(req,res)=>res.send("hello from the backend"))

 connectDB()
 .then( ()=> {
     server.listen(3000, ()=> {
         console.log("server is running on port 3000")
     }) 

 })