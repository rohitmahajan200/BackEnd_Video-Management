import { Message } from "../models/message.model.js";
import { getIoInstance } from "../socket.js";
import asyncHandler from "../utils/asyncHandler.js";
import { receiverSocketId } from "../socket.js";

export const sendMessage=asyncHandler(async(req,res)=>{
    const {message,senderId,receiverId}=req.body;
    const newMessage=await Message.create({
        message,
        senderId,
        receiverId
    });
    const io=getIoInstance();
    const receiverSocketId=getSocketId(receiverId);

    io.to(receiverSocketId).emit("newMessage",{
        newMessage
    })

    return res
    .status(201)
    .json({"message":"message sent","error":null,"data":null})
})

export const getOneUsersMessages=asyncHandler(async(req,res)=>{
    const {senderId}=req.body;
    const allMessages=await Message.aggregate([
        {
            $match:{
                $or:[
                    {
                        $and:[
                        {senderId},
                        {receiverId:req.user._id}]
                    },
                    {
                        $and:[
                        {senderId:req.user._id},
                        {receiverId:senderId}]
                    }
                
                ]
            }
        },
        {
            $sort:{
                createdAt:1
            }
        }
    ]);
    if(!allMessages){
        res
        .status(200)
        .json({"message":"chat get fetched","error":null,"data":allMessages})
    }
    
})

