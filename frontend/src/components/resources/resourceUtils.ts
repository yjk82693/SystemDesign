export function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export function categoryColor(name: string): string {
    const colors = ['#1677ff', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96', '#13c2c2', '#f5222d'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
}