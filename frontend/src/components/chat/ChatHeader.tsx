import React, { useState } from 'react';
import { Avatar, Tooltip } from 'antd';
import { TeamOutlined, UserOutlined } from '@ant-design/icons';
import type { ChatRoom } from './chatTypes.ts';
import { getRoomName, avatarColor } from './chatUtils';

interface Props {
    room: ChatRoom;
    currentUserId: number;
}

const ChatHeader: React.FC<Props> = ({ room, currentUserId }) => {
    const [showMembers, setShowMembers] = useState(false);
    const roomName = getRoomName(room, currentUserId);

    return (
        <div style={{
            height: 56, borderBottom: '1px solid #f0f0f0',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px', background: '#fff', flexShrink: 0,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: room.type === 'GROUP' ? '#1677ff22' : '#52c41a22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {room.type === 'GROUP'
                        ? <TeamOutlined style={{ color: '#1677ff' }} />
                        : <UserOutlined style={{ color: '#52c41a' }} />
                    }
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{roomName}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                        {room.members.length} member{room.members.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            {/* Members avatars */}
            <Tooltip
                title={showMembers ? '' : 'Click to see members'}
                placement="bottomRight"
            >
                <div
                    style={{ display: 'flex', cursor: 'pointer' }}
                    onClick={() => setShowMembers(!showMembers)}
                >
                    <Avatar.Group maxCount={4} size={28}>
                        {room.members.map(m => (
                            <Tooltip key={m.id} title={`${m.firstName} ${m.lastName}`}>
                                <Avatar
                                    size={28}
                                    style={{
                                        background: avatarColor(m.publicId),
                                        fontSize: 11, fontWeight: 700,
                                    }}
                                >
                                    {m.firstName[0]}{m.lastName[0]}
                                </Avatar>
                            </Tooltip>
                        ))}
                    </Avatar.Group>
                </div>
            </Tooltip>
        </div>
    );
};

export default ChatHeader;