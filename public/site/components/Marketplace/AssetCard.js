function AssetCard({ asset }) {
    const isFree = !asset.isPremium;
    const isCollection = asset.type === 'collection';
    
    // Use previewSvg for collections, otherwise use the single svg
    const displaySvg = isCollection ? asset.previewSvg : asset.svg;

    return (
        <a href={`/asset?id=${asset.slug}`} className="card group block relative h-full flex flex-col">
            {/* Preview Area */}
            <div className="aspect-square bg-[var(--bg-body)] relative flex items-center justify-center p-8 overflow-hidden">
                {/* SVG Preview */}
                <div 
                    className="w-full h-full text-[var(--text-main)] transition-transform duration-500 group-hover:scale-105"
                    dangerouslySetInnerHTML={{ __html: displaySvg }}
                ></div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <span className="btn btn-primary shadow-lg scale-90 group-hover:scale-100 transition-transform font-bold">
                        {isFree ? 'DOWNLOAD' : 'VIEW DETAILS'}
                    </span>
                </div>

                {/* Collection Badge */}
                {isCollection && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[var(--bg-panel)] border border-[var(--border-dim)] px-2 py-1 rounded-[2px] shadow-sm">
                        <div className="icon-layers w-3 h-3 text-[var(--accent)]"></div>
                        <span className="text-[9px] font-mono font-bold text-[var(--text-main)] uppercase tracking-wide">
                            {asset.items.length} ITEMS
                        </span>
                    </div>
                )}
            </div>

            {/* Info Area */}
            <div className="p-4 border-t border-[var(--border-dim)] bg-[var(--bg-panel)] flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-mono font-bold text-sm text-[var(--text-main)] uppercase truncate flex-1" title={asset.title}>{asset.title}</h3>
                    {asset.isPremium ? (
                        <span className="text-[10px] font-bold bg-[var(--accent)] text-black px-1.5 py-0.5 rounded-[2px] shrink-0">$ {asset.price}</span>
                    ) : (
                        <span className="text-[10px] font-bold border border-[var(--border-dim)] text-[var(--text-dim)] px-1.5 py-0.5 rounded-[2px] shrink-0">FREE</span>
                    )}
                </div>
                <div className="mt-auto flex items-center gap-2 text-[10px] text-[var(--text-dim)] font-mono uppercase">
                    <span>{asset.category}</span>
                    <span className="w-1 h-1 bg-[var(--border-dim)] rounded-full"></span>
                    <span>{isCollection ? 'COLLECTION' : 'SINGLE SVG'}</span>
                </div>
            </div>
        </a>
    );
}