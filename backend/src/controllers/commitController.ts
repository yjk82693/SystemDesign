import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Create a commit (called when saving a file) ──
export const createCommit = async (req: Request, res: Response) => {
    try {
        const { fileId, projectId, message, content, url } = req.body;
        const user = req.user;

        if (!user) return res.status(401).json({ message: "Unauthorized" });
        if (!fileId || !projectId || !message) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const dbUser = await prisma.user.findUnique({ where: { publicId: user.publicId } });
        if (!dbUser) return res.status(404).json({ message: "User not found" });

        const file = await prisma.projectFile.findUnique({ where: { id: Number(fileId) } });
        if (!file) return res.status(404).json({ message: "File not found" });

        const commit = await prisma.commit.create({
            data: {
                message,
                fileType: file.type,
                fileName: file.name,
                content: content ?? file.content,
                url: url ?? file.url,
                projectId: Number(projectId),
                fileId: Number(fileId),
                authorId: dbUser.id,
            },
            include: {
                author: { select: { id: true, firstName: true, lastName: true, publicId: true } },
                _count: { select: { comments: true } }
            }
        });

        res.status(201).json(commit);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create commit" });
    }
};

// ── Get all commits for a project ──
export const getProjectCommits = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);
        if (!projectId) return res.status(400).json({ message: "Invalid project ID" });

        const commits = await prisma.commit.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
            include: {
                author: { select: { id: true, firstName: true, lastName: true, publicId: true } },
                _count: { select: { comments: true } }
            }
        });

        res.json(commits);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch commits" });
    }
};

// ── Get all commits across all projects (for feedback page) ──
export const getAllCommits = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: "Unauthorized" });

        const commits = await prisma.commit.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                author: { select: { id: true, firstName: true, lastName: true, publicId: true } },
                project: { select: { id: true, name: true } },
                _count: { select: { comments: true } }
            }
        });

        res.json(commits);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch commits" });
    }
};
// ── Get single commit with comments ──
export const getCommit = async (req: Request, res: Response) => {
    try {
        const commitId = Number(req.params.commitId);

        const commit = await prisma.commit.findUnique({
            where: { id: commitId },
            include: {
                author: { select: { id: true, firstName: true, lastName: true, publicId: true } },
                project: { select: { id: true, name: true } },
                comments: {
                    where: { parentId: null },
                    orderBy: { createdAt: 'asc' },
                    include: {
                        author: { select: { id: true, firstName: true, lastName: true, publicId: true } },
                        replies: {
                            orderBy: { createdAt: 'asc' },
                            include: {
                                author: { select: { id: true, firstName: true, lastName: true, publicId: true } },
                            }
                        }
                    }
                }
            }
        });

        if (!commit) return res.status(404).json({ message: "Commit not found" });

        res.json(commit);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch commit" });
    }
};

// ── Add comment to a commit ──
export const addComment = async (req: Request, res: Response) => {
    try {
        const commitId = Number(req.params.commitId);
        const { content, parentId } = req.body;
        const user = req.user;

        if (!user) return res.status(401).json({ message: "Unauthorized" });
        if (!content?.trim()) return res.status(400).json({ message: "Comment cannot be empty" });

        const dbUser = await prisma.user.findUnique({ where: { publicId: user.publicId } });
        if (!dbUser) return res.status(404).json({ message: "User not found" });

        const comment = await prisma.comment.create({
            data: {
                content,
                commitId,
                authorId: dbUser.id,
                parentId: parentId ? Number(parentId) : null,
            },
            include: {
                author: { select: { id: true, firstName: true, lastName: true, publicId: true } },
                replies: {
                    include: {
                        author: { select: { id: true, firstName: true, lastName: true, publicId: true } }
                    }
                }
            }
        });

        res.status(201).json(comment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to add comment" });
    }
};

// ── Delete comment ──
export const deleteComment = async (req: Request, res: Response) => {
    try {
        const commentId = Number(req.params.commentId);
        const user = req.user;
        if (!user) return res.status(401).json({ message: "Unauthorized" });

        const dbUser = await prisma.user.findUnique({ where: { publicId: user.publicId } });
        if (!dbUser) return res.status(404).json({ message: "User not found" });

        const comment = await prisma.comment.findUnique({ where: { id: commentId } });
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        // Only author or admin can delete
        if (comment.authorId !== dbUser.id &&
            dbUser.position !== 'ADMIN' &&
            dbUser.position !== 'FOUNDER') {
            return res.status(403).json({ message: "Not authorized to delete this comment" });
        }

        // Delete replies first
        await prisma.comment.deleteMany({ where: { parentId: commentId } });
        await prisma.comment.delete({ where: { id: commentId } });

        res.json({ message: "Comment deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete comment" });
    }
};