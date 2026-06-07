import React from 'react';
import {
    FileOutlined, LinkOutlined, FilePdfOutlined,
    FileImageOutlined, FileTextOutlined, VideoCameraOutlined,
} from '@ant-design/icons';
import type { Resource, ViewMode } from './resourceTypes';
import { timeAgo } from './resourceUtils';

interface Props {
    resources: Resource[];
    viewMode: ViewMode;
}

function resourceIcon(resource: Resource) {
    if (resource.type === 'LINK') return <LinkOutlined style={{ color: '#1677ff', fontSize: 18 }} />;
    switch (resource.fileType) {
        case 'PDF': return <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />;
        case 'IMAGE': return <FileImageOutlined style={{ color: '#52c41a', fontSize: 18 }} />;
        case 'VIDEO': return <VideoCameraOutlined style={{ color: '#722ed1', fontSize: 18 }} />;
        case 'DOC': return <FileTextOutlined style={{ color: '#fa8c16', fontSize: 18 }} />;
        default: return <FileOutlined style={{ color: '#8c8c8c', fontSize: 18 }} />;
    }
}

const ResourceGrid: React.FC<Props> = ({ resources, viewMode }) => {
    if (resources.length === 0) {
        return (
            <div style={{
                textAlign: 'center', padding: 48,
                color: '#8c8c8c', fontSize: 13,
                background: '#fff', borderRadius: 10,
                border: '1px solid #f0f0f0',
            }}>
                No resources here yet
            </div>
        );
    }

    return (
        <div style={{
            display: viewMode === 'grid' ? 'grid' : 'flex',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            flexDirection: 'column',
            gap: 8,
        }}>
            {resources.map(resource => (
                <div
                    key={resource.id}
                    onClick={() => window.open(resource.url, '_blank')}
                    style={{
                        padding: viewMode === 'grid' ? 16 : '12px 16px',
                        background: '#fff',
                        borderRadius: 8,
                        border: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: viewMode === 'grid' ? 'flex-start' : 'center',
                        flexDirection: viewMode === 'grid' ? 'column' : 'row',
                        gap: viewMode === 'grid' ? 10 : 14,
                        transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#1677ff')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#f0f0f0')}
                >
                    <div style={{ flexShrink: 0 }}>{resourceIcon(resource)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontSize: 13, fontWeight: 500,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {resource.name}
                        </div>
                        {resource.description && (
                            <div style={{
                                fontSize: 11, color: '#8c8c8c', marginTop: 2,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                                {resource.description}
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <span style={{ fontSize: 11, color: '#bfbfbf' }}>
                                {timeAgo(resource.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ResourceGrid;