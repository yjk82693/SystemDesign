export interface Project {
    id: number;
    name: string;
    description: string | null;
    updatedAt: string;
}

export interface ProjectFile {
    id: number;
    name: string;
    type: string;
    folder: string;
    url: string | null;
    uploadedBy: { firstName: string; lastName: string };
}

export interface FileWithContent extends ProjectFile {
    content: string | null;
}