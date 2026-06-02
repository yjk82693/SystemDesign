import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Card, Tag, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    publicId: string;
    jobRole: string;
}

interface Project {
    id: number;
    name: string;
    description: string | null;
    createdAt: string;
    users: User[];
    _count: { files: number };
}

const ProjectTable: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [form] = Form.useForm();

    const token = localStorage.getItem('token');

    const loadProjects = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5001/admin/projects', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setProjects(await res.json());
            else message.error('Failed to load projects');
        } catch {
            message.error('Error loading projects');
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const res = await fetch('http://localhost:5001/admin/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setAllUsers(await res.json());
        } catch {
            console.error('Failed to load users');
        }
    };

    useEffect(() => {
        loadProjects();
        loadUsers();
    }, []);

    const handleCreate = () => {
        setEditingProject(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        form.setFieldsValue({
            name: project.name,
            description: project.description,
            userIds: project.users.map(u => u.id),
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (projectId: number) => {
        Modal.confirm({
            title: 'Delete Project',
            content: 'Are you sure? This will delete all files in this project.',
            okType: 'danger',
            onOk: async () => {
                try {
                    const res = await fetch(`http://localhost:5001/admin/projects/${projectId}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                        message.success('Project deleted');
                        loadProjects();
                    } else {
                        message.error('Failed to delete project');
                    }
                } catch {
                    message.error('Error deleting project');
                }
            }
        });
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const url = editingProject
                ? `http://localhost:5001/admin/projects/${editingProject.id}`
                : 'http://localhost:5001/admin/projects';
            const method = editingProject ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(values),
            });

            if (res.ok) {
                message.success(editingProject ? 'Project updated' : 'Project created');
                setIsModalOpen(false);
                loadProjects();
            } else {
                message.error('Failed to save project');
            }
        } catch {
            message.error('Please fill in all required fields');
        }
    };

    const columns: ColumnsType<Project> = [
        {
            title: 'Project Name',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            render: (name) => <span style={{ fontWeight: 500 }}>{name}</span>
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: 250,
            render: (desc) => desc || <span style={{ color: '#8c8c8c' }}>—</span>
        },
        {
            title: 'Members',
            key: 'users',
            width: 250,
            render: (_, record) => (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {record.users.length === 0
                        ? <span style={{ color: '#8c8c8c', fontSize: 12 }}>No members</span>
                        : record.users.map(u => (
                            <Tag key={u.id} icon={<TeamOutlined />} color="blue">
                                {u.firstName} {u.lastName}
                            </Tag>
                        ))
                    }
                </div>
            )
        },
        {
            title: 'Files',
            key: 'files',
            width: 80,
            render: (_, record) => (
                <Tag>{record._count.files} files</Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            type="text"
                            shape="circle"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.id)}
                        />
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <Card
            bordered={false}
            styles={{ body: { padding: 0 } }}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 12 }}
        >
            {/* Header */}
            <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>Project Management</span>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    New Project
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={projects}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 8 }}
                scroll={{ x: 900 }}
            />

            {/* Create / Edit Modal */}
            <Modal
                title={editingProject ? 'Edit Project' : 'Create Project'}
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
                okText={editingProject ? 'Save Changes' : 'Create'}
            >
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item
                        name="name"
                        label="Project Name"
                        rules={[{ required: true, message: 'Please enter a project name' }]}
                    >
                        <Input placeholder="e.g. Farnimal v2.0" />
                    </Form.Item>

                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={3} placeholder="Brief description of the project..." />
                    </Form.Item>

                    <Form.Item name="userIds" label="Assign Members">
                        <Select
                            mode="multiple"
                            placeholder="Select team members"
                            optionFilterProp="label"
                            options={allUsers.map(u => ({
                                value: u.id,
                                label: `${u.firstName} ${u.lastName} (${u.jobRole})`,
                            }))}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default ProjectTable;