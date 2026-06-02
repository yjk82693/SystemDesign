import React, { useState } from 'react';
import { Modal, Input, message } from 'antd';

interface Props {
    open: boolean;
    projectId: number;
    onClose: () => void;
    onCreated: () => void;
}

const NewFolderModal: React.FC<Props> = ({ open, projectId, onClose, onCreated }) => {
    const [folderName, setFolderName] = useState('');
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('token');

    const handleCreate = async () => {
        if (!folderName.trim()) return;
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5001/files/folder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    projectId,
                    folder: '/',
                    name: folderName.trim(),
                }),
            });
            if (res.ok) {
                message.success(`${folderName} folder created`);
                setFolderName('');
                onCreated();
                onClose();
            } else {
                message.error('Failed to create folder');
            }
        } catch {
            message.error('Server error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="New Folder"
            open={open}
            onOk={handleCreate}
            onCancel={() => { onClose(); setFolderName(''); }}
            okText="Create"
            confirmLoading={loading}
        >
            <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, marginBottom: 6, color: '#595959' }}>Folder name</div>
                <Input
                    placeholder="e.g. src, components, assets"
                    value={folderName}
                    onChange={e => setFolderName(e.target.value)}
                    onPressEnter={handleCreate}
                    autoFocus
                />
            </div>
        </Modal>
    );
};

export default NewFolderModal;