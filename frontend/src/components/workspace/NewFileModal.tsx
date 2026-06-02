import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, message } from 'antd';

interface Props {
    open: boolean;
    projectId: number;
    existingFolders: string[];
    defaultFolder: string;
    onClose: () => void;
    onCreated: () => void;
}

const NewFileModal: React.FC<Props> = ({
    open, projectId, existingFolders, defaultFolder, onClose, onCreated
}) => {
    const [fileName, setFileName] = useState('');
    const [folder, setFolder] = useState(defaultFolder);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        setFolder(defaultFolder);
    }, [defaultFolder]);

    const folderOptions = [
        { value: '/', label: '/ (root)' },
        ...existingFolders.filter(f => f !== '/').map(f => ({ value: f, label: f })),
    ];

    const handleCreate = async () => {
        if (!fileName.trim()) return;
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5001/files/code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    projectId,
                    name: fileName.trim(),
                    folder,
                    content: '',
                }),
            });
            if (res.ok) {
                message.success(`${fileName} created`);
                setFileName('');
                setFolder('/');
                onCreated();
                onClose();
            } else {
                const data = await res.json();
                message.error(data.message || 'Failed to create file');
            }
        } catch {
            message.error('Server error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="New File"
            open={open}
            onOk={handleCreate}
            onCancel={() => { onClose(); setFileName(''); }}
            okText="Create"
            confirmLoading={loading}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                <div>
                    <div style={{ fontSize: 13, marginBottom: 6, color: '#595959' }}>File name</div>
                    <Input
                        placeholder="e.g. main.ts, index.html, README.md"
                        value={fileName}
                        onChange={e => setFileName(e.target.value)}
                        onPressEnter={handleCreate}
                        autoFocus
                    />
                </div>
                <div>
                    <div style={{ fontSize: 13, marginBottom: 6, color: '#595959' }}>Folder</div>
                    <Select
                        style={{ width: '100%' }}
                        value={folder}
                        onChange={setFolder}
                        options={folderOptions}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default NewFileModal;