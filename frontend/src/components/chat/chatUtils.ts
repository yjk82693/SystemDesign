import type { ChatRoom } from './chatTypes';

export function getRoomName(room: ChatRoom, currentUserId: number): string {
    if (room.type === 'GROUP') return room.name || 'Group Chat';
    const other = room.members.find(m => m.id !== currentUserId);
    return other ? `${other.firstName} ${other.lastName}` : 'DM';
}

export function avatarColor(publicId: string): string {
    const colors = ['#1677ff', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96', '#13c2c2'];
    return colors[publicId.charCodeAt(0) % colors.length];
}

export function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}