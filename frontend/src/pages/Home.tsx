import { useState, useEffect } from 'react';
import { message } from 'antd';
import ProjectList from '../components/workspace/ProjectList';
import FileTree from '../components/workspace/FileTree';
import FileEditor from '../components/workspace/FileEditor';
import type { Project, ProjectFile, FileWithContent } from '../components/workspace/workspaceTypes';

export default function Home() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<FileWithContent | null>(null);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingFiles, setLoadingFiles] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch('http://localhost:5001/projects', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setProjects(data);
                    if (data.length > 0) setSelectedProject(data[0]);
                } else {
                    message.error('Failed to load projects');
                }
            } catch {
                message.error('Server error loading projects');
            } finally {
                setLoadingProjects(false);
            }
        };
        fetchProjects();
    }, []);

    const refreshFiles = async (projectId: number) => {
        setLoadingFiles(true);
        try {
            const res = await fetch(`http://localhost:5001/files/project/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setFiles(await res.json());
            else message.error('Failed to load files');
        } catch {
            message.error('Server error');
        } finally {
            setLoadingFiles(false);
        }
    };

    useEffect(() => {
        if (!selectedProject) return;
        setSelectedFile(null);
        setFiles([]);
        refreshFiles(selectedProject.id);
    }, [selectedProject]);

    return (
        <div style={{
            display: 'flex',
            height: 'calc(100vh - 120px)',
            background: '#fff',
            borderRadius: 10,
            border: '1px solid #f0f0f0',
            overflow: 'hidden',
        }}>
            <ProjectList
                projects={projects}
                selectedProject={selectedProject}
                loading={loadingProjects}
                onSelect={setSelectedProject}
            />
            <FileTree
                files={files}
                selectedProject={selectedProject}
                selectedFile={selectedFile}
                loading={loadingFiles}
                onFileClick={(file) => setSelectedFile(file as FileWithContent)}
                onFilesChanged={() => selectedProject && refreshFiles(selectedProject.id)}
            />
            <FileEditor
                selectedFile={selectedFile}
                projectId={selectedProject?.id ?? null}
                onFileSaved={() => selectedProject && refreshFiles(selectedProject.id)}
            />
        </div>
    );
}