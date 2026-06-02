import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
    DashboardOutlined, SettingOutlined, LogoutOutlined,
    LeftOutlined, RightOutlined, TeamOutlined, ProjectOutlined,
    MessageOutlined, BookOutlined, PlayCircleOutlined, CommentOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

interface AppSidebarProps {
    onLogout?: () => void;
    userRole: string | null;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ onLogout, userRole }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        if (onLogout) onLogout();
        else {
            localStorage.removeItem('token');
            navigate('/');
        }
    };

    const menuItems: any[] = [
        { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
        { type: 'divider' },
        {
            key: 'features',
            icon: <ProjectOutlined />,
            label: 'Features',
            children: [
                { key: '/feedback', icon: <MessageOutlined />, label: 'Feedback' },
                { key: '/chat', icon: <CommentOutlined />, label: 'Group Chat' },
                { key: '/resources', icon: <BookOutlined />, label: 'Resources' },
                { key: '/guides', icon: <PlayCircleOutlined />, label: 'Guides' },
            ],
        },
        { type: 'divider' },
        ...((['ADMIN', 'FOUNDER'].includes(userRole || '')) ? [{
            key: 'admin',
            icon: <TeamOutlined />,
            label: 'Admin',
            children: [
                { key: '/admin/users', icon: <TeamOutlined />, label: 'User Management' },
                { key: '/admin/projects', icon: <ProjectOutlined />, label: 'Projects' },
            ],
        }] : []),
        { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
    ];

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            theme="light"
            width={220}
            style={{
                borderRight: '1px solid #f0f0f0',
                boxShadow: '2px 0 8px rgba(29,35,41,.05)',
                zIndex: 10,
                position: 'relative',
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Logo */}
                <div style={{
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? 0 : '0 20px',
                    borderBottom: '1px solid #f0f0f0',
                }}>
                    <div style={{
                        width: 28, height: 28,
                        background: '#1677ff', borderRadius: 6,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
                        marginRight: collapsed ? 0 : 10,
                    }}>S</div>
                    {!collapsed && <span style={{ fontSize: 16, fontWeight: 700, color: '#001529' }}>Studio OS</span>}
                </div>

                {/* Menu */}
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    defaultOpenKeys={['features']}
                    onClick={({ key }) => navigate(key)}
                    items={menuItems}
                    style={{ borderRight: 0, flex: 1, paddingTop: 8 }}
                />

                {/* Logout */}
                <div style={{ borderTop: '1px solid #f0f0f0', padding: '8px 0' }}>
                    <Menu
                        theme="light"
                        mode="inline"
                        selectable={false}
                        items={[{
                            key: 'logout',
                            icon: <LogoutOutlined style={{ color: '#ff4d4f' }} />,
                            label: <span style={{ color: '#ff4d4f' }}>Log Out</span>,
                            onClick: handleLogout,
                        }]}
                        style={{ borderRight: 0 }}
                    />
                </div>
            </div>

            {/* Collapse toggle */}
            <div
                onClick={() => setCollapsed(!collapsed)}
                style={{
                    position: 'absolute', top: '50%', right: -12,
                    transform: 'translateY(-50%)',
                    width: 24, height: 48,
                    background: '#fff',
                    border: '1px solid #f0f0f0',
                    borderLeft: 'none',
                    borderRadius: '0 4px 4px 0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', zIndex: 11,
                }}
            >
                {collapsed
                    ? <RightOutlined style={{ fontSize: 10, color: '#8c8c8c' }} />
                    : <LeftOutlined style={{ fontSize: 10, color: '#8c8c8c' }} />}
            </div>
        </Sider>
    );
};

export default AppSidebar;