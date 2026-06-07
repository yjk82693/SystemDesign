import React from 'react';
import { FolderOutlined } from '@ant-design/icons';
import type { Resource, ViewMode } from './resourceTypes';

interface Props {
    folders: string[];
    resources: Resource[];
    viewMode: ViewMode;
    onSelect: (folder: string) => void;
}

const FolderGrid: React.FC<Props> = ({ folders, resources, viewMode, onSelect }) => {
    if (folders.length === 0) return null;

    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{
                fontSize: 11, color: '#8c8c8c', marginBottom: 8,
                fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
                Folders
            </div>
            <div style={{
                display: viewMode === 'grid' ? 'grid' : 'flex',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                flexDirection: 'column',
                gap: 8,
            }}>
                {folders.map(folder => (
                    <div
                        key={folder}
                        onClick={() => onSelect(folder)}
                        style={{
                            padding: viewMode === 'grid' ? 16 : '10px 16px',
                            background: '#fff',
                            borderRadius: 8,
                            border: '1px solid #f0f0f0',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#1677ff')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#f0f0f0')}
                    >
                        <FolderOutlined style={{ fontSize: 20, color: '#fa8c16' }} />
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{folder}</div>
                            <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                                {resources.filter(r => r.folder === folder).length} files
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FolderGrid;