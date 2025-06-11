import express, { urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import http from "http"
import { Server } from 'socket.io';
import { setIoInstance } from './socket.js';
const app=express();
export const server=http.createServer(app);

export const io=new Server(server,{
    cors:{
        origin:"*",
        methods: ["GET", "POST"]
    }
})

export const users=new Map();
//Socket.io code
io.on("connection",(socket)=>{

    setIoInstance(socket)//stroring socket id for further use in controller
    console.log("user is connected ",socket.id);
    
    socket.on("userLogin",(userId)=>{  
        users.set(userId,socket.id);//after successful login storing user id and socket id in active user list
        socket.to(socket.id).emit("usersList",users.keys); //sending active userlist to client
    })

    socket.on("usersList",(data)=>{
        console.log(data)
    })

    socket.on("newMessage",(newMessage)=>{
        console.log(newMessage)
    })
    
    socket.on("disconnect",()=>{
    for (let [userId, id] of users.entries()) {
      if (id === socket.id) {
        users.delete(userId);
        break;
      }
    }
    console.log("user is disconnect ",socket.id);
    })
})

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}));
app.use(urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser()) 

import userRouter from "./routes/user.routes.js"
import subscibeRouter from "./routes/subscribe.routes.js"
import videoRouter from "./routes/video.routes.js"
import likeRouter from "./routes/like.routes.js"
import commentRouter from "./routes/comment.route.js"
import tweetRouter from "./routes/tweet.route.js"
import playlistRouter from "./routes/playlist.route.js"
import dashboardRouter from "./routes/dashboard.route.js"
//routes declaration
app.use('/api/v1/users',userRouter)
app.use('/api/v1/subscribe',subscibeRouter)
app.use('/api/v1/video',videoRouter)
app.use('/api/v1/like',likeRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/tweet",tweetRouter)
app.use("/api/v1/playlist",playlistRouter)
app.use("/api/v1/dashboard",dashboardRouter)

export default app