import React from 'react';
import type { Category, ViewMode } from './resourceTypes';
import { categoryColor } from './resourceUtils';

interface Props {
    categories: Category[];
    viewMode: ViewMode;
    onSelect: (category: Category) => void;
}

const CategoryGrid: React.FC<Props> = ({ categories, viewMode, onSelect }) => {
    if (categories.length === 0) {
        return (
            <div style={{
                textAlign: 'center', padding: 48,
                color: '#8c8c8c', fontSize: 13,
                background: '#fff', borderRadius: 10,
                border: '1px solid #f0f0f0',
            }}>
                No categories yet — ask an admin to add some!
            </div>
        );
    }

    return (
        <div style={{
            display: viewMode === 'grid' ? 'grid' : 'flex',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            flexDirection: 'column',
            gap: 10,
        }}>
            {categories.map(cat => (
                <div
                    key={cat.id}
                    onClick={() => onSelect(cat)}
                    style={{
                        padding: viewMode === 'grid' ? 20 : '12px 16px',
                        background: '#fff',
                        borderRadius: 10,
                        border: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderColor = categoryColor(cat.name);
                        e.currentTarget.style.boxShadow = `0 2px 8px ${categoryColor(cat.name)}22`;
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#f0f0f0';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    {/* Color dot */}
                    <div style={{
                        width: viewMode === 'grid' ? 44 : 36,
                        height: viewMode === 'grid' ? 44 : 36,
                        borderRadius: 10,
                        background: `${categoryColor(cat.name)}22`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: viewMode === 'grid' ? 22 : 18,
                        flexShrink: 0,
                    }}>
                        📁
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
                            {cat.name}
                        </div>
                        {cat.description && (
                            <div style={{
                                fontSize: 11, color: '#8c8c8c', marginTop: 2,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                                {cat.description}
                            </div>
                        )}
                        <div style={{ fontSize: 11, color: '#bfbfbf', marginTop: 2 }}>
                            {cat._count.resources} resource{cat._count.resources !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CategoryGrid;