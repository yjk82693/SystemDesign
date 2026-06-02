import React, { useState, useEffect, useRef } from 'react';
import { Spin, Button, Tooltip, message } from 'antd';
import { FileOutlined, LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import type { FileWithContent } from './workspaceTypes';
import { getLanguage } from './workspaceUtils';

interface Props {
    selectedFile: FileWithContent | null;
    onFileSaved: () => void;
}

const FileEditor: React.FC<Props> = ({ selectedFile, onFileSaved }) => {
    const [editorContent, setEditorContent] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fileData, setFileData] = useState<FileWithContent | null>(null);
    const originalContentRef = useRef<string>('');
    const token = localStorage.getItem('token');

    // Load file content when selectedFile changes
    useEffect(() => {
        if (!selectedFile) {
            setFileData(null);
            setEditorContent('');
            setHasChanges(false);
            return;
        }

        if (selectedFile.type !== 'CODE') {
            setFileData(selectedFile);
            setHasChanges(false);
            return;
        }

        const loadContent = async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:5001/files/${selectedFile.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setFileData(data);
                    setEditorContent(data.content || '');
                    originalContentRef.current = data.content || '';
                    setHasChanges(false);
                } else {
                    message.error('Failed to load file');
                }
            } catch {
                message.error('Server error');
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, [selectedFile?.id]);

    const handleEditorChange = (val: string | undefined) => {
        const newVal = val || '';
        setEditorContent(newVal);
        setHasChanges(newVal !== originalContentRef.current);
    };

    const handleSave = async () => {
        if (!fileData || fileData.type !== 'CODE') return;
        setSaving(true);
        try {
            const res = await fetch(`http://localhost:5001/files/${fileData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: editorContent }),
            });
            if (res.ok) {
                message.success('File saved');
                originalContentRef.current = editorContent;
                setHasChanges(false);
                onFileSaved();
            } else {
                message.error('Failed to save');
            }
        } catch {
            message.error('Server error');
        } finally {
            setSaving(false);
        }
    };

    // Cmd+S / Ctrl+S
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                if (hasChanges) handleSave();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hasChanges, editorContent, fileData]);

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Tab bar */}
            {fileData && (
                <div style={{
                    height: 40, borderBottom: '1px solid #f0f0f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 16px', background: '#fff', flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileOutlined style={{ fontSize: 13, color: '#8c8c8c' }} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>
                            {fileData.name}
                            {hasChanges && <span style={{ color: '#fa8c16', marginLeft: 4 }}>●</span>}
                        </span>
                        {fileData.folder !== '/' && (
                            <span style={{ fontSize: 11, color: '#8c8c8c' }}>{fileData.folder}</span>
                        )}
                    </div>
                    {fileData.type === 'CODE' && hasChanges && (
                        <Tooltip title="Save (⌘S)">
                            <Button
                                type="primary" size="small"
                                icon={<SaveOutlined />}
                                loading={saving}
                                onClick={handleSave}
                            >
                                Save
                            </Button>
                        </Tooltip>
                    )}
                </div>
            )}

            {/* Content area */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} />} />
                    </div>
                ) : !fileData ? (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        height: '100%', color: '#8c8c8c', fontSize: 13,
                        flexDirection: 'column', gap: 8,
                    }}>
                        <FileOutlined style={{ fontSize: 32, color: '#d9d9d9' }} />
                        <span>Select a file to view or edit</span>
                        <span style={{ fontSize: 11, color: '#d9d9d9' }}>
                            or create a new file using the + button
                        </span>
                    </div>
                ) : fileData.type === 'CODE' ? (
                    <Editor
                        height="100%"
                        language={getLanguage(fileData.name)}
                        value={editorContent}
                        onChange={handleEditorChange}
                        theme="vs-dark"
                        options={{
                            fontSize: 13,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            wordWrap: 'on',
                            tabSize: 2,
                        }}
                    />
                ) : fileData.type === 'IMAGE' && fileData.url ? (
                    <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
                        <img
                            src={fileData.url} alt={fileData.name}
                            style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 200px)', objectFit: 'contain', borderRadius: 8 }}
                        />
                    </div>
                ) : fileData.type === 'PDF' && fileData.url ? (
                    <iframe
                        src={fileData.url}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        title={fileData.name}
                    />
                ) : (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        height: '100%', color: '#8c8c8c', fontSize: 13,
                        flexDirection: 'column', gap: 8,
                    }}>
                        <FileOutlined style={{ fontSize: 32, color: '#d9d9d9' }} />
                        <span>Preview not available</span>
                        {fileData.url && (
                            <a href={fileData.url} target="_blank" rel="noreferrer"
                                style={{ color: '#1677ff', fontSize: 12 }}>
                                Open file
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileEditor;