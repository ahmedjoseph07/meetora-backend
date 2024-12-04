import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import { initializeSocket } from "./controllers/SocketManager.js";
import userRoutes from "./routes/UsersRoutes.js"


const app = express()
const server = createServer(app)
const io = initializeSocket(server)

app.set("port", (process.env.PORT || 8000))
app.use(cors())
app.use(express.json({ limit: "50kb" }))
app.use(express.urlencoded({limit:"50kb",extended:true}))

app.use("/api/v1/users",userRoutes);

const start = async () => {
    const dbConnection = await mongoose.connect("mongodb+srv://ahmedjoseph0711:ob6yAO718tmD9pcG@cluster0.kxazt.mongodb.net/meetora?retryWrites=true&w=majority&appName=Cluster0")
    console.log(`Connected to host ${dbConnection.connection.host}`)
    server.listen(app.get("port"), () => {
        console.log("App running on 8000")
    })
}
start();