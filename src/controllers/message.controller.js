import { Message } from "../models/message.model.js";

import asyncHandler from "../utils/asyncHandler.js";
import { getReceiverSocket } from "../index.js";

export const sendMessage=asyncHandler(async(req,res)=>{
    try {
    const {message,senderId,receiverId}=req.body;
    const receiverSocketId=getReceiverSocket(receiverId);
    let newMessage;
    if(receiverSocketId){
        newMessage=await Message.create({
        message,
        senderId,
        receiverId
    });
    const io=getIoInstance();

    io.to(receiverSocketId).emit("sendMessage",{
        newMessage
    })

    return res
    .status(201)
    .json({"message":"message sent","error":null,"data":null})
    }
    } catch (error) {
    return res
    .status(400)
    .json({"message":"Somethin went wrong while sending message","error":error,"data":null})

    }
    
})

export const getChatHistory=asyncHandler(async(req,res)=>{
    try {
        const {senderId,receiverId}=req.body;
    const allMessages=await Message.find({
        $or:[
            {senderId:senderId,receiverId:receiverId},
            {senderId:receiverId,receiverId:senderId}
        ]
    }).sort({createdAt:1}).populate("senderId").populate("receiverId")
    if(!allMessages){
        res
        .status(200)
        .json({"message":"chat get fetched","error":null,"data":allMessages})
    }
    } catch (error) {
    return res
    .status(400)
    .json({"message":"Somethin went wrong while getting history","error":error,"data":null})
    }
    
    
})

