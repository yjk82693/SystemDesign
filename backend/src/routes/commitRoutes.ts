import { Router } from "express";
import {
    createCommit,
    getProjectCommits,
    getAllCommits,
    getCommit,
    addComment,
    deleteComment,
} from "../controllers/commitController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);

router.post("/", createCommit);
router.get("/", getAllCommits);
router.get("/project/:projectId", getProjectCommits);
router.get("/:commitId", getCommit);
router.post("/:commitId/comments", addComment);
router.delete("/comments/:commentId", deleteComment);

export default router;