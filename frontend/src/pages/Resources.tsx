import { useState, useEffect } from 'react';
import { Spin, message, Button } from 'antd';
import type { Category, Resource, ViewMode } from '../components/resources/resourceTypes';
import ResourceTopBar from '../components/resources/ResourceTopBar';
import ResourceBreadcrumb from '../components/resources/ResourceBreadCrumb';
import CategoryGrid from '../components/resources/CategoryGrid';
import FolderGrid from '../components/resources/FolderGrid';
import ResourceGrid from '../components/resources/ResourceGrid';

const PAGE_SIZE = 30;

export default function Resources() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [page, setPage] = useState(1);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) fetchResources(selectedCategory.id);
        setSelectedFolder(null);
        setPage(1);
    }, [selectedCategory]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5001/resources/categories', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setCategories(await res.json());
            else message.error('Failed to load categories');
        } catch {
            message.error('Server error');
        } finally {
            setLoading(false);
        }
    };

    const fetchResources = async (categoryId: number, searchVal?: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ categoryId: String(categoryId) });
            const s = searchVal !== undefined ? searchVal : search;
            if (s) params.append('search', s);

            const res = await fetch(`http://localhost:5001/resources?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setResources(await res.json());
            else message.error('Failed to load resources');
        } catch {
            message.error('Server error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (val: string) => {
        setSearch(val);
        setPage(1);
        if (selectedCategory) {
            fetchResources(selectedCategory.id, val);
        }
    };

    const handleCategorySelect = (cat: Category) => {
        setSelectedCategory(cat);
        setResources([]);
        setSearch('');
    };

    const handleBackToRoot = () => {
        setSelectedCategory(null);
        setSelectedFolder(null);
        setResources([]);
        setSearch('');
        setPage(1);
    };

    const handleBackToCategory = () => {
        setSelectedFolder(null);
        setPage(1);
    };

    // Filter categories at root level
    const displayedCategories = search
        ? categories.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.description?.toLowerCase().includes(search.toLowerCase())
        )
        : categories;

    // Get unique folders in current category
    const folders = selectedCategory
        ? Array.from(new Set(
            resources.filter(r => r.folder).map(r => r.folder as string)
        )).sort()
        : [];

    // Filter resources by folder
    const getDisplayedResources = () => {
        let filtered = resources;
        if (selectedFolder) {
            filtered = filtered.filter(r => r.folder === selectedFolder);
        } else {
            filtered = filtered.filter(r => !r.folder);
        }
        return filtered;
    };

    const displayedResources = getDisplayedResources();
    const totalPages = Math.ceil(displayedResources.length / PAGE_SIZE);
    const pagedResources = displayedResources.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div>
            <ResourceTopBar
                search={search}
                onSearch={handleSearch}
                viewMode={viewMode}
                onViewChange={setViewMode}
            />

            <ResourceBreadcrumb
                selectedCategory={selectedCategory}
                selectedFolder={selectedFolder}
                onRootClick={handleBackToRoot}
                onCategoryClick={handleBackToCategory}
            />

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                    <Spin />
                </div>
            ) : !selectedCategory ? (
                <CategoryGrid
                    categories={displayedCategories}
                    viewMode={viewMode}
                    onSelect={handleCategorySelect}
                />
            ) : (
                <>
                    {!selectedFolder && (
                        <FolderGrid
                            folders={folders}
                            resources={resources}
                            viewMode={viewMode}
                            onSelect={setSelectedFolder}
                        />
                    )}

                    {!selectedFolder && folders.length > 0 && pagedResources.length > 0 && (
                        <div style={{
                            fontSize: 11, color: '#8c8c8c', marginBottom: 8,
                            fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                            Files
                        </div>
                    )}

                    <ResourceGrid resources={pagedResources} viewMode={viewMode} />

                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                            <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
                            <span style={{ alignSelf: 'center', fontSize: 13, color: '#595959' }}>
                                Page {page} of {totalPages}
                            </span>
                            <Button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}