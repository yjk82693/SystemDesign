import React, { useState } from 'react';
import { Button, Avatar, Tooltip, Modal, Select, message } from 'antd';
import { PlusOutlined, MessageOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import type { ChatRoom, ChatMember } from './chatTypes';
import { getRoomName, avatarColor, formatTime } from './chatUtils';
import NewRoomModal from './NewRoomModal';

interface Props {
    rooms: ChatRoom[];
    selectedRoom: ChatRoom | null;
    currentUser: ChatMember;
    onSelectRoom: (room: ChatRoom) => void;
    onRoomsChanged: () => void;
}

const ChatSidebar: React.FC<Props> = ({
    rooms, selectedRoom, currentUser, onSelectRoom, onRoomsChanged
}) => {
    const [newRoomModal, setNewRoomModal] = useState(false);
    const [dmModal, setDmModal] = useState(false);
    const [users, setUsers] = useState<ChatMember[]>([]);
    const [selectedDmUser, setSelectedDmUser] = useState<number | null>(null);
    const [dmLoading, setDmLoading] = useState(false);
    const token = localStorage.getItem('token');

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:5001/chat/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setUsers(await res.json());
        } catch {
            console.error('Failed to fetch users');
        }
    };

    const handleOpenDM = () => {
        fetchUsers();
        setDmModal(true);
    };

    const handleCreateDM = async () => {
        if (!selectedDmUser) return;
        setDmLoading(true);
        try {
            const res = await fetch('http://localhost:5001/chat/rooms/dm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ friendId: selectedDmUser }),
            });
            if (res.ok) {
                const room = await res.json();
                onRoomsChanged();
                onSelectRoom(room);
                setDmModal(false);
                setSelectedDmUser(null);
            } else {
                message.error('Failed to create DM');
            }
        } catch {
            message.error('Server error');
        } finally {
            setDmLoading(false);
        }
    };

    const groupRooms = rooms.filter(r => r.type === 'GROUP');
    const dmRooms = rooms.filter(r => r.type === 'DM');

    const RoomItem = ({ room }: { room: ChatRoom }) => {
        const isActive = selectedRoom?.id === room.id;
        const name = getRoomName(room, currentUser.id);
        const lastMsg = room.messages?.[0];

        return (
            <div
                onClick={() => onSelectRoom(room)}
                style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    background: isActive ? '#e6f4ff' : 'transparent',
                    borderLeft: isActive ? '3px solid #1677ff' : '3px solid transparent',
                    borderRadius: 4,
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 10,
                }}
            >
                <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: room.type === 'GROUP' ? '#1677ff22' : '#52c41a22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {room.type === 'GROUP'
                        ? <TeamOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                        : <UserOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                    }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontSize: 13, fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#1677ff' : '#1a1a1a',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                        {name}
                    </div>
                    {lastMsg && (
                        <div style={{
                            fontSize: 11, color: '#8c8c8c',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {lastMsg.author.firstName}: {lastMsg.content}
                        </div>
                    )}
                </div>
                {lastMsg && (
                    <div style={{ fontSize: 10, color: '#bfbfbf', flexShrink: 0 }}>
                        {formatTime(lastMsg.createdAt)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{
            width: 240, borderRight: '1px solid #f0f0f0',
            flexShrink: 0, display: 'flex', flexDirection: 'column',
            background: '#fafafa',
        }}>
            {/* Header */}
            <div style={{
                padding: '14px 16px', borderBottom: '1px solid #f0f0f0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>
                    Messages
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                    <Tooltip title="New DM">
                        <Button type="text" size="small"
                            icon={<MessageOutlined style={{ fontSize: 13 }} />}
                            onClick={handleOpenDM}
                        />
                    </Tooltip>
                    <Tooltip title="New Group Room">
                        <Button type="text" size="small"
                            icon={<PlusOutlined style={{ fontSize: 13 }} />}
                            onClick={() => setNewRoomModal(true)}
                        />
                    </Tooltip>
                </div>
            </div>

            {/* Room list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>

                {/* Group rooms */}
                {groupRooms.length > 0 && (
                    <>
                        <div style={{
                            padding: '6px 16px', fontSize: 10, fontWeight: 600,
                            color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                            Channels
                        </div>
                        {groupRooms.map(room => <RoomItem key={room.id} room={room} />)}
                    </>
                )}

                {/* DM rooms */}
                {dmRooms.length > 0 && (
                    <>
                        <div style={{
                            padding: '6px 16px', fontSize: 10, fontWeight: 600,
                            color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.05em',
                            marginTop: 8,
                        }}>
                            Direct Messages
                        </div>
                        {dmRooms.map(room => <RoomItem key={room.id} room={room} />)}
                    </>
                )}

                {rooms.length === 0 && (
                    <div style={{ padding: 16, fontSize: 12, color: '#8c8c8c', textAlign: 'center' }}>
                        No rooms yet — create one!
                    </div>
                )}
            </div>

            {/* Current user at bottom */}
            <div style={{
                padding: '12px 16px', borderTop: '1px solid #f0f0f0',
                display: 'flex', alignItems: 'center', gap: 10,
            }}>
                <Avatar
                    size={32}
                    style={{
                        background: avatarColor(currentUser.publicId),
                        fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}
                >
                    {currentUser.firstName[0]}{currentUser.lastName[0]}
                </Avatar>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {currentUser.firstName} {currentUser.lastName}
                    </div>
                    <div style={{ fontSize: 10, color: '#8c8c8c' }}>{currentUser.publicId}</div>
                </div>
            </div>

            {/* Modals */}
            <NewRoomModal
                open={newRoomModal}
                onClose={() => setNewRoomModal(false)}
                onCreated={onRoomsChanged}
            />

            <Modal
                title="New Direct Message"
                open={dmModal}
                onOk={handleCreateDM}
                onCancel={() => { setDmModal(false); setSelectedDmUser(null); }}
                okText="Start DM"
                confirmLoading={dmLoading}
                okButtonProps={{ disabled: !selectedDmUser }}
            >
                <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 13, color: '#595959', marginBottom: 6 }}>
                        Select a person to message
                    </div>
                    <Select
                        style={{ width: '100%' }}
                        placeholder="Search users..."
                        showSearch
                        value={selectedDmUser}
                        onChange={setSelectedDmUser}
                        filterOption={(input, option) =>
                            String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={users.map(u => ({
                            value: u.id,
                            label: `${u.firstName} ${u.lastName} (${u.publicId})`,
                        }))}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default ChatSidebar;