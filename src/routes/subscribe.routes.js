import { Router } from "express";
import { subScribeToChannel } from "../controllers/subscriber.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router=Router();
router.route("/subscribe-to/:channelId").post(verifyToken,subScribeToChannel);

export default router