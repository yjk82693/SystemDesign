import React from 'react';
import { Modal, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getFileType } from './workspaceUtils';

interface Props {
    open: boolean;
    projectId: number;
    onClose: () => void;
    onUploaded: () => void;
}

const UploadModal: React.FC<Props> = ({ open, projectId, onClose, onUploaded }) => {
    const token = localStorage.getItem('token');

    return (
        <Modal
            title="Upload File"
            open={open}
            footer={null}
            onCancel={onClose}
        >
            <div style={{ marginTop: 16 }}>
                <Upload.Dragger
                    name="file"
                    multiple={false}
                    beforeUpload={() => false}
                    onChange={async (info) => {
                        const file = info.file as unknown as File;
                        if (!file) return;

                        const type = getFileType(file.name);
                        const reader = new FileReader();
                        reader.onload = async (e) => {
                            const url = e.target?.result as string;
                            try {
                                const res = await fetch('http://localhost:5001/files/upload', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({
                                        projectId,
                                        name: file.name,
                                        type,
                                        url,
                                        folder: '/',
                                    }),
                                });
                                if (res.ok) {
                                    message.success(`${file.name} uploaded`);
                                    onUploaded();
                                    onClose();
                                } else {
                                    message.error('Upload failed');
                                }
                            } catch {
                                message.error('Server error');
                            }
                        };
                        reader.readAsDataURL(file);
                    }}
                >
                    <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                    <p style={{ fontSize: 13 }}>Click or drag file to upload</p>
                    <p style={{ fontSize: 11, color: '#8c8c8c' }}>
                        Supports: images, PDFs, documents, code files
                    </p>
                </Upload.Dragger>
            </div>
        </Modal>
    );
};

export default UploadModal;