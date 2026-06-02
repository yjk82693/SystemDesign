import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import AppSidebar from '../components/layout/AppSidebar';
import AppHeader from '../components/layout/AppHeader';
import type { User } from '../types';

const { Content } = Layout;

interface MainLayoutProps {
    onLogout?: () => void;
    user?: User | null;
}

const MainLayout: React.FC<MainLayoutProps> = ({ onLogout, user }) => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <AppSidebar onLogout={onLogout} userRole={user?.position ?? null} />
            <Layout style={{ background: '#f5f7fa', flex: 1, minWidth: 0 }}>
                <AppHeader onLogout={onLogout} user={user ?? null} />
                <Content style={{ margin: 24, minHeight: 280, overflow: 'auto' }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;