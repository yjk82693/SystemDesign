import { Router } from "express";
import {
    getCategories,
    createCategory,
    deleteCategory,
    getResources,
    createResource,
    updateResource,
    deleteResource,
} from "../controllers/resourceController";
import { authenticateToken, requireRole } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);

// ── Categories ──
router.get("/categories", getCategories);
router.post("/categories", requireRole(["ADMIN", "FOUNDER"]), createCategory);
router.delete("/categories/:categoryId", requireRole(["ADMIN", "FOUNDER"]), deleteCategory);

// ── Resources ──
router.get("/", getResources);
router.post("/", requireRole(["ADMIN", "FOUNDER"]), createResource);
router.put("/:resourceId", requireRole(["ADMIN", "FOUNDER"]), updateResource);
router.delete("/:resourceId", requireRole(["ADMIN", "FOUNDER"]), deleteResource);

export default router;