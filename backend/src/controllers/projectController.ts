import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Create Project ──
export const createProject = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        const user = req.user;

        if (!user) return res.status(401).json({ message: "Unauthorized" });
        if (!name) return res.status(400).json({ message: "Name is required" });

        const dbUser = await prisma.user.findUnique({ where: { publicId: user.publicId } });
        if (!dbUser) return res.status(404).json({ message: "User not found" });

        const project = await prisma.project.create({
            data: {
                name,
                description,
                users: {
                    connect: { id: dbUser.id }
                }
            }
        });

        res.status(201).json(project);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create project" });
    }
};

// ── Get User Projects ──
export const getUserProjects = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: "Unauthorized" });

        const dbUser = await prisma.user.findUnique({
            where: { publicId: user.publicId },
        });

        if (!dbUser) return res.status(404).json({ message: "User not found" });

        // Admins and Founders see all projects
        if (dbUser.position === 'ADMIN' || dbUser.position === 'FOUNDER') {
            const projects = await prisma.project.findMany({
                orderBy: { updatedAt: 'desc' },
            });
            return res.json(projects);
        }

        // Regular users see member projects + assigned games, deduplicated
        const userWithData = await prisma.user.findUnique({
            where: { publicId: user.publicId },
            include: {
                projects: { orderBy: { updatedAt: 'desc' } },
                assignedGames: { orderBy: { updatedAt: 'desc' } },
            }
        });

        if (!userWithData) return res.json([]);

        const memberProjects = userWithData.projects || [];
        const gameProjects = userWithData.assignedGames || [];

        // Merge and deduplicate by id
        const seen = new Set<number>();
        const allProjects = [];

        for (const p of [...memberProjects, ...gameProjects]) {
            if (!seen.has(p.id)) {
                seen.add(p.id);
                allProjects.push(p);
            }
        }

        // Sort by updatedAt descending
        allProjects.sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        res.json(allProjects);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch projects" });
    }
};

// ── Add Asset ──
export const addAsset = async (req: Request, res: Response) => {
    try {
        const { projectId, name, type, url } = req.body;

        const asset = await prisma.asset.create({
            data: {
                projectId: Number(projectId),
                name,
                type,
                url
            }
        });
        res.status(201).json(asset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to add asset" });
    }
};