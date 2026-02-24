function AssetDetailView({ user, onOpenAuth }) {
    const [asset, setAsset] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [downloading, setDownloading] = React.useState(false);

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const slug = params.get('id');
        if (slug) {
            const found = window.getAssetBySlug(slug);
            setAsset(found);
        }
        setLoading(false);
    }, []);

    const handleDownload = async () => {
        if (!asset) return;
        
        if (asset.type === 'collection') {
            await downloadCollection();
        } else {
            downloadSingle();
        }
    };

    const downloadSingle = () => {
        const blob = new Blob([asset.svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${asset.slug}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadCollection = async () => {
        if (!window.JSZip) {
            alert("Compression library not loaded. Please refresh.");
            return;
        }

        setDownloading(true);
        try {
            const zip = new JSZip();
            const folder = zip.folder(asset.slug);

            // Add each SVG to the zip
            asset.items.forEach((item, index) => {
                const filename = `${item.name || `item-${index}`}.svg`;
                folder.file(filename, item.svg);
            });

            // Generate ZIP
            const content = await zip.generateAsync({ type: "blob" });
            
            // Trigger download
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${asset.slug}-collection.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => URL.revokeObjectURL(url), 100);

        } catch (e) {
            console.error("Zip Error:", e);
            alert("Failed to create ZIP file.");
        } finally {
            setDownloading(false);
        }
    };

    const handlePurchase = () => {
        if (!user) {
            onOpenAuth();
            return;
        }
        // Mock Stripe Redirect
        const btn = document.getElementById('purchase-btn');
        if(btn) {
            btn.innerHTML = "REDIRECTING TO STRIPE...";
            btn.disabled = true;
        }
        setTimeout(() => {
            window.location.href = '/success';
        }, 1500);
    };

    if (loading) return <div className="min-h-[50vh] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div></div>;

    if (!asset) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
                <div className="icon-file-x w-12 h-12 text-[var(--text-dim)] mb-4"></div>
                <h1 className="text-xl font-mono font-bold mb-2">Asset Not Found</h1>
                <a href="/marketplace" className="btn btn-secondary">BACK TO MARKETPLACE</a>
            </div>
        );
    }

    const isCollection = asset.type === 'collection';
    const displaySvg = isCollection ? asset.previewSvg : asset.svg;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="mb-8">
                <a href="/marketplace" className="text-[10px] font-mono text-[var(--text-dim)] hover:text-[var(--accent)] flex items-center gap-2 mb-4 uppercase">
                    <div className="icon-arrow-left w-3 h-3"></div>
                    Back to Marketplace
                </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Preview */}
                <div className="space-y-4">
                    <div className="bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-[4px] p-12 flex items-center justify-center relative overflow-hidden group min-h-[400px]">
                        {/* Background Grid */}
                        <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                        
                        <div 
                            className="w-full max-w-md aspect-square text-[var(--text-main)] drop-shadow-2xl transition-transform duration-500 hover:scale-105"
                            dangerouslySetInnerHTML={{ __html: displaySvg }}
                        ></div>
                    </div>

                    {/* Collection Mini-Grid */}
                    {isCollection && (
                         <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {asset.items.map((item, idx) => (
                                <div key={idx} className="aspect-square bg-[var(--bg-surface)] border border-[var(--border-dim)] rounded-[2px] p-2 flex items-center justify-center hover:border-[var(--text-muted)] transition-colors" title={item.name}>
                                    <div className="w-full h-full text-[var(--text-main)]" dangerouslySetInnerHTML={{ __html: item.svg }}></div>
                                </div>
                            ))}
                         </div>
                    )}
                </div>

                {/* Right: Info */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] font-mono font-bold uppercase bg-[var(--bg-surface)] border border-[var(--border-dim)] px-2 py-1 rounded-[2px] text-[var(--text-muted)]">
                            {asset.category}
                        </span>
                        {isCollection && (
                             <span className="text-[10px] font-mono font-bold uppercase bg-[var(--bg-surface)] border border-[var(--border-dim)] px-2 py-1 rounded-[2px] text-[var(--accent)] flex items-center gap-1">
                                <div className="icon-layers w-3 h-3"></div> COLLECTION
                             </span>
                        )}
                        {asset.isPremium && (
                             <span className="text-[10px] font-mono font-bold uppercase bg-[var(--accent)] text-black px-2 py-1 rounded-[2px]">PREMIUM</span>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-mono font-bold text-[var(--text-main)] mb-6 uppercase leading-tight">{asset.title}</h1>
                    
                    <p className="text-[var(--text-muted)] text-lg leading-relaxed mb-8 border-l-2 border-[var(--accent)] pl-4">
                        {asset.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-8">
                        {asset.tags.map(tag => (
                            <span key={tag} className="text-xs text-[var(--text-dim)] bg-[var(--bg-surface)] px-2 py-1 rounded-[2px] font-mono">#{tag}</span>
                        ))}
                    </div>

                    <div className="bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-[2px] p-6 mb-8 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-sm font-mono text-[var(--text-muted)]">LICENSE TYPE</span>
                            <span className="text-sm font-bold text-[var(--text-main)]">COMMERCIAL / ROYALTY FREE</span>
                        </div>
                        
                        {asset.isPremium ? (
                            <div className="space-y-4">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-[var(--text-main)]">${asset.price}</span>
                                    <span className="text-[var(--text-dim)] text-sm">USD</span>
                                </div>
                                <button 
                                    id="purchase-btn"
                                    onClick={handlePurchase}
                                    className="btn btn-primary w-full py-4 text-base font-bold shadow-[0_0_20px_rgba(204,255,0,0.15)] hover:shadow-[0_0_30px_rgba(204,255,0,0.25)] transition-all"
                                >
                                    UNLOCK COLLECTION
                                </button>
                                <p className="text-center text-[10px] text-[var(--text-dim)]">Secured by Stripe</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-[var(--text-main)]">Free</span>
                                </div>
                                <button 
                                    onClick={handleDownload}
                                    disabled={downloading}
                                    className="btn btn-primary w-full py-4 text-base font-bold shadow-lg"
                                >
                                    {downloading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full"></div>
                                            COMPRESSING ZIP...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <div className="icon-download w-4 h-4"></div>
                                            {isCollection ? 'DOWNLOAD COLLECTION (ZIP)' : 'DOWNLOAD SVG'}
                                        </span>
                                    )}
                                </button>
                                {isCollection && <p className="text-center text-[10px] text-[var(--text-dim)]">Includes {asset.items.length} individual SVG files</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}