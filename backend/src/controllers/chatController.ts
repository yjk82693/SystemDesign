import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Get all chat rooms for current user ──
export const getChatRooms = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: "Unauthorized" });

        const dbUser = await prisma.user.findUnique({ where: { publicId: user.publicId } });
        if (!dbUser) return res.status(404).json({ message: "User not found" });

        const rooms = await prisma.chatRoom.findMany({
            where: { members: { some: { id: dbUser.id } } },
            include: {
                members: { select: { id: true, firstName: true, lastName: true, publicId: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    include: { author: { select: { firstName: true, lastName: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(rooms);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch chat rooms" });
    }
};

// ── Create a group chat room ──
export const createChatRoom = async (req: Request, res: Response) => {
    try {
        const { name, memberIds } = req.body;
        const user = req.user;
        if (!user) return res.status(401).json({ message: "Unauthorized" });

        const dbUser = await prisma.user.findUnique({ where: { publicId: user.publicId } });
        if (!dbUser) return res.status(404).json({ message: "User not found" });

        if (!name?.trim()) return res.status(400).json({ message: "Room name is required" });

        // Always include the creator
        const allMemberIds = Array.from(new Set([dbUser.id, ...(memberIds || [])]));

        const room = await prisma.chatRoom.create({
            data: {
                name: name.trim(),
                type: 'GROUP',
                members: { connect: allMemberIds.map((id: number) => ({ id })) }
            },
            include: {
                members: { select: { id: true, firstName: true, lastName: true, publicId: true } },
                messages: { take: 1 }
            }
        });

        res.status(201).json(room);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create chat room" });
    }
};

// ── Create or get DM room ──
export const createDM = async (req: Request, res: Response) => {
    try {
        const { friendId } = req.body;
        const user = req.user;
        if (!user) return res.status(401).json({ message: "Unauthorized" });

        const dbUser = await prisma.user.findUnique({ where: { publicId: user.publicId } });
        if (!dbUser) return res.status(404).json({ message: "User not found" });

        // Check if DM already exists between these two users
        const existing = await prisma.chatRoom.findFirst({
            where: {
                type: 'DM',
                AND: [
                    { members: { some: { id: dbUser.id } } },
                    { members: { some: { id: Number(friendId) } } },
                ]
            },
            include: {
                members: { select: { id: true, firstName: true, lastName: true, publicId: true } },
                messages: { take: 1 }
            }
        });

        if (existing) return res.json(existing);

        const room = await prisma.chatRoom.create({
            data: {
                type: 'DM',
                members: { connect: [{ id: dbUser.id }, { id: Number(friendId) }] }
            },
            include: {
                members: { select: { id: true, firstName: true, lastName: true, publicId: true } },
                messages: { take: 1 }
            }
        });

        res.status(201).json(room);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create DM" });
    }
};

// ── Get messages for a room ──
export const getMessages = async (req: Request, res: Response) => {
    try {
        const roomId = Number(req.params.roomId);
        const { before } = req.query;

        const messages = await prisma.message.findMany({
            where: {
                chatRoomId: roomId,
                ...(before ? { createdAt: { lt: new Date(String(before)) } } : {})
            },
            orderBy: { createdAt: 'asc' },
            take: 50,
            include: {
                author: { select: { id: true, firstName: true, lastName: true, publicId: true } }
            }
        });

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};

// ── Send a message ──
export const sendMessage = async (req: Request, res: Response) => {
    try {
        const roomId = Number(req.params.roomId);
        const { content } = req.body;
        const user = req.user;

        if (!user) return res.status(401).json({ message: "Unauthorized" });
        if (!content?.trim()) return res.status(400).json({ message: "Message cannot be empty" });
        if (content.length > 300) return res.status(400).json({ message: "Message too long (max 300 chars)" });

        const dbUser = await prisma.user.findUnique({ where: { publicId: user.publicId } });
        if (!dbUser) return res.status(404).json({ message: "User not found" });

        const message = await prisma.message.create({
            data: {
                content: content.trim(),
                authorId: dbUser.id,
                chatRoomId: roomId,
            },
            include: {
                author: { select: { id: true, firstName: true, lastName: true, publicId: true } }
            }
        });

        res.status(201).json(message);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to send message" });
    }
};

// ── Get all users (for adding to rooms / DMs) ──
export const getUsers = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: "Unauthorized" });

        const users = await prisma.user.findMany({
            where: { publicId: { not: user.publicId } },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                publicId: true,
                jobRole: true,
                position: true,
            },
            orderBy: { firstName: 'asc' }
        });

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};