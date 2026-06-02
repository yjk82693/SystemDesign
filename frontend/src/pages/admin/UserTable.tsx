import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Input, Tooltip, Modal, message, Card, Select, Typography, Form, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, SearchOutlined, TrophyOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface User {
    id: number;
    publicId: string;
    firstName: string;
    lastName: string;
    email: string;
    jobRole: string;
    position: string;
    assignedGames: { id: number; name: string }[];
}

interface Project {
    id: number;
    name: string;
}

const TRACK_POSITIONS: Record<string, string[]> = {
    Developer: ['Developer', 'Lead Developer', 'Dev Director'],
    Artist: ['Artist', 'Lead Artist', 'Art Director'],
    Designer: ['Designer', 'Lead Designer', 'Design Director'],
};

const ALL_TRACKS = Object.keys(TRACK_POSITIONS);

function getTrackForRole(role: string): string | null {
    for (const track of ALL_TRACKS) {
        if (TRACK_POSITIONS[track].includes(role) || track === role) {
            return track;
        }
    }
    return null;
}

function getPositionsForTrack(track: string): { value: string; label: string }[] {
    return (TRACK_POSITIONS[track] || []).map(p => ({ value: p, label: p }));
}

const POSITION_COLORS: Record<string, string> = {
    FOUNDER: 'gold',
    ADMIN: 'purple',
    USER: 'blue',
    'Dev Director': 'blue',
    'Art Director': 'magenta',
    'Design Director': 'cyan',
    'Lead Developer': 'geekblue',
    'Lead Artist': 'pink',
    'Lead Designer': 'lime',
    Developer: 'default',
    Artist: 'default',
    Designer: 'default',
};

