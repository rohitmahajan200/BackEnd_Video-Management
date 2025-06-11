let ioInstance;
import { users } from "./app.js";
export const getIoInstance=()=>{
    return ioInstance
}

export const setIoInstance=(io)=>{
    ioInstance=io
}

export const receiverSocketId=(receiversId)=>{
    return users.get(receiversId)
}
