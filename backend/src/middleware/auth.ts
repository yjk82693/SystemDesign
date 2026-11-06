import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export interface UserPayload {
    publicId: string;
    email: string;
    role: string;
    position: string;
    currentGame: string | null;
}

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = user as UserPayload;
        next();
    });
}

export function requireRole(allowedPositions: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !allowedPositions.includes(req.user.position)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }
        next();
    };
}
