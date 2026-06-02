import React from 'react';
import { Button, Tooltip } from 'antd';
import { FolderOutlined, FolderOpenOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ProjectFile, FileWithContent } from '../workspaceTypes';
import FileItem from './FileItem';

interface Props {
    folder: string;
    folderFiles: ProjectFile[];
    isCollapsed: boolean;
    isSelected: boolean;
    isDragTarget: boolean;
    selectedFile: FileWithContent | null;
    draggingFileId: number | null;
    hoveredFileId: number | null;
    onToggle: (folder: string) => void;
    onDragOver: (e: React.DragEvent, folder: string) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent, folder: string) => void;
    onFileClick: (file: ProjectFile) => void;
    onHoverEnter: (id: number) => void;
    onHoverLeave: () => void;
    onDragStart: (e: React.DragEvent, file: ProjectFile) => void;
    onDeleteFile: (file: ProjectFile) => void;
    onDeleteFolder: (folder: string, files: ProjectFile[]) => void;
}

const FolderItem: React.FC<Props> = ({
    folder, folderFiles, isCollapsed, isSelected, isDragTarget,
    selectedFile, draggingFileId, hoveredFileId,
    onToggle, onDragOver, onDragLeave, onDrop,
    onFileClick, onHoverEnter, onHoverLeave, onDragStart,
    onDeleteFile, onDeleteFolder,
}) => {
    const visibleFiles = folderFiles.filter(f => f.name !== '.keep');
    const folderDisplayName = folder.replace('/', '');

    return (
        <div>
            {/* Folder header */}
            <div
                onClick={() => onToggle(folder)}
                onDragOver={e => onDragOver(e, folder)}
                onDragLeave={onDragLeave}
                onDrop={e => onDrop(e, folder)}
                style={{
                    padding: '6px 8px 6px 12px',
                    fontSize: 11,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    background: isDragTarget ? '#fff7e6'
                        : isSelected ? '#f0f7ff'
                        : '#f0f0f0',
                    borderBottom: '1px solid #e8e8e8',
                    borderLeft: isSelected ? '3px solid #1677ff' : '3px solid transparent',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background 0.15s',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {isCollapsed
                        ? <FolderOutlined style={{ fontSize: 13, color: '#fa8c16' }} />
                        : <FolderOpenOutlined style={{ fontSize: 13, color: '#fa8c16' }} />
                    }
                    <span style={{ fontWeight: 500, color: '#333', fontSize: 12 }}>
                        {folderDisplayName}
                    </span>
                    {visibleFiles.length > 0 && (
                        <span style={{ color: '#bfbfbf', fontSize: 10 }}>
                            ({visibleFiles.length})
                        </span>
                    )}
                </div>
                <Tooltip title="Delete folder">
                    <Button
                        type="text" size="small" danger
                        icon={<DeleteOutlined style={{ fontSize: 11 }} />}
                        onClick={e => {
                            e.stopPropagation();
                            onDeleteFolder(folder, folderFiles);
                        }}
                    />
                </Tooltip>
            </div>

            {/* Files inside */}
            {!isCollapsed && (
                <div
                    onDragOver={e => onDragOver(e, folder)}
                    onDragLeave={onDragLeave}
                    onDrop={e => onDrop(e, folder)}
                    style={{
                        background: isDragTarget ? '#fff7e6' : 'transparent',
                        transition: 'background 0.15s',
                        minHeight: 8,
                    }}
                >
                    {visibleFiles.length === 0 ? (
                        <div style={{
                            padding: '6px 16px 6px 28px',
                            fontSize: 11, color: '#bfbfbf', fontStyle: 'italic',
                        }}>
                            Empty — drag files here
                        </div>
                    ) : (
                        visibleFiles.map(file => (
                            <FileItem
                                key={file.id}
                                file={file}
                                isActive={selectedFile?.id === file.id}
                                isHovered={hoveredFileId === file.id}
                                isDragging={draggingFileId === file.id}
                                indented={true}
                                onFileClick={onFileClick}
                                onHoverEnter={onHoverEnter}
                                onHoverLeave={onHoverLeave}
                                onDragStart={onDragStart}
                                onDelete={onDeleteFile}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default FolderItem;