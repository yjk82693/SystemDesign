import { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Tag, message, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
    id: number;
    publicId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    jobRole: string;
    position: string;
    assignedGames: { id: number; name: string }[];
}

interface Project {
    id: number;
    name: string;
}

export default function Settings() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const originalValues = useRef<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('http://localhost:5001/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                    const original = {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        phone: data.phone || '',
                    };
                    originalValues.current = original;
                    form.setFieldsValue(original);
                }
            } catch {
                message.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        const fetchProjects = async () => {
            try {
                const res = await fetch('http://localhost:5001/projects', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) setProjects(await res.json());
            } catch {
                console.error('Failed to load projects');
            }
        };

        fetchProfile();
        fetchProjects();
    }, []);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);
            const res = await fetch('http://localhost:5001/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(values),
            });
            if (res.ok) {
                const updated = await res.json();
                setProfile(updated);
                originalValues.current = {
                    firstName: updated.firstName,
                    lastName: updated.lastName,
                    email: updated.email,
                    phone: updated.phone || '',
                };
                setHasChanges(false);
                message.success('Profile updated!');
            } else {
                const data = await res.json();
                message.error(data.message || 'Failed to update');
            }
        } catch {
            message.error('Server error');
        } finally {
            setSaving(false);
        }
    };

    const initials = profile
        ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
        : '??';

    const colors = ['#1677ff', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96', '#13c2c2'];
    const colorIndex = profile
        ? profile.publicId.charCodeAt(0) % colors.length
        : 0;

    if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>

            {/* ── Avatar ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
                <div style={{
                    width: 80, height: 80,
                    borderRadius: '50%',
                    background: colors[colorIndex],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, fontWeight: 700, color: '#fff',
                    flexShrink: 0,
                }}>
                    {initials}
                </div>
                <div>
                    <div style={{ fontSize: 22, fontWeight: 600 }}>
                        {profile?.firstName} {profile?.lastName}
                    </div>
                    <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 2 }}>
                        {profile?.publicId}
                    </div>
                    <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                        <Tag color="blue">{profile?.position}</Tag>
                        <Tag>{profile?.jobRole}</Tag>
                    </div>
                </div>
            </div>

            <Divider />

            {/* ── Edit Form ── */}
            <Form
                form={form}
                layout="vertical"
                onValuesChange={(_, allValues) => {
                    const orig = originalValues.current;
                    if (!orig) return;
                    const changed =
                        allValues.firstName !== orig.firstName ||
                        allValues.lastName !== orig.lastName ||
                        allValues.email !== orig.email ||
                        (allValues.phone || '') !== (orig.phone || '');
                    setHasChanges(changed);
                }}
            >
                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item
                        name="firstName"
                        label="First Name"
                        style={{ flex: 1 }}
                        rules={[{ required: true }]}
                    >
                        <Input size="large" />
                    </Form.Item>
                    <Form.Item
                        name="lastName"
                        label="Last Name"
                        style={{ flex: 1 }}
                        rules={[{ required: true }]}
                    >
                        <Input size="large" />
                    </Form.Item>
                </div>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ required: true }, { type: 'email' }]}
                >
                    <Input size="large" />
                </Form.Item>

                <Form.Item name="phone" label="Phone Number">
                    <Input size="large" placeholder="e.g. +82 10-1234-5678" />
                </Form.Item>

                {hasChanges && (
                    <Button
                        type="primary"
                        size="large"
                        block
                        loading={saving}
                        onClick={handleSave}
                    >
                        Save Changes
                    </Button>
                )}
            </Form>

            <Divider />

            {/* ── Participating Projects ── */}
            <div style={{ marginBottom: 16, fontWeight: 600, fontSize: 15 }}>
                Participating Projects
            </div>
            {projects.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {projects.map(project => (
                        <div
                            key={project.id}
                            onClick={() => navigate('/dashboard')}
                            style={{
                                padding: '12px 16px',
                                background: '#f5f7fa',
                                borderRadius: 8,
                                border: '1px solid #f0f0f0',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#e6f4ff')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#f5f7fa')}
                        >
                            <span style={{ fontWeight: 500 }}>{project.name}</span>
                            <span style={{ fontSize: 12, color: '#1677ff' }}>Go →</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ color: '#8c8c8c', fontSize: 13 }}>
                    No projects assigned yet
                </div>
            )}
        </div>
    );
}