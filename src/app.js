import express, { urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
const app=express();

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