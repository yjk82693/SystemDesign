import { useState, useEffect } from 'react';
import { Button, Input, Avatar, message, Spin } from 'antd';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';

interface Author {
    id: number;
    firstName: string;
    lastName: string;
    publicId: string;
}

interface Reply {
    id: number;
    content: string;
    createdAt: string;
    author: Author;
}

interface Comment {
    id: number;
    content: string;
    createdAt: string;
    author: Author;
    replies: Reply[];
}

interface CommitFull {
    id: number;
    message: string;
    fileType: string;
    fileName: string;
    content: string | null;
    url: string | null;
    createdAt: string;
    author: Author;
    project: { id: number; name: string };
    comments: Comment[];
}

interface Props {
    commit: { id: number; message: string; fileName: string; fileType: string; project: { name: string } };
    onBack: () => void;
    onCommentAdded: () => void;
}

function avatarColor(publicId: string): string {
    const colors = ['#1677ff', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96', '#13c2c2'];
    return colors[publicId.charCodeAt(0) % colors.length];
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function CommitDetail({ commit, onBack, onCommentAdded }: Props) {
    const [fullCommit, setFullCommit] = useState<CommitFull | null>(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchCommit = async () => {
            try {
                const res = await fetch(`http://localhost:5001/commits/${commit.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) setFullCommit(await res.json());
                else message.error('Failed to load commit');
            } catch {
                message.error('Server error');
            } finally {
                setLoading(false);
            }
        };
        fetchCommit();
    }, [commit.id]);

    const handleAddComment = async (parentId?: number) => {
        const content = parentId ? replyText : comment;
        if (!content.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch(`http://localhost:5001/commits/${commit.id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content, parentId }),
            });
            if (res.ok) {
                const newComment = await res.json();
                if (parentId) {
                    setFullCommit(prev => prev ? {
                        ...prev,
                        comments: prev.comments.map(c =>
                            c.id === parentId
                                ? { ...c, replies: [...c.replies, newComment] }
                                : c
                        )
                    } : prev);
                    setReplyTo(null);
                    setReplyText('');
                } else {
                    setFullCommit(prev => prev ? {
                        ...prev,
                        comments: [...prev.comments, { ...newComment, replies: [] }]
                    } : prev);
                    setComment('');
                }
                onCommentAdded();
            } else {
                message.error('Failed to add comment');
            }
        } catch {
            message.error('Server error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <Spin />
        </div>
    );

    if (!fullCommit) return null;

    return (
        <div>
            {/* ── Header ── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                marginBottom: 20, padding: '16px 20px',
                background: '#fff', borderRadius: 10,
                border: '1px solid #f0f0f0',
            }}>
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={onBack}
                >
                    Back
                </Button>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{fullCommit.message}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                        {fullCommit.fileName} · {fullCommit.project.name} · {timeAgo(fullCommit.createdAt)}
                        · by {fullCommit.author.firstName} {fullCommit.author.lastName}
                    </div>
                </div>
            </div>

            {/* ── File preview ── */}
            <div style={{
                marginBottom: 20, padding: 20,
                background: '#fff', borderRadius: 10,
                border: '1px solid #f0f0f0',
            }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: '#595959' }}>
                    Changes in {fullCommit.fileName}
                </div>

                {fullCommit.fileType === 'CODE' && fullCommit.content ? (
                    <pre style={{
                        background: '#1e1e1e', color: '#d4d4d4',
                        padding: 16, borderRadius: 8,
                        fontSize: 12, overflowX: 'auto',
                        maxHeight: 400, overflowY: 'auto',
                        margin: 0,
                    }}>
                        {fullCommit.content}
                    </pre>
                ) : fullCommit.fileType === 'IMAGE' && fullCommit.url ? (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <img
                            src={fullCommit.url}
                            alt={fullCommit.fileName}
                            style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 8 }}
                        />
                    </div>
                ) : fullCommit.fileType === 'PDF' && fullCommit.url ? (
                    <iframe
                        src={fullCommit.url}
                        style={{ width: '100%', height: 400, border: 'none', borderRadius: 8 }}
                        title={fullCommit.fileName}
                    />
                ) : (
                    <div style={{ color: '#8c8c8c', fontSize: 13 }}>
                        Preview not available.{' '}
                        {fullCommit.url && (
                            <a href={fullCommit.url} target="_blank" rel="noreferrer">Open file</a>
                        )}
                    </div>
                )}
            </div>

            {/* ── Comments ── */}
            <div style={{
                padding: 20, background: '#fff',
                borderRadius: 10, border: '1px solid #f0f0f0',
            }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
                    Comments ({fullCommit.comments.length})
                </div>

                {/* Comment list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                    {fullCommit.comments.map(c => (
                        <div key={c.id}>
                            {/* Comment */}
                            <div style={{ display: 'flex', gap: 10 }}>
                                <Avatar
                                    size={32}
                                    style={{ background: avatarColor(c.author.publicId), fontSize: 11, fontWeight: 700, flexShrink: 0 }}
                                >
                                    {c.author.firstName[0]}{c.author.lastName[0]}
                                </Avatar>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        background: '#f5f7fa', borderRadius: 8,
                                        padding: '10px 14px',
                                    }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                                            {c.author.firstName} {c.author.lastName}
                                            <span style={{ fontWeight: 400, color: '#8c8c8c', marginLeft: 8 }}>
                                                {timeAgo(c.createdAt)}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 13 }}>{c.content}</div>
                                    </div>
                                    <button
                                        style={{ background: 'none', border: 'none', fontSize: 11, color: '#8c8c8c', cursor: 'pointer', marginTop: 4, padding: '0 4px' }}
                                        onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                                    >
                                        Reply
                                    </button>

                                    {/* Replies */}
                                    {c.replies.map(r => (
                                        <div key={r.id} style={{ display: 'flex', gap: 10, marginTop: 10, marginLeft: 16 }}>
                                            <Avatar
                                                size={26}
                                                style={{ background: avatarColor(r.author.publicId), fontSize: 10, fontWeight: 700, flexShrink: 0 }}
                                            >
                                                {r.author.firstName[0]}{r.author.lastName[0]}
                                            </Avatar>
                                            <div style={{
                                                flex: 1, background: '#f5f7fa',
                                                borderRadius: 8, padding: '8px 12px',
                                            }}>
                                                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 2 }}>
                                                    {r.author.firstName} {r.author.lastName}
                                                    <span style={{ fontWeight: 400, color: '#8c8c8c', marginLeft: 8 }}>
                                                        {timeAgo(r.createdAt)}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: 12 }}>{r.content}</div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Reply input */}
                                    {replyTo === c.id && (
                                        <div style={{ display: 'flex', gap: 8, marginTop: 8, marginLeft: 16 }}>
                                            <Input
                                                size="small"
                                                placeholder="Write a reply..."
                                                value={replyText}
                                                onChange={e => setReplyText(e.target.value)}
                                                onPressEnter={() => handleAddComment(c.id)}
                                                autoFocus
                                            />
                                            <Button
                                                size="small"
                                                type="primary"
                                                icon={<SendOutlined />}
                                                loading={submitting}
                                                onClick={() => handleAddComment(c.id)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {fullCommit.comments.length === 0 && (
                        <div style={{ color: '#8c8c8c', fontSize: 13, textAlign: 'center', padding: 16 }}>
                            No comments yet — be the first to give feedback!
                        </div>
                    )}
                </div>

                {/* New comment input */}
                <div style={{ display: 'flex', gap: 10 }}>
                    <Input.TextArea
                        rows={2}
                        placeholder="Leave a comment..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                    />
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        loading={submitting}
                        onClick={() => handleAddComment()}
                        disabled={!comment.trim()}
                        style={{ alignSelf: 'flex-end' }}
                    >
                        Send
                    </Button>
                </div>
            </div>
        </div>
    );
}