import { Router } from "express";
import { createProject, getUserProjects, addAsset } from "../controllers/projectController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);

router.post("/", createProject);
router.get("/", getUserProjects);
router.post("/assets", addAsset);

export default router;