const UserTable: React.FC = () => {
    const [searchText, setSearchText] = useState('');
    const [filterPosition, setFilterPosition] = useState<string | null>(null);
    const [data, setData] = useState<User[]>([]);
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [switchingTrack, setSwitchingTrack] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
    const [form] = Form.useForm();

    const token = localStorage.getItem('token');

    const fetchCurrentUser = async () => {
        if (!token) return;
        try {
            const res = await fetch('http://localhost:5001/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setCurrentUser(await res.json());
        } catch {
            console.error('Failed to fetch current user');
        }
    };

    const loadUsers = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5001/admin/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setData(await res.json());
            else message.error('Failed to load users');
        } catch {
            message.error('Error loading users');
        } finally {
            setLoading(false);
        }
    };

    const loadProjects = async () => {
        if (!token) return;
        try {
            const res = await fetch('http://localhost:5001/admin/projects', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setAllProjects(data.map((p: any) => ({ id: p.id, name: p.name })));
            }
        } catch {
            console.error('Failed to load projects');
        }
    };

    useEffect(() => {
        fetchCurrentUser();
        loadUsers();
        loadProjects();
    }, []);

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setSwitchingTrack(false);
        const userTrack = getTrackForRole(user.jobRole);
        setSelectedTrack(userTrack);
        form.setFieldsValue({
            position: user.position,
            jobRole: user.jobRole,
            currentGameIds: user.assignedGames?.map(g => g.id) || [],
            newTrack: null,
            reason: '',
        });
        setIsModalOpen(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (!editingUser) return;

            // ── Assign games ──
            const newGameIds = (values.currentGameIds || []).sort();
            const oldGameIds = (editingUser.assignedGames?.map(g => g.id) || []).sort();
            const gameIdsChanged = JSON.stringify(newGameIds) !== JSON.stringify(oldGameIds);

            if (gameIdsChanged) {
                const res = await fetch('http://localhost:5001/admin/assign-game', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        userId: editingUser.id,
                        projectIds: values.currentGameIds || [],
                    }),
                });
                if (!res.ok) { message.error('Failed to assign games'); return; }
            }

            // ── Track switch ──
            if (switchingTrack && values.newTrack && values.newTrack !== selectedTrack) {
                if (!values.reason?.trim()) {
                    message.error('Please provide a reason for the track switch');
                    return;
                }
                await fetch('http://localhost:5001/admin/switch-track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        userId: editingUser.id,
                        newTrack: values.newTrack,
                        reason: values.reason,
                    }),
                });
            }

            // ── Position / jobRole update ──
            const positionChanged = values.position !== editingUser.position;
            const jobRoleChanged = values.jobRole !== editingUser.jobRole;

            if (positionChanged || jobRoleChanged) {
                if (!values.reason?.trim()) {
                    message.error('Please provide a reason for the change');
                    return;
                }
                await fetch('http://localhost:5001/admin/update-position', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        userId: editingUser.id,
                        position: values.position,
                        jobRole: values.jobRole,
                        reason: values.reason,
                    }),
                });
            }

            message.success('User updated successfully');
            setIsModalOpen(false);
            loadUsers();
        } catch {
            message.error('Failed to update user');
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSwitchingTrack(false);
        form.resetFields();
    };

    const filteredData = data.filter(item => {
        const matchesSearch =
            item.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.email.toLowerCase().includes(searchText.toLowerCase()) ||
            item.publicId.toLowerCase().includes(searchText.toLowerCase());
        const matchesPosition = filterPosition ? item.position === filterPosition : true;
        return matchesSearch && matchesPosition;
    });

    const canEdit = ['ADMIN', 'FOUNDER'].includes(currentUser?.position || '');

    const positionOptions = selectedTrack
        ? getPositionsForTrack(
            switchingTrack
                ? (form.getFieldValue('newTrack') || selectedTrack)
                : selectedTrack
        )
        : [];

    const columns: ColumnsType<User> = [
        { title: 'First Name', dataIndex: 'firstName', key: 'firstName', width: 130 },
        { title: 'Last Name', dataIndex: 'lastName', key: 'lastName', width: 130 },
        { title: 'Email', dataIndex: 'email', key: 'email', width: 220 },
        {
            title: 'Public ID', dataIndex: 'publicId', key: 'publicId', width: 130,
            render: text => <Text code>{text}</Text>,
        },
        {
            title: 'Job Role', dataIndex: 'jobRole', key: 'jobRole', width: 150,
            render: role => (
                <Tag color={POSITION_COLORS[role] || 'default'}>{role}</Tag>
            ),
        },
        {
            title: 'Position', dataIndex: 'position', key: 'position', width: 120,
            render: position => (
                <Tag
                    color={POSITION_COLORS[position] || 'default'}
                    style={{ minWidth: 70, textAlign: 'center', fontWeight: 600, padding: '4px 8px' }}
                >
                    {position}
                </Tag>
            ),
        },
        {
            title: 'Games', dataIndex: 'assignedGames', key: 'assignedGames', width: 200,
            render: (games: { id: number; name: string }[]) =>
                games && games.length > 0
                    ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {games.map(g => (
                            <Tag key={g.id} color="geekblue" icon={<TrophyOutlined />}>
                                {g.name}
                            </Tag>
                        ))}
                      </div>
                    : <Text type="secondary">—</Text>,
        },
        {
            title: 'Action', key: 'action', width: 80, fixed: 'right',
            render: (_, record) => canEdit ? (
                <Tooltip title="Edit User">
                    <Button
                        type="text"
                        shape="circle"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                </Tooltip>
            ) : null,
        },
    ];

    return (
        <Card
            bordered={false}
            styles={{ body: { padding: 0 } }}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 12, width: '100%' }}
        >
            {/* Search & Filter */}
            <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
            }}>
                <Input
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    placeholder="Search by name, ID, email..."
                    style={{ width: 340, borderRadius: 8 }}
                    size="large"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                />
                <Select
                    placeholder="Filter by position"
                    allowClear
                    style={{ width: 180 }}
                    size="large"
                    onChange={setFilterPosition}
                    options={[
                        { value: 'FOUNDER', label: 'Founder' },
                        { value: 'ADMIN', label: 'Admin' },
                        { value: 'USER', label: 'User' },
                    ]}
                />
            </div>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={filteredData}
                pagination={{ pageSize: 8 }}
                rowKey="id"
                scroll={{ x: 1100 }}
                loading={loading}
                locale={{
                    emptyText: (
                        <div style={{ padding: 40, textAlign: 'center' }}>
                            <Text type="secondary">No users found</Text>
                        </div>
                    ),
                }}
            />

            {/* Edit Modal */}
            <Modal
                title={`Edit — ${editingUser?.firstName} ${editingUser?.lastName}`}
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={handleModalClose}
                okText="Save Changes"
            >
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>

                    {/* System position */}
                    <Form.Item name="position" label="System Position">
                        <Select options={[
                            { value: 'USER', label: 'User' },
                            { value: 'ADMIN', label: 'Admin' },
                            { value: 'FOUNDER', label: 'Founder' },
                        ]} />
                    </Form.Item>

                    {/* Job role */}
                    <Form.Item name="jobRole" label="Job Role">
                        <Select
                            options={positionOptions.length > 0 ? positionOptions : [
                                { value: editingUser?.jobRole || '', label: editingUser?.jobRole || '' }
                            ]}
                            disabled={switchingTrack}
                        />
                    </Form.Item>

                    {/* Track switch toggle */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        marginBottom: 16, padding: '10px 12px',
                        background: '#f5f7fa', borderRadius: 8,
                    }}>
                        <Switch
                            checked={switchingTrack}
                            onChange={val => {
                                setSwitchingTrack(val);
                                if (!val) {
                                    form.setFieldValue('newTrack', null);
                                    form.setFieldValue('jobRole', editingUser?.jobRole);
                                    setSelectedTrack(getTrackForRole(editingUser?.jobRole || ''));
                                }
                            }}
                            size="small"
                        />
                        <span style={{ fontSize: 13, color: '#595959' }}>
                            Switch to a different track
                        </span>
                    </div>

                    {/* New track selector */}
                    {switchingTrack && (
                        <Form.Item
                            name="newTrack"
                            label="New Track"
                            rules={[{ required: true, message: 'Please select a new track' }]}
                        >
                            <Select
                                placeholder="Select track"
                                options={ALL_TRACKS.map(t => ({ value: t, label: t }))}
                                onChange={track => {
                                    setSelectedTrack(track);
                                    form.setFieldValue('jobRole', TRACK_POSITIONS[track]?.[0]);
                                }}
                            />
                        </Form.Item>
                    )}

                    {/* Reason */}
                    <Form.Item
                        name="reason"
                        label="Reason for change"
                        rules={[{ required: true, message: 'Please provide a reason' }]}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="e.g. Promoted due to outstanding performance..."
                        />
                    </Form.Item>

                    {/* Assign Games — multi select */}
                    <Form.Item name="currentGameIds" label="Assign Games">
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Select games (projects)"
                            options={allProjects.map(p => ({
                                value: p.id,
                                label: p.name,
                            }))}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default UserTable;