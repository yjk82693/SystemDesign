import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, message } from 'antd';
import type { ChatMember } from './chatTypes';

interface Props {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
}

const NewRoomModal: React.FC<Props> = ({ open, onClose, onCreated }) => {
    const [roomName, setRoomName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [users, setUsers] = useState<ChatMember[]>([]);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (open) fetchUsers();
    }, [open]);

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

    const handleCreate = async () => {
        if (!roomName.trim()) return;
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5001/chat/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: roomName.trim(),
                    memberIds: selectedMembers,
                }),
            });
            if (res.ok) {
                message.success('Room created!');
                setRoomName('');
                setSelectedMembers([]);
                onCreated();
                onClose();
            } else {
                message.error('Failed to create room');
            }
        } catch {
            message.error('Server error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="New Group Room"
            open={open}
            onOk={handleCreate}
            onCancel={() => { onClose(); setRoomName(''); setSelectedMembers([]); }}
            okText="Create"
            confirmLoading={loading}
            okButtonProps={{ disabled: !roomName.trim() }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                <div>
                    <div style={{ fontSize: 13, color: '#595959', marginBottom: 6 }}>Room Name</div>
                    <Input
                        placeholder="e.g. Design Team, Art Assets, General"
                        value={roomName}
                        onChange={e => setRoomName(e.target.value)}
                        onPressEnter={handleCreate}
                        autoFocus
                    />
                </div>
                <div>
                    <div style={{ fontSize: 13, color: '#595959', marginBottom: 6 }}>Add Members</div>
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Select members to add"
                        value={selectedMembers}
                        onChange={setSelectedMembers}
                        options={users.map(u => ({
                            value: u.id,
                            label: `${u.firstName} ${u.lastName} (${u.publicId})`,
                        }))}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default NewRoomModal;