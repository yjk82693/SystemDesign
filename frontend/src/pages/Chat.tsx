import { useState, useEffect } from 'react';
import { message } from 'antd';
import type { ChatRoom, ChatMember } from '../components/chat/chatTypes';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import ChatHeader from '../components/chat/ChatHeader';
import { MessageOutlined } from '@ant-design/icons';

export default function Chat() {
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [currentUser, setCurrentUser] = useState<ChatMember | null>(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchCurrentUser();
        fetchRooms();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const res = await fetch('http://localhost:5001/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setCurrentUser(await res.json());
        } catch {
            console.error('Failed to fetch user');
        }
    };

    const fetchRooms = async () => {
        try {
            const res = await fetch('http://localhost:5001/chat/rooms', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setRooms(data);
            } else {
                message.error('Failed to load rooms');
            }
        } catch {
            message.error('Server error');
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) return null;

    return (
        <div style={{
            display: 'flex',
            height: 'calc(100vh - 120px)',
            background: '#fff',
            borderRadius: 10,
            border: '1px solid #f0f0f0',
            overflow: 'hidden',
        }}>
            <ChatSidebar
                rooms={rooms}
                selectedRoom={selectedRoom}
                currentUser={currentUser}
                onSelectRoom={setSelectedRoom}
                onRoomsChanged={fetchRooms}
            />

            {/* Main chat area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {selectedRoom ? (
                    <>
                        <ChatHeader room={selectedRoom} currentUserId={currentUser.id} />
                        <ChatWindow room={selectedRoom} currentUser={currentUser} />
                    </>
                ) : (
                    <div style={{
                        flex: 1, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexDirection: 'column',
                        gap: 12, color: '#8c8c8c',
                    }}>
                        <MessageOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                        <div style={{ fontSize: 15, fontWeight: 500 }}>Select a room to start chatting</div>
                        <div style={{ fontSize: 13 }}>or create a new room using the buttons on the left</div>
                    </div>
                )}
            </div>
        </div>
    );
}