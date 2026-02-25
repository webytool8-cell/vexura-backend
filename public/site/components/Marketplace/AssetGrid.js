function AssetGrid() {
    const [filter, setFilter] = React.useState('all');
    const [search, setSearch] = React.useState('');
    const [dbAssets, setDbAssets] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const categories = ['all', 'icons', 'gradients', 'shapes', 'patterns', 'illustrations'];

    const normalizeCategory = (category) => {
        const c = (category || 'icons').toLowerCase();
        if (c.endsWith('s')) return c;
        if (c === 'icon') return 'icons';
        if (c === 'illustration') return 'illustrations';
        if (c === 'gradient') return 'gradients';
        if (c === 'shape') return 'shapes';
        if (c === 'pattern') return 'patterns';
        return c;
    };

    const escapeAttr = (value) => String(value).replace(/"/g, '&quot;');

    const vectorToSvg = (vector) => {
        if (!vector || !Array.isArray(vector.elements) || vector.elements.length === 0) {
            return '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="none" stroke="currentColor" stroke-width="8"/><path d="M90 310 L170 210 L230 260 L310 120" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        }

        const width = vector.width || 400;
        const height = vector.height || 400;
        const elements = vector.elements.map((el) => {
            const attrs = Object.entries(el)
                .filter(([k, v]) => k !== 'type' && v !== undefined && v !== null)
                .map(([k, v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}="${escapeAttr(v)}"`)
                .join(' ');
            return `<${el.type} ${attrs}></${el.type}>`;
        }).join('');

        return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${elements}</svg>`;
    };

    const mapDbAsset = (item) => {
        const price = item?.marketplace?.price || 0;
        const category = normalizeCategory(item?.marketplace?.category);
        const title = item?.seo?.title?.replace(/\s*-\s*Premium Vector Icon\s*\|\s*VEXURA/i, '') || item?.vector?.name || item?.slug || 'Untitled Asset';

        return {
            id: item.id || item.slug,
            title,
            slug: item.slug,
            category,
            type: 'single',
            isPremium: price > 0,
            price,
            tags: item?.marketplace?.tags || [],
            description: item?.seo?.description || item?.prompt || 'Marketplace vector asset',
            svg: vectorToSvg(item.vector)
        };
    };

    React.useEffect(() => {
        let isMounted = true;

        const load = async () => {
            try {
                const res = await fetch('/api/marketplace/list?limit=200&offset=0');
                if (!res.ok) throw new Error('Failed to load marketplace items');
                const data = await res.json();
                const mapped = (data.items || []).map(mapDbAsset);
                if (isMounted) setDbAssets(mapped);
            } catch (e) {
                console.warn('Falling back to static marketplace data:', e);
                if (isMounted && window.MarketplaceData) setDbAssets(window.MarketplaceData);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        load();
        return () => { isMounted = false; };
    }, []);

    const assets = React.useMemo(() => {
        let data = filter === 'all' ? dbAssets : dbAssets.filter(a => normalizeCategory(a.category) === filter);
        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter(a =>
                a.title.toLowerCase().includes(lowerSearch) ||
                (a.tags || []).some(t => t.toLowerCase().includes(lowerSearch))
            );
        }
        return data;
    }, [dbAssets, filter, search]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">

                {/* Filters */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-[2px] border transition-all ${
                                filter === cat
                                ? 'bg-[var(--accent)] border-[var(--accent)] text-black'
                                : 'bg-[var(--bg-surface)] border-[var(--border-dim)] text-[var(--text-dim)] hover:border-[var(--text-muted)]'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <div className="absolute left-3 top-2.5 text-[var(--text-dim)]">
                        <div className="icon-search w-4 h-4"></div>
                    </div>
                    <input
                        type="text"
                        placeholder="SEARCH ASSETS..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-dim)] text-sm pl-10 pr-4 py-2 rounded-[2px] font-mono text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                    />
                </div>
            </div>

            {loading && (
                <div className="text-center py-8 text-[var(--text-dim)] font-mono text-xs">LOADING MARKETPLACE ASSETS...</div>
            )}

            {/* Grid */}
            {assets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {assets.map(asset => (
                        <AssetCard key={asset.id} asset={asset} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 border border-dashed border-[var(--border-dim)] rounded-[2px]">
                    <div className="icon-search-x w-8 h-8 mx-auto text-[var(--text-dim)] mb-4"></div>
                    <p className="text-[var(--text-muted)] font-mono text-sm">NO ASSETS FOUND</p>
                </div>
            )}
        </div>
    );
}
