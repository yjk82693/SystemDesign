export interface Category {
    id: number;
    name: string;
    description: string | null;
    _count: { resources: number };
}

export interface Resource {
    id: number;
    name: string;
    description: string | null;
    type: string;
    fileType: string | null;
    url: string;
    folder: string | null;
    createdAt: string;
    category: { id: number; name: string };
    createdBy: { firstName: string; lastName: string; publicId: string };
}

export type ViewMode = 'grid' | 'list';