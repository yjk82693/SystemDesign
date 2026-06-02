import { Router } from "express";
import {
    getAllUsers,
    promoteUser,
    assignGame,
    updatePosition,
    switchTrack,
    getAllProjects,
    createProject,
    updateProject,
    deleteProject,
} from "../controllers/adminController";
import { authenticateToken, requireRole } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);

// ── User routes ──
router.get("/users", requireRole(["FOUNDER", "ADMIN"]), getAllUsers);
router.post("/promote", requireRole(["FOUNDER", "ADMIN"]), promoteUser);
router.post("/assign-game", requireRole(["FOUNDER", "ADMIN"]), assignGame);
router.post("/update-position", requireRole(["FOUNDER", "ADMIN"]), updatePosition);
router.post("/switch-track", requireRole(["FOUNDER", "ADMIN"]), switchTrack);

// ── Project routes ──
router.get("/projects", requireRole(["FOUNDER", "ADMIN"]), getAllProjects);
router.post("/projects", requireRole(["FOUNDER", "ADMIN"]), createProject);
router.put("/projects/:projectId", requireRole(["FOUNDER", "ADMIN"]), updateProject);
router.delete("/projects/:projectId", requireRole(["FOUNDER", "ADMIN"]), deleteProject);

export default router;