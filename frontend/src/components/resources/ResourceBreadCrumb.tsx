import React from 'react';
import type { Category } from './resourceTypes';

interface Props {
    selectedCategory: Category | null;
    selectedFolder: string | null;
    onRootClick: () => void;
    onCategoryClick: () => void;
}

const ResourceBreadcrumb: React.FC<Props> = ({
    selectedCategory, selectedFolder, onRootClick, onCategoryClick
}) => {
    if (!selectedCategory) return null;

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 12, fontSize: 13, color: '#595959',
        }}>
            <span
                style={{ color: '#1677ff', cursor: 'pointer' }}
                onClick={onRootClick}
            >
                Resources
            </span>
            <span>/</span>
            <span
                style={{ color: selectedFolder ? '#1677ff' : '#1a1a1a', cursor: selectedFolder ? 'pointer' : 'default' }}
                onClick={selectedFolder ? onCategoryClick : undefined}
            >
                {selectedCategory.name}
            </span>
            {selectedFolder && (
                <>
                    <span>/</span>
                    <span>{selectedFolder}</span>
                </>
            )}
        </div>
    );
};

export default ResourceBreadcrumb;