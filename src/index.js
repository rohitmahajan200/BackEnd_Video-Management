import dotenv from 'dotenv';
import { connetDB } from './db/index.js'
import express, { urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import http from "http"
import { Server } from 'socket.io';
const app=express();
const server=http.createServer(app);

const io=new Server(server,{
    cors:{
        origin:"http://localhost:5173",
        methods:["GET","POST"],
        credentials:true
    }
});

dotenv.config({path:'./env'})

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
import { messageRouter } from './routes/message.route.js';
//import { initSocket } from './socket/socket.io.js';
//routes declaration
app.use('/api/v1/users',userRouter)
app.use('/api/v1/subscribe',subscibeRouter)
app.use('/api/v1/video',videoRouter)
app.use('/api/v1/like',likeRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/tweet",tweetRouter)
app.use("/api/v1/playlist",playlistRouter)
app.use("/api/v1/dashboard",dashboardRouter)
app.use("/api/v1/message",messageRouter)


//initializing socket connection
const activeUsers=new Map();
export const getReceiverSocket=(userId)=>{
    return activeUsers.get(userId)
}

io.on("connection",(socket)=>{
    console.log("User is connected ",socket.id);
    
    const userId=socket.handshake.query.userId;
    
    if(userId){
        activeUsers.set(userId,socket.id)
    }
    
    socket.emit("getOnlineUser",Array.from(activeUsers.keys()));

    socket.on("sendMessage",async({message,senderId,receiverId})=>{
        try {
            if(!senderId ||!receiverId ||!message){
                console.log("Missig message parameters");
                return socket.emit("messageError", { error: "Missing sender, receiver, or message" });
            }
            const receiverSocketId=getReceiverSocket(receiverId);

            io.to(receiverSocketId).emit("newMessage",{senderId,receiverId,message});

        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("messageError", { error: "Failed to send message", details: error.message });

        }
    })

    socket.on("disconnect",()=>{
        console.log("User disconnected:", socket.id);
        // Remove the disconnected user from activeUsers map
        for (let [key, value] of activeUsers.entries()) {
            if (value === socket.id) {
                activeUsers.delete(key);
                break;
            }
        }
        // Emit the updated list of online users
        io.emit("getOnlineUser", Array.from(activeUsers.keys()));
    })
    
 })

connetDB()
.then(()=>{
    server.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("Mongo Db connection failed!!",err);
})

export {app,server}
