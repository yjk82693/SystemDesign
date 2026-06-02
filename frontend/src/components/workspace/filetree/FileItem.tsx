import React from 'react';
import { Button, Tooltip } from 'antd';
import { FileOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ProjectFile } from '../workspaceTypes';

interface Props {
    file: ProjectFile;
    isActive: boolean;
    isHovered: boolean;
    isDragging: boolean;
    indented: boolean;
    onFileClick: (file: ProjectFile) => void;
    onHoverEnter: (id: number) => void;
    onHoverLeave: () => void;
    onDragStart: (e: React.DragEvent, file: ProjectFile) => void;
    onDelete: (file: ProjectFile) => void;
}

const FileItem: React.FC<Props> = ({
    file, isActive, isHovered, isDragging, indented,
    onFileClick, onHoverEnter, onHoverLeave, onDragStart, onDelete,
}) => {
    return (
        <div
            draggable
            onDragStart={e => onDragStart(e, file)}
            onClick={() => onFileClick(file)}
            onMouseEnter={() => onHoverEnter(file.id)}
            onMouseLeave={onHoverLeave}
            style={{
                padding: `7px 8px 7px ${indented ? 28 : 16}px`,
                cursor: 'grab',
                background: isActive ? '#e6f4ff' : isHovered ? '#f5f5f5' : 'transparent',
                borderLeft: isActive ? '3px solid #1677ff' : '3px solid transparent',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 12,
                color: isActive ? '#1677ff' : '#1a1a1a',
                transition: 'all 0.15s',
                opacity: isDragging ? 0.4 : 1,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                <FileOutlined style={{ fontSize: 12, flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                </span>
            </div>
            {isHovered && (
                <Tooltip title="Delete">
                    <Button
                        type="text" size="small" danger
                        icon={<DeleteOutlined style={{ fontSize: 11 }} />}
                        onClick={e => { e.stopPropagation(); onDelete(file); }}
                    />
                </Tooltip>
            )}
        </div>
    );
};

export default FileItem;