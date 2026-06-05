import { useState, useEffect } from 'react';
import { message, Select, Tag, Avatar, Spin } from 'antd';
import {
    FileOutlined, MessageOutlined, CodeOutlined,
    FileImageOutlined, FilePdfOutlined, FileTextOutlined,
} from '@ant-design/icons';
import CommitDetail from '../components/feedback/CommitDetail.tsx';

interface Author {
    id: number;
    firstName: string;
    lastName: string;
    publicId: string;
}

interface Commit {
    id: number;
    message: string;
    fileType: string;
    fileName: string;
    content: string | null;
    url: string | null;
    createdAt: string;
    author: Author;
    project: { id: number; name: string };
    _count: { comments: number };
}

function fileIcon(type: string) {
    if (type === 'CODE') return <CodeOutlined style={{ color: '#1677ff' }} />;
    if (type === 'IMAGE') return <FileImageOutlined style={{ color: '#52c41a' }} />;
    if (type === 'PDF') return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
    if (type === 'DOC') return <FileTextOutlined style={{ color: '#fa8c16' }} />;
    return <FileOutlined />;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

function avatarColor(publicId: string): string {
    const colors = ['#1677ff', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96', '#13c2c2'];
    return colors[publicId.charCodeAt(0) % colors.length];
}

export default function Feedback() {
    const [commits, setCommits] = useState<Commit[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
    const [filterProject, setFilterProject] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchCommits = async () => {
            try {
                const res = await fetch('http://localhost:5001/commits', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) setCommits(await res.json());
                else message.error('Failed to load commits');
            } catch {
                message.error('Server error');
            } finally {
                setLoading(false);
            }
        };
        fetchCommits();
    }, []);

    // Unique projects for filter
    const projectOptions = [
        { value: 'all', label: 'All Projects' },
        ...Array.from(new Map(commits.map(c => [c.project.id, c.project])).values())
            .map(p => ({ value: String(p.id), label: p.name }))
    ];

    const filteredCommits = commits.filter(c => {
        const matchProject = filterProject === 'all' || String(c.project.id) === filterProject;
        const matchType = filterType === 'all' || c.fileType === filterType;
        return matchProject && matchType;
    });

    if (selectedCommit) {
        return (
            <CommitDetail
                commit={selectedCommit}
                onBack={() => setSelectedCommit(null)}
                onCommentAdded={() => {
                    // Refresh commit count
                    setCommits(prev => prev.map(c =>
                        c.id === selectedCommit.id
                            ? { ...c, _count: { comments: c._count.comments + 1 } }
                            : c
                    ));
                }}
            />
        );
    }

    return (
        <div>
            {/* ── Filters ── */}
            <div style={{
                display: 'flex', gap: 12, marginBottom: 20,
                padding: '16px 20px',
                background: '#fff', borderRadius: 10,
                border: '1px solid #f0f0f0',
            }}>
                <Select
                    value={filterProject}
                    onChange={setFilterProject}
                    options={projectOptions}
                    style={{ width: 180 }}
                />
                <Select
                    value={filterType}
                    onChange={setFilterType}
                    style={{ width: 150 }}
                    options={[
                        { value: 'all', label: 'All Types' },
                        { value: 'CODE', label: 'Code' },
                        { value: 'IMAGE', label: 'Images' },
                        { value: 'PDF', label: 'PDFs' },
                        { value: 'DOC', label: 'Documents' },
                    ]}
                />
                <span style={{ marginLeft: 'auto', fontSize: 13, color: '#8c8c8c', alignSelf: 'center' }}>
                    {filteredCommits.length} commit{filteredCommits.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* ── Commit list ── */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                    <Spin />
                </div>
            ) : filteredCommits.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: 48,
                    color: '#8c8c8c', fontSize: 13,
                    background: '#fff', borderRadius: 10,
                    border: '1px solid #f0f0f0',
                }}>
                    No commits yet — save a file to create your first commit!
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {filteredCommits.map(commit => (
                        <div
                            key={commit.id}
                            onClick={() => setSelectedCommit(commit)}
                            style={{
                                padding: '14px 20px',
                                background: '#fff',
                                borderRadius: 10,
                                border: '1px solid #f0f0f0',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 14,
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = '#1677ff')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = '#f0f0f0')}
                        >
                            {/* File type icon */}
                            <div style={{ fontSize: 20, flexShrink: 0 }}>
                                {fileIcon(commit.fileType)}
                            </div>

                            {/* Main content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                                    {commit.message}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                                        {commit.fileName}
                                    </span>
                                    <span style={{ color: '#d9d9d9' }}>·</span>
                                    <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>
                                        {commit.project.name}
                                    </Tag>
                                    <span style={{ color: '#d9d9d9' }}>·</span>
                                    <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                                        {timeAgo(commit.createdAt)}
                                    </span>
                                </div>
                            </div>

                            {/* Author */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                <Avatar
                                    size={28}
                                    style={{ background: avatarColor(commit.author.publicId), fontSize: 11, fontWeight: 700 }}
                                >
                                    {commit.author.firstName[0]}{commit.author.lastName[0]}
                                </Avatar>
                                <span style={{ fontSize: 12, color: '#595959' }}>
                                    {commit.author.firstName}
                                </span>
                            </div>

                            {/* Comment count */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                fontSize: 12, color: '#8c8c8c', flexShrink: 0,
                            }}>
                                <MessageOutlined />
                                {commit._count.comments}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}