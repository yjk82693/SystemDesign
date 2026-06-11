import { Router } from "express";
import {
    getChatRooms,
    createChatRoom,
    createDM,
    getMessages,
    sendMessage,
    getUsers,
} from "../controllers/chatController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);

router.get("/rooms", getChatRooms);
router.post("/rooms", createChatRoom);
router.post("/rooms/dm", createDM);
router.get("/rooms/:roomId/messages", getMessages);
router.post("/rooms/:roomId/messages", sendMessage);
router.get("/users", getUsers);

export default router;