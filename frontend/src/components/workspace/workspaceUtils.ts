import type { ProjectFile } from './workspaceTypes';

export function getLanguage(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
        ts: 'typescript', tsx: 'typescript',
        js: 'javascript', jsx: 'javascript',
        py: 'python', rs: 'rust',
        css: 'css', scss: 'scss',
        html: 'html', json: 'json',
        md: 'markdown', sql: 'sql',
        sh: 'shell', yaml: 'yaml', yml: 'yaml',
    };
    return map[ext || ''] || 'plaintext';
}

export function groupByFolder(files: ProjectFile[]): Record<string, ProjectFile[]> {
    const groups: Record<string, ProjectFile[]> = {};
    for (const file of files) {
        const folder = file.folder || '/';
        if (!groups[folder]) groups[folder] = [];
        // Add all files including .keep so folders appear
        // but we'll filter .keep from display in FileTree
        groups[folder].push(file);
    }
    return groups;
}

export function getFileType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
    if (imageExts.includes(ext)) return 'IMAGE';
    if (ext === 'pdf') return 'PDF';
    if (['doc', 'docx'].includes(ext)) return 'DOC';
    return 'CODE';
}