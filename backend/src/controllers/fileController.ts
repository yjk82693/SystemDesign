import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProjectFiles = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);
        if (!projectId) return res.status(400).json({ message: "Invalid project ID" });

        const files = await prisma.projectFile.findMany({
            where: { projectId },
            orderBy: [{ folder: "asc" }, { name: "asc" }],
            select: {
                id: true,
                name: true,
                type: true,
                folder: true,
                url: true,
                createdAt: true,
                updatedAt: true,
                uploadedBy: {
                    select: { firstName: true, lastName: true, publicId: true }
                }
            }
        });

        res.json(files);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch files" });
    }
};

export const getFileContent = async (req: Request, res: Response) => {
    try {
        const fileId = Number(req.params.fileId);
        const file = await prisma.projectFile.findUnique({
            where: { id: fileId },
            include: {
                uploadedBy: {
                    select: { firstName: true, lastName: true, publicId: true }
                }
            }
        });

        if (!file) return res.status(404).json({ message: "File not found" });

        res.json(file);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch file" });
    }
};

export const createCodeFile = async (req: Request, res: Response) => {
    try {
        const { projectId, name, folder, content } = req.body;
        const user = req.user;

        if (!user) return res.status(401).json({ message: "Unauthorized" });
        if (!projectId || !name) return res.status(400).json({ message: "Missing fields" });

        const dbUser = await prisma.user.findUnique({ where: { publicId: user.publicId } });
        if (!dbUser) return res.status(404).json({ message: "User not found" });

        const existing = await prisma.projectFile.findFirst({
            where: { projectId: Number(projectId), name, folder: folder || "/" }
        });
        if (existing) return res.status(409).json({ message: "File already exists in this folder" });

        const file = await prisma.projectFile.create({
            data: {
                name,
                type: "CODE",
                content: content || "",
                folder: folder || "/",
                projectId: Number(projectId),
                uploadedById: dbUser.id,
            }
        });

        res.status(201).json(file);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create file" });
    }
};

export const updateFileContent = async (req: Request, res: Response) => {
    try {
        const fileId = Number(req.params.fileId);
        const { content } = req.body;

        if (content === undefined) return res.status(400).json({ message: "Content is required" });

        const file = await prisma.projectFile.update({
            where: { id: fileId },
            data: { content }
        });

        res.json(file);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update file" });
    }
};

export const uploadFile = async (req: Request, res: Response) => {
    try {
        const { projectId, name, type, url, folder } = req.body;
        const user = req.user;

        if (!user) return res.status(401).json({ message: "Unauthorized" });
        if (!projectId || !name || !type || !url) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const dbUser = await prisma.user.findUnique({ where: { publicId: user.publicId } });
        if (!dbUser) return res.status(404).json({ message: "User not found" });

        const validTypes = ["CODE", "IMAGE", "PDF", "DOC"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: "Invalid file type" });
        }

        const file = await prisma.projectFile.create({
            data: {
                name,
                type,
                url,
                folder: folder || "/",
                projectId: Number(projectId),
                uploadedById: dbUser.id,
            }
        });

        res.status(201).json(file);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to upload file" });
    }
};

export const deleteFile = async (req: Request, res: Response) => {
    try {
        const fileId = Number(req.params.fileId);
        await prisma.projectFile.delete({ where: { id: fileId } });
        res.json({ message: "File deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete file" });
    }
};

export const createFolder = async (req: Request, res: Response) => {
    try {
        const { projectId, folder, name } = req.body;
        const user = req.user;

        if (!user) return res.status(401).json({ message: "Unauthorized" });
        if (!projectId || !folder || !name) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const dbUser = await prisma.user.findUnique({ where: { publicId: user.publicId } });
        if (!dbUser) return res.status(404).json({ message: "User not found" });

        await prisma.projectFile.create({
            data: {
                name: ".keep",
                type: "CODE",
                content: "",
                folder: `${folder}/${name}`,
                projectId: Number(projectId),
                uploadedById: dbUser.id,
            }
        });

        res.status(201).json({ message: "Folder created", folder: `${folder}/${name}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create folder" });
    }
};

// ── Move file to different folder ──
export const moveFile = async (req: Request, res: Response) => {
    try {
        const fileId = Number(req.params.fileId);
        const { folder } = req.body;

        if (!folder) return res.status(400).json({ message: "Folder is required" });

        const file = await prisma.projectFile.update({
            where: { id: fileId },
            data: { folder },
        });

        res.json(file);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to move file" });
    }
};