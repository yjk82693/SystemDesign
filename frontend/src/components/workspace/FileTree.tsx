import React, { useState } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import type { Project, ProjectFile, FileWithContent } from './workspaceTypes';
import { groupByFolder } from './workspaceUtils';
import { useFileTree } from './filetree/useFileTree';
import FileTreeToolbar from './filetree/FileTreeToolbar';
import FileItem from './filetree/FileItem';
import FolderItem from './filetree/FolderItem';
import NewFileModal from './NewFileModal';
import NewFolderModal from './NewFolderModal';
import UploadModal from './UploadModal';

interface Props {
    files: ProjectFile[];
    selectedProject: Project | null;
    selectedFile: FileWithContent | null;
    loading: boolean;
    onFileClick: (file: ProjectFile) => void;
    onFilesChanged: () => void;
}

const FileTree: React.FC<Props> = ({
    files, selectedProject, selectedFile, loading, onFileClick, onFilesChanged
}) => {
    const [newFileModal, setNewFileModal] = useState(false);
    const [newFolderModal, setNewFolderModal] = useState(false);
    const [uploadModal, setUploadModal] = useState(false);

    const {
        collapsedFolders, selectedFolder, setSelectedFolder,
        dragOverFolder, draggingFile, hoveredFileId, setHoveredFileId,
        toggleFolder, handleDragStart, handleDragOver, handleDragLeave,
        handleDrop, handleDeleteFile, handleDeleteFolder,
    } = useFileTree(onFilesChanged);

    const groupedFiles = groupByFolder(files);
    const existingFolders = Object.keys(groupedFiles);
    const rootFiles = (groupedFiles['/'] || []).filter(f => f.name !== '.keep');

    return (
        <div style={{
            width: 220,
            borderRight: '1px solid #f0f0f0',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            background: '#fafafa',
        }}>
            <FileTreeToolbar
                projectName={selectedProject?.name ?? 'Files'}
                selectedFolder={selectedFolder}
                onNewFile={() => setNewFileModal(true)}
                onNewFolder={() => setNewFolderModal(true)}
                onUpload={() => setUploadModal(true)}
                onClearFolder={() => setSelectedFolder('/')}
            />

            {!selectedProject ? (
                <div style={{ padding: 16, fontSize: 12, color: '#8c8c8c' }}>
                    Select a project
                </div>
            ) : loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                    <Spin indicator={<LoadingOutlined />} />
                </div>
            ) : files.length === 0 ? (
                <div style={{ padding: 16, fontSize: 12, color: '#8c8c8c' }}>
                    No files yet — use the buttons above
                </div>
            ) : (
                <div style={{ overflow: 'auto', flex: 1 }}>
                    {/* Root files drop zone */}
                    <div
                        onDragOver={e => handleDragOver(e, '/')}
                        onDragLeave={handleDragLeave}
                        onDrop={e => handleDrop(e, '/')}
                        style={{
                            background: dragOverFolder === '/' ? '#e6f4ff' : 'transparent',
                            transition: 'background 0.15s',
                        }}
                    >
                        {rootFiles.map(file => (
                            <FileItem
                                key={file.id}
                                file={file}
                                isActive={selectedFile?.id === file.id}
                                isHovered={hoveredFileId === file.id}
                                isDragging={draggingFile?.id === file.id}
                                indented={false}
                                onFileClick={onFileClick}
                                onHoverEnter={id => setHoveredFileId(id)}
                                onHoverLeave={() => setHoveredFileId(null)}
                                onDragStart={handleDragStart}
                                onDelete={handleDeleteFile}
                            />
                        ))}
                    </div>

                    {/* Folders */}
                    {Object.entries(groupedFiles)
                        .filter(([folder]) => folder !== '/')
                        .map(([folder, folderFiles]) => (
                            <FolderItem
                                key={folder}
                                folder={folder}
                                folderFiles={folderFiles}
                                isCollapsed={collapsedFolders.has(folder)}
                                isSelected={selectedFolder === folder}
                                isDragTarget={dragOverFolder === folder}
                                selectedFile={selectedFile}
                                draggingFileId={draggingFile?.id ?? null}
                                hoveredFileId={hoveredFileId}
                                onToggle={toggleFolder}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onFileClick={onFileClick}
                                onHoverEnter={id => setHoveredFileId(id)}
                                onHoverLeave={() => setHoveredFileId(null)}
                                onDragStart={handleDragStart}
                                onDeleteFile={handleDeleteFile}
                                onDeleteFolder={handleDeleteFolder}
                            />
                        ))}
                </div>
            )}

            {selectedProject && (
                <>
                    <NewFileModal
                        open={newFileModal}
                        projectId={selectedProject.id}
                        existingFolders={existingFolders}
                        defaultFolder={selectedFolder}
                        onClose={() => setNewFileModal(false)}
                        onCreated={onFilesChanged}
                    />
                    <NewFolderModal
                        open={newFolderModal}
                        projectId={selectedProject.id}
                        onClose={() => setNewFolderModal(false)}
                        onCreated={onFilesChanged}
                    />
                    <UploadModal
                        open={uploadModal}
                        projectId={selectedProject.id}
                        onClose={() => setUploadModal(false)}
                        onUploaded={onFilesChanged}
                    />
                </>
            )}
        </div>
    );
};

export default FileTree;