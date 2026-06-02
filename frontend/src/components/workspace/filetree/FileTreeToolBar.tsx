import React from 'react';
import { Button, Tooltip } from 'antd';
import { PlusOutlined, FolderAddOutlined, UploadOutlined, FolderOutlined } from '@ant-design/icons';

interface Props {
    projectName: string;
    selectedFolder: string;
    onNewFile: () => void;
    onNewFolder: () => void;
    onUpload: () => void;
    onClearFolder: () => void;
}

const FileTreeToolbar: React.FC<Props> = ({
    projectName, selectedFolder,
    onNewFile, onNewFolder, onUpload, onClearFolder,
}) => {
    return (
        <>
            <div style={{
                padding: '8px 12px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <span style={{
                    fontSize: 11, fontWeight: 600, color: '#8c8c8c',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                    {projectName}
                </span>
                <div style={{ display: 'flex', gap: 2 }}>
                    <Tooltip title={`New File${selectedFolder !== '/' ? ` in ${selectedFolder.replace('/', '')}` : ''}`}>
                        <Button type="text" size="small"
                            icon={<PlusOutlined style={{ fontSize: 12 }} />}
                            onClick={onNewFile}
                        />
                    </Tooltip>
                    <Tooltip title="New Folder">
                        <Button type="text" size="small"
                            icon={<FolderAddOutlined style={{ fontSize: 12 }} />}
                            onClick={onNewFolder}
                        />
                    </Tooltip>
                    <Tooltip title="Upload File">
                        <Button type="text" size="small"
                            icon={<UploadOutlined style={{ fontSize: 12 }} />}
                            onClick={onUpload}
                        />
                    </Tooltip>
                </div>
            </div>

            {/* Selected folder indicator */}
            {selectedFolder !== '/' && (
                <div style={{
                    padding: '4px 12px',
                    fontSize: 10,
                    color: '#1677ff',
                    background: '#e6f4ff',
                    borderBottom: '1px solid #bae0ff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                }}>
                    <FolderOutlined style={{ fontSize: 10 }} />
                    New files → {selectedFolder.replace('/', '')}
                    <span
                        style={{ marginLeft: 'auto', cursor: 'pointer', color: '#8c8c8c' }}
                        onClick={onClearFolder}
                    >
                        ✕
                    </span>
                </div>
            )}
        </>
    );
};

export default FileTreeToolbar;