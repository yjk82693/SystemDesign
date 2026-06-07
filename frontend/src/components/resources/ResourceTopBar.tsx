import React from 'react';
import { Input, Button, Tooltip } from 'antd';
import { SearchOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import type { ViewMode } from './resourceTypes';

interface Props {
    search: string;
    onSearch: (val: string) => void;
    viewMode: ViewMode;
    onViewChange: (mode: ViewMode) => void;
}

const ResourceTopBar: React.FC<Props> = ({ search, onSearch, viewMode, onViewChange }) => {
    return (
        <div style={{
            display: 'flex', gap: 12, marginBottom: 16,
            alignItems: 'center', flexWrap: 'wrap',
        }}>
            <Input.Search
                placeholder="Search resources..."
                style={{ width: 320 }}
                value={search}
                onChange={e => onSearch(e.target.value)}
                onSearch={onSearch}
                allowClear
                enterButton
            />
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                <Tooltip title="Grid view">
                    <Button
                        type={viewMode === 'grid' ? 'primary' : 'text'}
                        icon={<AppstoreOutlined />}
                        onClick={() => onViewChange('grid')}
                    />
                </Tooltip>
                <Tooltip title="List view">
                    <Button
                        type={viewMode === 'list' ? 'primary' : 'text'}
                        icon={<UnorderedListOutlined />}
                        onClick={() => onViewChange('list')}
                    />
                </Tooltip>
            </div>
        </div>
    );
};

export default ResourceTopBar;