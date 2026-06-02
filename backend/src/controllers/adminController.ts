import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                publicId: true,
                firstName: true,
                lastName: true,
                email: true,
                jobRole: true,
                position: true,
                assignedGames: {
                    select: { id: true, name: true }
                },
            }
        });

        const mappedUsers = users.map(u => ({
            ...u,
            name: `${u.firstName} ${u.lastName}`,
        }));

        res.json(mappedUsers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

export const promoteUser = async (req: Request, res: Response) => {
    const { userId } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { position: "ADMIN" }
        });
        res.json({ message: `User ${user.publicId} promoted to ADMIN` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to promote user" });
    }
};

export const assignGame = async (req: Request, res: Response) => {
    const { userId, projectIds } = req.body;
    try {
        if (!userId) return res.status(400).json({ message: "Missing userId" });

        await prisma.user.update({
            where: { id: userId },
            data: {
                assignedGames: {
                    set: (projectIds || []).map((id: number) => ({ id }))
                }
            }
        });
        res.json({ message: "Games assigned" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to assign games" });
    }
};

export const updatePosition = async (req: Request, res: Response) => {
    const { userId, position, jobRole, reason } = req.body;
    try {
        if (!userId || !reason) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const updateData: any = {};
        if (position) updateData.position = position;
        if (jobRole) updateData.jobRole = jobRole;

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        res.json({ message: `User ${user.publicId} updated`, reason });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update user" });
    }
};

export const switchTrack = async (req: Request, res: Response) => {
    const { userId, newTrack, reason } = req.body;
    try {
        if (!userId || !newTrack || !reason) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const trackStartingRole: Record<string, string> = {
            Developer: "Developer",
            Artist: "Artist",
            Designer: "Designer",
        };

        const newJobRole = trackStartingRole[newTrack];
        if (!newJobRole) {
            return res.status(400).json({ message: "Invalid track" });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { jobRole: newJobRole },
        });

        res.json({ message: `User ${user.publicId} switched to ${newTrack} track`, reason });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to switch track" });
    }
};

// ── Project Management ──

export const getAllProjects = async (req: Request, res: Response) => {
    try {
        const projects = await prisma.project.findMany({
            include: {
                users: {
                    select: { id: true, firstName: true, lastName: true, publicId: true, jobRole: true }
                },
                _count: { select: { files: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(projects);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch projects" });
    }
};

export const createProject = async (req: Request, res: Response) => {
    const { name, description, userIds } = req.body;
    try {
        if (!name) return res.status(400).json({ message: "Project name is required" });

        const project = await prisma.project.create({
            data: {
                name,
                description,
                users: {
                    connect: (userIds || []).map((id: number) => ({ id }))
                }
            },
            include: {
                users: {
                    select: { id: true, firstName: true, lastName: true, publicId: true }
                }
            }
        });

        res.status(201).json(project);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create project" });
    }
};

export const updateProject = async (req: Request, res: Response) => {
    const projectId = Number(req.params.projectId);
    const { name, description, userIds } = req.body;
    try {
        if (!projectId) return res.status(400).json({ message: "Invalid project ID" });

        const project = await prisma.project.update({
            where: { id: projectId },
            data: {
                name,
                description,
                users: {
                    set: (userIds || []).map((id: number) => ({ id }))
                }
            },
            include: {
                users: {
                    select: { id: true, firstName: true, lastName: true, publicId: true }
                }
            }
        });

        res.json(project);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update project" });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    const projectId = Number(req.params.projectId);
    try {
        await prisma.project.delete({ where: { id: projectId } });
        res.json({ message: "Project deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete project" });
    }
};