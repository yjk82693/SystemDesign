import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Categories ──

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.resourceCategory.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { resources: true } }
            }
        });
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch categories" });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        if (!name?.trim()) return res.status(400).json({ message: "Name is required" });

        const existing = await prisma.resourceCategory.findUnique({ where: { name } });
        if (existing) return res.status(409).json({ message: "Category already exists" });

        const category = await prisma.resourceCategory.create({
            data: { name: name.trim(), description }
        });
        res.status(201).json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create category" });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const categoryId = Number(req.params.categoryId);

        // Delete all resources in category first
        await prisma.resource.deleteMany({ where: { categoryId } });
        await prisma.resourceCategory.delete({ where: { id: categoryId } });

        res.json({ message: "Category deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete category" });
    }
};

// ── Resources ──

export const getResources = async (req: Request, res: Response) => {
    try {
        const { categoryId, search } = req.query;

        const resources = await prisma.resource.findMany({
            where: {
                ...(categoryId ? { categoryId: Number(categoryId) } : {}),
                ...(search ? {
                    OR: [
                        { name: { contains: String(search) } },
                        { description: { contains: String(search) } },
                        { folder: { contains: String(search) } },
                    ]
                } : {}),
            },
            orderBy: { createdAt: 'asc' },
            include: {
                category: { select: { id: true, name: true } },
                createdBy: { select: { firstName: true, lastName: true, publicId: true } },
            }
        });

        res.json(resources);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch resources" });
    }
};

export const createResource = async (req: Request, res: Response) => {
    try {
        const { name, description, type, fileType, url, folder, categoryId } = req.body;
        const user = req.user;

        if (!user) return res.status(401).json({ message: "Unauthorized" });
        if (!name || !type || !url || !categoryId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const dbUser = await prisma.user.findUnique({ where: { publicId: user.publicId } });
        if (!dbUser) return res.status(404).json({ message: "User not found" });

        const resource = await prisma.resource.create({
            data: {
                name,
                description,
                type,
                fileType,
                url,
                folder: folder || null,
                categoryId: Number(categoryId),
                createdById: dbUser.id,
            },
            include: {
                category: { select: { id: true, name: true } },
                createdBy: { select: { firstName: true, lastName: true, publicId: true } },
            }
        });

        res.status(201).json(resource);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create resource" });
    }
};

export const updateResource = async (req: Request, res: Response) => {
    try {
        const resourceId = Number(req.params.resourceId);
        const { name, description, type, fileType, url, folder, categoryId } = req.body;

        const resource = await prisma.resource.update({
            where: { id: resourceId },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(type && { type }),
                ...(fileType !== undefined && { fileType }),
                ...(url && { url }),
                ...(folder !== undefined && { folder }),
                ...(categoryId && { categoryId: Number(categoryId) }),
            },
            include: {
                category: { select: { id: true, name: true } },
                createdBy: { select: { firstName: true, lastName: true, publicId: true } },
            }
        });

        res.json(resource);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update resource" });
    }
};

export const deleteResource = async (req: Request, res: Response) => {
    try {
        const resourceId = Number(req.params.resourceId);
        await prisma.resource.delete({ where: { id: resourceId } });
        res.json({ message: "Resource deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete resource" });
    }
};