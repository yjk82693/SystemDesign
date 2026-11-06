import dotenv from "dotenv";

// Load backend/.env here so every module that imports this file sees it.
// (server.ts calls dotenv.config() after its route imports, which is too late
// for values read at import time.)
dotenv.config();

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value || value.trim() === "") {
        throw new Error(
            `Missing required environment variable ${name}. ` +
            `Set it in backend/.env (see backend/.env.example) before starting the server.`
        );
    }
    return value;
}

export const JWT_SECRET = requireEnv("JWT_SECRET");
