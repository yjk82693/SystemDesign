import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Card, Tag, Tabs } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, UploadOutlined, LinkOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Category {
    id: number;
    name: string;
    description: string | null;
    _count: { resources: number };
}

interface Resource {
    id: number;
    name: string;
    description: string | null;
    type: string;
    fileType: string | null;
    url: string;
    folder: string | null;
    createdAt: string;
    category: { id: number; name: string };
    createdBy: { firstName: string; lastName: string };
}

export default function ResourceManager() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(false);

    const [catModal, setCatModal] = useState(false);
    const [resModal, setResModal] = useState(false);
    const [editingRes, setEditingRes] = useState<Resource | null>(null);
    const [uploadType, setUploadType] = useState<'FILE' | 'LINK'>('FILE');

    const [catForm] = Form.useForm();
    const [resForm] = Form.useForm();
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchCategories();
        fetchResources();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('http://localhost:5001/resources/categories', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setCategories(await res.json());
        } catch { console.error('Failed to load categories'); }
    };

    const fetchResources = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5001/resources', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setResources(await res.json());
        } catch { message.error('Failed to load resources'); }
        finally { setLoading(false); }
    };

    const handleCreateCategory = async () => {
        try {
            const values = await catForm.validateFields();
            const res = await fetch('http://localhost:5001/resources/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(values),
            });
            if (res.ok) {
                message.success('Category created');
                setCatModal(false);
                catForm.resetFields();
                fetchCategories();
            } else {
                const data = await res.json();
                message.error(data.message || 'Failed to create category');
            }
        } catch { message.error('Please fill in required fields'); }
    };

    const handleDeleteCategory = (id: number) => {
        Modal.confirm({
            title: 'Delete category?',
            content: 'All resources in this category will also be deleted.',
            okType: 'danger',
            onOk: async () => {
                const res = await fetch(`http://localhost:5001/resources/categories/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    message.success('Category deleted');
                    fetchCategories();
                    fetchResources();
                } else {
                    message.error('Failed to delete category');
                }
            }
        });
    };

    const handleSaveResource = async () => {
        try {
            const values = await resForm.validateFields();
            const url = editingRes
                ? `http://localhost:5001/resources/${editingRes.id}`
                : 'http://localhost:5001/resources';
            const method = editingRes ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ...values, type: uploadType }),
            });

            if (res.ok) {
                message.success(editingRes ? 'Resource updated' : 'Resource created');
                setResModal(false);
                setEditingRes(null);
                resForm.resetFields();
                fetchResources();
            } else {
                message.error('Failed to save resource');
            }
        } catch { message.error('Please fill in required fields'); }
    };

    const handleDeleteResource = (id: number) => {
        Modal.confirm({
            title: 'Delete resource?',
            okType: 'danger',
            onOk: async () => {
                const res = await fetch(`http://localhost:5001/resources/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    message.success('Resource deleted');
                    fetchResources();
                } else {
                    message.error('Failed to delete');
                }
            }
        });
    };

    const handleEditResource = (resource: Resource) => {
        setEditingRes(resource);
        setUploadType(resource.type as 'FILE' | 'LINK');
        resForm.setFieldsValue({
            name: resource.name,
            description: resource.description,
            fileType: resource.fileType,
            url: resource.url,
            folder: resource.folder,
            categoryId: resource.category.id,
        });
        setResModal(true);
    };

    const catColumns: ColumnsType<Category> = [
        { title: 'Name', dataIndex: 'name', key: 'name', render: name => <strong>{name}</strong> },
        { title: 'Description', dataIndex: 'description', key: 'description', render: d => d || '—' },
        {
            title: 'Resources', key: 'count',
            render: (_, r) => <Tag>{r._count.resources} resources</Tag>
        },
        {
            title: 'Actions', key: 'actions', width: 80,
            render: (_, r) => (
                <Button danger type="text" icon={<DeleteOutlined />}
                    onClick={() => handleDeleteCategory(r.id)} />
            )
        }
    ];

    const resColumns: ColumnsType<Resource> = [
        {
            title: 'Name', dataIndex: 'name', key: 'name', width: 200,
            render: (name, r) => (
                <a href={r.url} target="_blank" rel="noreferrer">{name}</a>
            )
        },
        {
            title: 'Category', key: 'category',
            render: (_, r) => <Tag color="blue">{r.category.name}</Tag>
        },
        { title: 'Folder', dataIndex: 'folder', key: 'folder', render: f => f || '—' },
        {
            title: 'Type', key: 'type',
            render: (_, r) => <Tag>{r.type === 'LINK' ? 'Link' : r.fileType || 'File'}</Tag>
        },
        {
            title: 'Added by', key: 'createdBy',
            render: (_, r) => `${r.createdBy.firstName} ${r.createdBy.lastName}`
        },
        {
            title: 'Actions', key: 'actions', width: 100,
            render: (_, r) => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <Button type="text" icon={<EditOutlined />} onClick={() => handleEditResource(r)} />
                    <Button danger type="text" icon={<DeleteOutlined />} onClick={() => handleDeleteResource(r.id)} />
                </div>
            )
        }
    ];

    return (
        <Card bordered={false} styles={{ body: { padding: 0 } }}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 12 }}>
            <Tabs
                style={{ padding: '0 24px' }}
                items={[
                    {
                        key: 'resources',
                        label: 'Resources',
                        children: (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                                    <Button type="primary" icon={<PlusOutlined />}
                                        onClick={() => { setEditingRes(null); resForm.resetFields(); setResModal(true); }}>
                                        Add Resource
                                    </Button>
                                </div>
                                <Table
                                    columns={resColumns}
                                    dataSource={resources}
                                    rowKey="id"
                                    loading={loading}
                                    pagination={{ pageSize: 10 }}
                                />
                            </>
                        )
                    },
                    {
                        key: 'categories',
                        label: 'Categories',
                        children: (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                                    <Button type="primary" icon={<PlusOutlined />}
                                        onClick={() => setCatModal(true)}>
                                        Add Category
                                    </Button>
                                </div>
                                <Table
                                    columns={catColumns}
                                    dataSource={categories}
                                    rowKey="id"
                                    pagination={{ pageSize: 10 }}
                                />
                            </>
                        )
                    }
                ]}
            />

            {/* ── Category Modal ── */}
            <Modal title="New Category" open={catModal}
                onOk={handleCreateCategory} onCancel={() => { setCatModal(false); catForm.resetFields(); }}
                okText="Create">
                <Form form={catForm} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="name" label="Category Name"
                        rules={[{ required: true, message: 'Please enter a name' }]}>
                        <Input placeholder="e.g. Python, Unity, Blender" />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={2} placeholder="Brief description..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* ── Resource Modal ── */}
            <Modal
                title={editingRes ? 'Edit Resource' : 'Add Resource'}
                open={resModal}
                onOk={handleSaveResource}
                onCancel={() => { setResModal(false); setEditingRes(null); resForm.resetFields(); }}
                okText={editingRes ? 'Save' : 'Add'}
            >
                <Form form={resForm} layout="vertical" style={{ marginTop: 16 }}>
                    {/* Type toggle */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                        <Button
                            type={uploadType === 'FILE' ? 'primary' : 'default'}
                            icon={<UploadOutlined />}
                            onClick={() => setUploadType('FILE')}
                        >
                            File
                        </Button>
                        <Button
                            type={uploadType === 'LINK' ? 'primary' : 'default'}
                            icon={<LinkOutlined />}
                            onClick={() => setUploadType('LINK')}
                        >
                            Link
                        </Button>
                    </div>

                    <Form.Item name="name" label="Name"
                        rules={[{ required: true, message: 'Please enter a name' }]}>
                        <Input placeholder="e.g. Python Environment Setup Guide" />
                    </Form.Item>

                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={2} placeholder="Brief description..." />
                    </Form.Item>

                    <Form.Item name="categoryId" label="Category"
                        rules={[{ required: true, message: 'Please select a category' }]}>
                        <Select
                            placeholder="Select category"
                            options={categories.map(c => ({ value: c.id, label: c.name }))}
                        />
                    </Form.Item>

                    <Form.Item name="folder" label="Folder (optional)">
                        <Input placeholder="e.g. Getting Started, Advanced, References" />
                    </Form.Item>

                    {uploadType === 'FILE' && (
                        <Form.Item name="fileType" label="File Type"
                            rules={[{ required: true, message: 'Please select file type' }]}>
                            <Select options={[
                                { value: 'PDF', label: 'PDF' },
                                { value: 'IMAGE', label: 'Image' },
                                { value: 'VIDEO', label: 'Video' },
                                { value: 'DOC', label: 'Document' },
                            ]} />
                        </Form.Item>
                    )}

                    <Form.Item name="url" label={uploadType === 'FILE' ? 'File URL' : 'Link URL'}
                        rules={[{ required: true, message: 'Please enter a URL' }]}>
                        <Input placeholder={uploadType === 'FILE'
                            ? 'https://...'
                            : 'https://docs.python.org/3/'} />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
}