import { Router } from "express";
import {
    getProjectFiles,
    getFileContent,
    createCodeFile,
    updateFileContent,
    uploadFile,
    deleteFile,
    createFolder,
    moveFile,
} from "../controllers/fileController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);

router.get("/project/:projectId", getProjectFiles);
router.get("/:fileId", getFileContent);
router.post("/code", createCodeFile);
router.put("/:fileId", updateFileContent);
router.patch("/:fileId/move", moveFile);
router.post("/upload", uploadFile);
router.delete("/:fileId", deleteFile);
router.post("/folder", createFolder);

export default router;