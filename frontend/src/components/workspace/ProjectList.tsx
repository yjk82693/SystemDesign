import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import type { Project } from './workspaceTypes';

interface Props {
    projects: Project[];
    selectedProject: Project | null;
    loading: boolean;
    onSelect: (project: Project) => void;
}

const ProjectList: React.FC<Props> = ({ projects, selectedProject, loading, onSelect }) => {
    return (
        <div style={{
            width: 200,
            borderRight: '1px solid #f0f0f0',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            background: '#fafafa',
        }}>
            <div style={{
                padding: '12px 16px',
                fontSize: 11,
                fontWeight: 600,
                color: '#8c8c8c',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                borderBottom: '1px solid #f0f0f0',
            }}>
                List of Projects
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                    <Spin indicator={<LoadingOutlined />} />
                </div>
            ) : projects.length === 0 ? (
                <div style={{ padding: 16, fontSize: 12, color: '#8c8c8c' }}>
                    No projects assigned yet
                </div>
            ) : (
                projects.map(project => {
                    const isActive = selectedProject?.id === project.id;
                    return (
                        <div
                            key={project.id}
                            onClick={() => onSelect(project)}
                            style={{
                                padding: '10px 16px',
                                cursor: 'pointer',
                                background: isActive ? '#e6f4ff' : 'transparent',
                                borderLeft: isActive ? '3px solid #1677ff' : '3px solid transparent',
                                borderBottom: '1px solid #f0f0f0',
                                transition: 'all 0.15s',
                            }}
                        >
                            <div style={{
                                fontSize: 13,
                                fontWeight: isActive ? 500 : 400,
                                color: isActive ? '#1677ff' : '#1a1a1a',
                                marginBottom: 2,
                            }}>
                                {project.name}
                            </div>
                            {project.description && (
                                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                                    {project.description}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default ProjectList;