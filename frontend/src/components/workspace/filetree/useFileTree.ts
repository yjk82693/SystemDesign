import { useState } from 'react';
import { Modal, message } from 'antd';
import type { ProjectFile } from '../workspaceTypes';

export function useFileTree(onFilesChanged: () => void) {
    const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());
    const [selectedFolder, setSelectedFolder] = useState<string>('/');
    const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
    const [draggingFile, setDraggingFile] = useState<ProjectFile | null>(null);
    const [hoveredFileId, setHoveredFileId] = useState<number | null>(null);

    const token = localStorage.getItem('token');

    const toggleFolder = (folder: string) => {
        setSelectedFolder(folder);
        setCollapsedFolders(prev => {
            const next = new Set(prev);
            if (next.has(folder)) next.delete(folder);
            else next.add(folder);
            return next;
        });
    };

    const handleDragStart = (e: React.DragEvent, file: ProjectFile) => {
        setDraggingFile(file);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, folder: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverFolder(folder);
    };

    const handleDragLeave = () => setDragOverFolder(null);

    const handleDrop = async (e: React.DragEvent, targetFolder: string) => {
        e.preventDefault();
        setDragOverFolder(null);
        if (!draggingFile || draggingFile.folder === targetFolder) {
            setDraggingFile(null);
            return;
        }
        try {
            const res = await fetch(`http://localhost:5001/files/${draggingFile.id}/move`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ folder: targetFolder }),
            });
            if (res.ok) {
                message.success(`Moved "${draggingFile.name}" to ${targetFolder === '/' ? 'root' : targetFolder}`);
                onFilesChanged();
            } else {
                message.error('Failed to move file');
            }
        } catch {
            message.error('Server error');
        } finally {
            setDraggingFile(null);
        }
    };

    const handleDeleteFile = (file: ProjectFile) => {
        Modal.confirm({
            title: `Delete "${file.name}"?`,
            content: 'This cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    const res = await fetch(`http://localhost:5001/files/${file.id}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                        message.success(`${file.name} deleted`);
                        onFilesChanged();
                    } else {
                        message.error('Failed to delete file');
                    }
                } catch {
                    message.error('Server error');
                }
            }
        });
    };

    const handleDeleteFolder = (folder: string, folderFiles: ProjectFile[]) => {
        const visibleFiles = folderFiles.filter(f => f.name !== '.keep');
        Modal.confirm({
            title: `Delete folder "${folder.replace('/', '')}"?`,
            content: visibleFiles.length > 0
                ? `This will delete ${visibleFiles.length} file(s). Cannot be undone.`
                : 'This will delete the empty folder.',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await Promise.all(folderFiles.map(f =>
                        fetch(`http://localhost:5001/files/${f.id}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` },
                        })
                    ));
                    message.success('Folder deleted');
                    if (selectedFolder === folder) setSelectedFolder('/');
                    onFilesChanged();
                } catch {
                    message.error('Failed to delete folder');
                }
            }
        });
    };

    return {
        collapsedFolders,
        selectedFolder,
        setSelectedFolder,
        dragOverFolder,
        draggingFile,
        hoveredFileId,
        setHoveredFileId,
        toggleFolder,
        handleDragStart,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleDeleteFile,
        handleDeleteFolder,
    };
}
