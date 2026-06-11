export interface ChatMember {
    id: number;
    firstName: string;
    lastName: string;
    publicId: string;
    jobRole?: string;
    position?: string;
}

export interface Message {
    id: number;
    content: string;
    createdAt: string;
    author: ChatMember;
}

export interface ChatRoom {
    id: number;
    name: string | null;
    type: 'DM' | 'GROUP';
    createdAt: string;
    members: ChatMember[];
    messages: Message[];
}