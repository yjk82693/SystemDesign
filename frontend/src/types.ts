export interface User {
    id: number;
    publicId: string;
    firstName: string;
    lastName: string;
    email: string;
    jobRole: string;
    position: "USER" | "ADMIN" | "FOUNDER";
    phone: string | null;
    assignedGames: { id: number; name: string }[];
    name?: string;
}