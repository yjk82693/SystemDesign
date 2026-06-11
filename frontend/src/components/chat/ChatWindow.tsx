import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Avatar, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import type { Message, ChatRoom, ChatMember } from './chatTypes';
import { avatarColor, formatTime } from './chatUtils';

interface Props {
    room: ChatRoom;
    currentUser: ChatMember;
}

const ChatWindow: React.FC<Props> = ({ room, currentUser }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const token = localStorage.getItem('token');
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        fetchMessages();
        // Poll every 3 seconds
        pollRef.current = setInterval(fetchMessages, 3000);
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [room.id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`http://localhost:5001/chat/rooms/${room.id}/messages`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setMessages(await res.json());
        } catch {
            console.error('Failed to fetch messages');
        }
    };

    const handleSend = async () => {
        if (!input.trim() || input.length > 300) return;
        setSending(true);
        try {
            const res = await fetch(`http://localhost:5001/chat/rooms/${room.id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: input.trim() }),
            });
            if (res.ok) {
                const newMsg = await res.json();
                setMessages(prev => [...prev, newMsg]);
                setInput('');
            } else {
                message.error('Failed to send message');
            }
        } catch {
            message.error('Server error');
        } finally {
            setSending(false);
        }
    };

    // Group messages by author for consecutive messages
    const isConsecutive = (msg: Message, prev: Message | null): boolean => {
        if (!prev) return false;
        if (msg.author.id !== prev.author.id) return false;
        const diff = new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime();
        return diff < 5 * 60 * 1000; // 5 minutes
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {/* Messages area */}
            <div style={{
                flex: 1, overflowY: 'auto',
                padding: '16px 20px',
                display: 'flex', flexDirection: 'column', gap: 2,
            }}>
                {messages.length === 0 ? (
                    <div style={{
                        flex: 1, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#8c8c8c', fontSize: 13,
                    }}>
                        No messages yet — say hello! 👋
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const prev = i > 0 ? messages[i - 1] : null;
                        const consecutive = isConsecutive(msg, prev);
                        const isOwn = msg.author.id === currentUser.id;

                        return (
                            <div
                                key={msg.id}
                                style={{
                                    display: 'flex',
                                    flexDirection: isOwn ? 'row-reverse' : 'row',
                                    alignItems: 'flex-end',
                                    gap: 8,
                                    marginTop: consecutive ? 2 : 12,
                                }}
                            >
                                {/* Avatar — only show for first in group */}
                                {!isOwn && (
                                    <div style={{ width: 32, flexShrink: 0 }}>
                                        {!consecutive && (
                                            <Avatar
                                                size={32}
                                                style={{
                                                    background: avatarColor(msg.author.publicId),
                                                    fontSize: 11, fontWeight: 700,
                                                }}
                                            >
                                                {msg.author.firstName[0]}{msg.author.lastName[0]}
                                            </Avatar>
                                        )}
                                    </div>
                                )}

                                <div style={{
                                    maxWidth: '65%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isOwn ? 'flex-end' : 'flex-start',
                                }}>
                                    {/* Name + time — only for first in group */}
                                    {!consecutive && (
                                        <div style={{
                                            fontSize: 11, color: '#8c8c8c',
                                            marginBottom: 3,
                                            display: 'flex', gap: 6,
                                            flexDirection: isOwn ? 'row-reverse' : 'row',
                                        }}>
                                            <span style={{ fontWeight: 600 }}>
                                                {isOwn ? 'You' : `${msg.author.firstName} ${msg.author.lastName}`}
                                            </span>
                                            <span>{formatTime(msg.createdAt)}</span>
                                        </div>
                                    )}

                                    {/* Bubble */}
                                    <div style={{
                                        padding: '8px 12px',
                                        borderRadius: consecutive
                                            ? (isOwn ? '12px 4px 4px 12px' : '4px 12px 12px 4px')
                                            : (isOwn ? '12px 4px 12px 12px' : '4px 12px 12px 12px'),
                                        background: isOwn ? '#1677ff' : '#f0f0f0',
                                        color: isOwn ? '#fff' : '#1a1a1a',
                                        fontSize: 13,
                                        lineHeight: 1.5,
                                        wordBreak: 'break-word',
                                    }}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div style={{
                padding: '12px 16px',
                borderTop: '1px solid #f0f0f0',
                background: '#fff',
                display: 'flex', gap: 8, alignItems: 'flex-end',
            }}>
                <div style={{ flex: 1 }}>
                    <Input.TextArea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
                        autoSize={{ minRows: 1, maxRows: 4 }}
                        maxLength={300}
                        showCount
                        style={{ borderRadius: 8 }}
                    />
                </div>
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSend}
                    loading={sending}
                    disabled={!input.trim()}
                    style={{ marginBottom: 22 }}
                />
            </div>
        </div>
    );
};

export default ChatWindow;