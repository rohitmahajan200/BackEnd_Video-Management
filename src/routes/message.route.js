import { Router } from "express";
import { sendMessage,getChatHistory } from "../controllers/message.controller.js";
export const messageRouter=Router();
messageRouter.route("/sendMessage").post(sendMessage);
messageRouter.route("/getChathistory").get(getChatHistory);