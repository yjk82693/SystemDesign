import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { isStrongPassword } from "../middleware/validation";
import { generatePublicId } from "../utils/idGenerator";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

export const register = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, password, jobRole, dateOfBirth } = req.body;

        if (!firstName || !lastName || !email || !password || !jobRole || !dateOfBirth) {
            return res.status(400).json({ message: "Missing fields" });
        }

        if (!isStrongPassword(password)) {
            return res.status(400).json({ message: "Weak password" });
        }

        const emailExists = await prisma.user.findUnique({ where: { email } });
        if (emailExists) {
            return res.status(409).json({ message: "Email already registered" });
        }

        let publicId = "";
        while (true) {
            publicId = generatePublicId(firstName, lastName);
            const exists = await prisma.user.findUnique({ where: { publicId } });
            if (!exists) break;
        }

        const hashed = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                publicId,
                firstName,
                lastName,
                email,
                password: hashed,
                jobRole,
                position: "USER",
                dateOfBirth,
            }
        });

        res.status(201).json({ message: "Registered", publicId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const login = async (req: Request, res: Response) => {
    const { publicId, password } = req.body;

    if (!publicId || !password) {
        return res.status(400).json({ message: "Missing credentials" });
    }

    const user = await prisma.user.findUnique({
        where: { publicId },
    });

    if (!user) return res.status(401).json({ message: "Invalid ID or password" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid ID or password" });

    const token = jwt.sign(
        {
            publicId: user.publicId,
            email: user.email,
            jobRole: user.jobRole,
            position: user.position,
        },
        JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({ token });
};

export const getMe = async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const user = await prisma.user.findUnique({
            where: { publicId: decoded.publicId },
            include: {
                assignedGames: { select: { id: true, name: true } }
            }
        });
        if (!user) return res.status(401).json({ message: "User not found" });

        res.json({
            id: user.id,
            publicId: user.publicId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            jobRole: user.jobRole,
            position: user.position,
            assignedGames: user.assignedGames,
        });
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};