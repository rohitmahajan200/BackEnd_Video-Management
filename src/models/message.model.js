import mongoose,{Schema} from "mongoose";

const messageSchema=new Schema({
    message:{
        type:String,
        require:true
    },
    senderId:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    receiverId:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{
    timestamps:true
})

export const Message=mongoose.model("Message",messageSchema)