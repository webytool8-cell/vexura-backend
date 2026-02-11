function AssetGrid() {
    const [filter, setFilter] = React.useState('all');
    const [search, setSearch] = React.useState('');
    
    const categories = ['all', 'icons', 'gradients', 'shapes', 'patterns', 'illustrations'];

    const assets = React.useMemo(() => {
        let data = window.getAssetsByCategory(filter);
        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter(a => 
                a.title.toLowerCase().includes(lowerSearch) || 
                a.tags.some(t => t.includes(lowerSearch))
            );
        }
        return data;
    }, [filter, search]);

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