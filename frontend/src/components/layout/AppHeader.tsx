import React from 'react';
import { Avatar, Dropdown } from 'antd';
import {
    UserOutlined, SettingOutlined, LogoutOutlined,
    DownOutlined, TeamOutlined, ProjectOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import type { User } from '../../types';

interface AppHeaderProps {
    onLogout?: () => void;
    user: User | null;
}

const PAGE_TITLES: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/feedback': 'Feedback',
    '/chat': 'Group Chat',
    '/resources': 'Resources',
    '/settings': 'Settings',
    '/profile': 'User Profile',
};

const NAV_TABS = [
    { key: '/dashboard', label: 'Dashboard' },
    { key: '/feedback', label: 'Feedback' },
    { key: '/chat', label: 'Group Chat' },
    { key: '/resources', label: 'Resources' },
];

const AppHeader: React.FC<AppHeaderProps> = ({ onLogout, user }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const userRole = user?.position ?? null;
    const userJobRole = user?.jobRole ?? null;
    const userName = user?.firstName ?? 'User';

    const handleLogout = () => {
        if (onLogout) onLogout();
        else {
            localStorage.removeItem('token');
            navigate('/');
        }
    };

    const dropdownItems: any[] = [
        { key: 'user-info', icon: <UserOutlined />, label: 'User Info', onClick: () => navigate('/profile') },
        { key: 'settings', icon: <SettingOutlined />, label: 'Settings', onClick: () => navigate('/settings') },
    ];

    if (userRole === 'ADMIN') {
        dropdownItems.push(
            { type: 'divider' },
            { key: 'manage-users', icon: <TeamOutlined />, label: 'Manage Users', onClick: () => navigate('/admin/users') },
            { key: 'manage-projects', icon: <ProjectOutlined />, label: 'Manage Projects', onClick: () => navigate('/admin/projects') },
        );
    } else if (userRole === 'FOUNDER') {
        dropdownItems.push(
            { type: 'divider' },
            { key: 'manage-projects', icon: <ProjectOutlined />, label: 'Manage Projects', onClick: () => navigate('/admin/projects') },
        );
    } else if (userJobRole === 'Art Director') {
        dropdownItems.push(
            { type: 'divider' },
            { key: 'manage-projects-art', icon: <ProjectOutlined />, label: 'Manage Projects (Art)', onClick: () => navigate('/admin/projects?type=art') },
        );
    } else if (userJobRole === 'Dev Director') {
        dropdownItems.push(
            { type: 'divider' },
            { key: 'manage-projects-dev', icon: <ProjectOutlined />, label: 'Manage Projects (Dev)', onClick: () => navigate('/admin/projects?type=dev') },
        );
    } else if (userJobRole === 'Design Director') {
        dropdownItems.push(
            { type: 'divider' },
            { key: 'manage-projects-design', icon: <ProjectOutlined />, label: 'Manage Projects (Design)', onClick: () => navigate('/admin/projects?type=design') },
        );
    }

    dropdownItems.push(
        { type: 'divider' },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: <span style={{ color: '#ff4d4f' }}>Log Out</span>,
            onClick: handleLogout,
        }
    );

    const pageTitle = PAGE_TITLES[location.pathname]
        ?? (location.pathname.startsWith('/admin') ? 'Admin' : 'Dashboard');

    return (
        <div>
            {/* ── Top bar ── */}
            <div style={{
                background: '#fff',
                borderBottom: '1px solid #f0f0f0',
                padding: '0 24px',
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <span style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a' }}>
                    {pageTitle}
                </span>
                <Dropdown menu={{ items: dropdownItems }} trigger={['click']} placement="bottomRight">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} size={32} />
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{userName}</span>
                        <span style={{ fontSize: 11, color: '#8c8c8c' }}>{userRole}</span>
                        <DownOutlined style={{ fontSize: 11, color: '#8c8c8c' }} />
                    </div>
                </Dropdown>
            </div>

            {/* ── Nav tab row ── */}
            <div style={{
                background: '#fff',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                padding: '0 24px',
            }}>
                {NAV_TABS.map(tab => {
                    const isActive = location.pathname === tab.key;
                    return (
                        <div
                            key={tab.key}
                            onClick={() => navigate(tab.key)}
                            style={{
                                padding: '10px 16px',
                                fontSize: 13,
                                fontWeight: isActive ? 500 : 400,
                                color: isActive ? '#1677ff' : '#595959',
                                borderBottom: isActive ? '2px solid #1677ff' : '2px solid transparent',
                                cursor: 'pointer',
                                userSelect: 'none',
                            }}
                        >
                            {tab.label}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AppHeader;