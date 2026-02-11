function PreviewCanvas({ data, loading, selectedIds = [], setSelectedIds, isPro, onOpenUpgrade, viewMode, onBatchUpdate, animationConfig, forwardedSvgRef }) {
    // Use forwarded ref if provided, else local fallback (though hooks rule of thumb: use one)
    // We'll sync them or just use one. Let's rely on forwardedSvgRef primarily if we can, 
    // but we need it to work even if not provided.
    const internalRef = React.useRef(null);
    const svgRef = forwardedSvgRef || internalRef;
    
    const containerRef = React.useRef(null);
    const [zoom, setZoom] = React.useState(1);
    const [bgMode, setBgMode] = React.useState('default'); // 'default', 'white', 'black', 'transparent'
    const [exportOpen, setExportOpen] = React.useState(false);
    const [loadingMsg, setLoadingMsg] = React.useState('INITIALIZING...');
    const [copied, setCopied] = React.useState(false);

    // Interaction State
    const [interaction, setInteraction] = React.useState({ type: 'idle' }); // { type: 'idle' | 'drag-element' | 'box-select', ...data }
    const [tempTransforms, setTempTransforms] = React.useState({}); // { [id]: { dx, dy } } for visual feedback during drag

    // Loading message cycle
    React.useEffect(() => {
        if (!loading) return;
        const messages = ["COMPUTING_GEOMETRY...", "OPTIMIZING_PATHS...", "VECTORIZING_NODES...", "POLISHING_CURVES...", "FINALIZING_OUTPUT..."];
        let i = 0;
        setLoadingMsg(messages[0]);
        const interval = setInterval(() => { i = (i + 1) % messages.length; setLoadingMsg(messages[i]); }, 1200);
        return () => clearInterval(interval);
    }, [loading]);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 4));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
    const handleResetZoom = () => setZoom(1);

    // --- Helpers ---
    const getSvgPoint = (clientX, clientY) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const pt = svgRef.current.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        return pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
    };

    // --- Interaction Handlers ---

    const handleMouseDown = (e) => {
        if (viewMode !== 'edit' || loading || !data) return;
        
        // Check if user clicked an element (target will be the shape)
        // Note: We use event delegation or check target
        const targetId = e.target.getAttribute('data-id');
        
        if (targetId) {
            // Drag Element Start
            e.stopPropagation();
            if (!isPro) { onOpenUpgrade(); return; }

            // If clicking an unselected item without Shift, select only it
            let newSelectedIds = selectedIds;
            if (!selectedIds.includes(targetId) && !e.shiftKey) {
                newSelectedIds = [targetId];
                setSelectedIds(newSelectedIds);
            } else if (e.shiftKey && !selectedIds.includes(targetId)) {
                newSelectedIds = [...selectedIds, targetId];
                setSelectedIds(newSelectedIds);
            }

            const startPos = getSvgPoint(e.clientX, e.clientY);
            setInteraction({
                type: 'drag-element',
                startPos,
                draggingIds: newSelectedIds
            });
        } else {
            // Box Select Start
            // Only if clicking on background (svg or container)
            const startPos = getSvgPoint(e.clientX, e.clientY);
            setInteraction({
                type: 'box-select',
                startPos,
                currentPos: startPos
            });
            if (!e.shiftKey) setSelectedIds([]); // Clear selection unless Shift held
        }
    };

    const handleMouseMove = (e) => {
        if (interaction.type === 'idle') return;

        const currentPos = getSvgPoint(e.clientX, e.clientY);

        if (interaction.type === 'drag-element') {
            const dx = currentPos.x - interaction.startPos.x;
            const dy = currentPos.y - interaction.startPos.y;
            
            // Update temp transforms for all dragging elements
            const newTransforms = {};
            interaction.draggingIds.forEach(id => {
                newTransforms[id] = { dx, dy };
            });
            setTempTransforms(newTransforms);
        } else if (interaction.type === 'box-select') {
            setInteraction(prev => ({ ...prev, currentPos }));
        }
    };

    const handleMouseUp = (e) => {
        if (interaction.type === 'idle') return;

        if (interaction.type === 'drag-element') {
            // Commit changes
            const updates = {};
            interaction.draggingIds.forEach(id => {
                const tf = tempTransforms[id];
                if (tf) {
                    const el = data.elements.find(e => e.id === id);
                    if (el) {
                        // Apply delta to element properties
                        updates[id] = {};
                        if (el.cx !== undefined) updates[id].cx = el.cx + tf.dx;
                        else if (el.cy !== undefined) updates[id].cy = el.cy + tf.dy;
                        
                        if (el.x !== undefined) updates[id].x = el.x + tf.dx;
                        if (el.y !== undefined) updates[id].y = el.y + tf.dy;

                        if (el.x1 !== undefined) {
                            updates[id].x1 = el.x1 + tf.dx;
                            updates[id].x2 = el.x2 + tf.dx;
                        }
                        if (el.y1 !== undefined) {
                            updates[id].y1 = el.y1 + tf.dy;
                            updates[id].y2 = el.y2 + tf.dy;
                        }
                    }
                }
            });
            if (Object.keys(updates).length > 0) {
                onBatchUpdate(updates);
            }
            setTempTransforms({});
        } else if (interaction.type === 'box-select') {
            // Calculate intersection
            const x1 = Math.min(interaction.startPos.x, interaction.currentPos.x);
            const x2 = Math.max(interaction.startPos.x, interaction.currentPos.x);
            const y1 = Math.min(interaction.startPos.y, interaction.currentPos.y);
            const y2 = Math.max(interaction.startPos.y, interaction.currentPos.y);

            // Find elements inside box (simplified center point check)
            const capturedIds = data.elements.filter(el => {
                // Determine rough center/position
                let ex = el.cx ?? el.x ?? el.x1 ?? 0;
                let ey = el.cy ?? el.y ?? el.y1 ?? 0;
                // Refine for shapes with width/height
                if (el.width) ex += el.width/2;
                if (el.height) ey += el.height/2;

                return ex >= x1 && ex <= x2 && ey >= y1 && ey <= y2;
            }).map(el => el.id);

            // Merge if shift held, else replace
            if (e.shiftKey) {
                const newSet = new Set([...selectedIds, ...capturedIds]);
                setSelectedIds(Array.from(newSet));
            } else {
                setSelectedIds(capturedIds);
            }
        }

        setInteraction({ type: 'idle' });
    };


    const handleDownloadSvg = () => {
        if (!svgRef.current) return;
        const svgData = new XMLSerializer().serializeToString(svgRef.current);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vexura-${data?.name || 'icon'}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopyCode = () => {
        if (!svgRef.current) return;
        navigator.clipboard.writeText(new XMLSerializer().serializeToString(svgRef.current));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Check if data exists but is effectively empty (fallback state)
    const isEmpty = !data || (
        (!data.svg || data.svg === '') && 
        (!data.elements || data.elements.length === 0)
    );

    if (isEmpty && !loading) {
        return (
            <div className="w-full h-full min-h-[500px] bg-[var(--bg-panel)] rounded-[2px] border border-dashed border-[var(--border-mid)] flex flex-col items-center justify-center text-[var(--text-dim)] font-mono">
                {data ? (
                    // Fallback visual for successful but empty generation
                    <>
                        <div className="icon-triangle-alert w-8 h-8 mb-4 opacity-50 text-yellow-500"></div>
                        <p className="text-xs tracking-widest uppercase text-yellow-500">Generation Empty</p>
                        <p className="text-[10px] opacity-50 mt-1">AI returned no visible elements. Try a different prompt.</p>
                        <div className="mt-4">
                            <svg width="64" height="64" viewBox="0 0 100 100" className="opacity-20">
                                <rect width="100" height="100" fill="currentColor" rx="4"/>
                                <path d="M30 30 L70 70 M70 30 L30 70" stroke="var(--bg-panel)" strokeWidth="8" strokeLinecap="round"/>
                            </svg>
                        </div>
                    </>
                ) : (
                    // Initial empty state
                    <>
                        <div className="icon-grid-3x3 w-8 h-8 mb-4 opacity-50"></div>
                        <p className="text-xs tracking-widest uppercase">Canvas Empty</p>
                        <p className="text-[10px] opacity-50 mt-1">Enter a prompt to generate icon</p>
                    </>
                )}
            </div>
        );
    }

    const isEditMode = viewMode === 'edit';

    return (
        <div className="relative w-full h-full flex flex-col gap-2">
            {/* Inject Animation Keyframes */}
            {animationConfig && (
                <style>{`
                    @keyframes anim-breathe {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.02); }
                    }
                    @keyframes anim-float {
                        0%, 100% { transform: translateY(0) rotate(0deg); }
                        50% { transform: translateY(-8px) rotate(1deg); }
                    }
                `}</style>
            )}

            {/* Toolbar (Zoom & Export only) */}
            {data && !loading && (
                <div className="flex flex-col gap-3 bg-[var(--bg-panel)] p-2 border border-[var(--border-dim)] rounded-[2px] sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        {/* Background Toggles */}
                        <div className="flex items-center border border-[var(--border-dim)] rounded-[2px] bg-[var(--bg-body)] h-8 p-1 gap-1">
                            <button 
                                onClick={() => setBgMode('default')} 
                                className={`w-6 h-full rounded-[1px] flex items-center justify-center transition-all ${bgMode === 'default' ? 'bg-[var(--bg-surface)] text-[var(--text-main)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'}`} 
                                title="Default Theme"
                            >
                                <div className="icon-layout-grid w-3 h-3"></div>
                            </button>
                            <button 
                                onClick={() => setBgMode('white')} 
                                className={`w-6 h-full rounded-[1px] flex items-center justify-center transition-all ${bgMode === 'white' ? 'bg-[var(--border-dim)] ring-1 ring-[var(--text-main)]' : 'hover:bg-[var(--bg-surface)]'}`} 
                                title="White Background"
                            >
                                <div className="w-3 h-3 bg-white rounded-[1px] border border-gray-300"></div>
                            </button>
                            <button 
                                onClick={() => setBgMode('black')} 
                                className={`w-6 h-full rounded-[1px] flex items-center justify-center transition-all ${bgMode === 'black' ? 'bg-[var(--border-dim)] ring-1 ring-[var(--text-main)]' : 'hover:bg-[var(--bg-surface)]'}`} 
                                title="Black Background"
                            >
                                <div className="w-3 h-3 bg-black rounded-[1px] border border-gray-600"></div>
                            </button>
                            <button 
                                onClick={() => setBgMode('transparent')} 
                                className={`w-6 h-full rounded-[1px] flex items-center justify-center transition-all ${bgMode === 'transparent' ? 'bg-[var(--bg-surface)] text-[var(--text-main)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'}`} 
                                title="Transparent Checker"
                            >
                                <div className="icon-grid w-3 h-3 opacity-50"></div>
                            </button>
                        </div>
                        
                        <div className="w-px h-4 bg-[var(--border-dim)]"></div>
                        
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--text-muted)]">
                            <span className="text-[var(--text-dim)]">SIZE:</span> 400px
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className="flex items-center border border-[var(--border-dim)] rounded-[2px] bg-[var(--bg-body)] h-8">
                            <button onClick={handleZoomOut} className="h-full px-3 hover:bg-[var(--bg-surface)] flex items-center justify-center"><div className="icon-minus text-xs leading-none"></div></button>
                            <span className="text-[10px] font-mono px-2 border-x border-[var(--border-dim)] h-full flex items-center select-none">{Math.round(zoom * 100)}%</span>
                            <button onClick={handleZoomIn} className="h-full px-3 hover:bg-[var(--bg-surface)] flex items-center justify-center"><div className="icon-plus text-xs leading-none"></div></button>
                            <button onClick={handleResetZoom} className="h-full px-3 hover:bg-[var(--bg-surface)] border-l border-[var(--border-dim)] flex items-center justify-center"><div className="icon-maximize text-xs leading-none"></div></button>
                        </div>
                        <div className="w-px h-4 bg-[var(--border-dim)]"></div>
                        <button onClick={handleCopyCode} className={`btn btn-ghost py-1 px-2 text-xs h-8 ${copied ? 'text-green-500' : ''}`}>{copied ? 'COPIED' : 'COPY'}</button>
                        <button onClick={handleDownloadSvg} className="btn btn-primary py-1 px-3 text-xs h-8">EXPORT</button>
                    </div>
                </div>
            )}

            {/* Canvas Container */}
            <div 
                ref={containerRef}
                className={`relative flex-1 rounded-[2px] overflow-hidden border transition-colors group min-h-[500px] ${isEditMode ? 'border-[var(--accent)] ring-1 ring-[var(--accent)] cursor-crosshair' : 'border-[var(--border-dim)]'}`}
                style={{
                    backgroundColor: bgMode === 'white' ? '#ffffff' : 
                                   bgMode === 'black' ? '#000000' : 
                                   bgMode === 'transparent' ? '#18181b' : 'var(--bg-panel)',
                    backgroundImage: bgMode === 'transparent' 
                        ? 'linear-gradient(45deg, #27272a 25%, transparent 25%), linear-gradient(-45deg, #27272a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #27272a 75%), linear-gradient(-45deg, transparent 75%, #27272a 75%)' 
                        : 'none',
                    backgroundSize: bgMode === 'transparent' ? '20px 20px' : 'auto',
                    backgroundPosition: bgMode === 'transparent' ? '0 0, 0 10px, 10px -10px, -10px 0px' : '0 0'
                }}
            >
                {/* Default Grid Overlay (Only show in default mode) */}
                {bgMode === 'default' && (
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                )}
                
                {loading && (
                    <div className="absolute inset-0 z-10 bg-[var(--bg-panel)] brightness-95 overflow-hidden flex flex-col items-center justify-center">
                        {/* Static Grid Background */}
                        <div className="absolute inset-0 grid-pattern opacity-30"></div>
                        
                        {/* Scanning Wave */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--accent)]/5 to-transparent animate-scan pointer-events-none"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--accent)]/10 to-transparent animate-scan pointer-events-none" style={{ animationDelay: '0.1s' }}></div>
                        
                        {/* Content */}
                        <div className="relative z-20 flex flex-col items-center bg-[var(--bg-body)]/40 backdrop-blur-[2px] p-6 rounded border border-[var(--border-dim)]/30">
                            <div className="font-mono text-[var(--accent)] text-xs font-bold mb-4 tracking-wider flex items-center gap-2">
                                <div className="w-2 h-2 bg-[var(--accent)] animate-pulse rounded-full"></div>
                                {loadingMsg}
                            </div>
                            <div className="w-48 h-[2px] bg-[var(--bg-surface)] overflow-hidden rounded-full relative">
                                <div className="absolute inset-0 bg-[var(--accent)] animate-[shimmer_1.5s_infinite] origin-left"></div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="w-full h-full flex items-center justify-center p-8 overflow-hidden"
                     onMouseDown={handleMouseDown}
                     onMouseMove={handleMouseMove}
                     onMouseUp={handleMouseUp}
                     onMouseLeave={handleMouseUp}
                >
                     {data && (
                        <div style={{ transform: `scale(${zoom})`, transition: 'transform 0.1s linear' }} className="origin-center pointer-events-none"> 
                            {/* Pointer events none on wrapper so events pass to SVG */}
                            
                            {/* 
                                RENDER STRATEGY:
                                1. If we have raw SVG string from backend AND not in edit mode, use it (Best Fidelity).
                                2. If in edit mode, or no SVG string, render Elements (Best Interactivity).
                            */}
                            
                            {data.svg && !isEditMode ? (
                                <div 
                                    className="w-[400px] h-[400px] shadow-2xl bg-transparent rounded-sm select-none pointer-events-auto border border-[var(--border-dim)] flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                                    dangerouslySetInnerHTML={{ __html: data.svg }}
                                    ref={(node) => {
                                        // Capture ref for export/copy functionality
                                        if (node) svgRef.current = node.querySelector('svg'); 
                                    }}
                                ></div>
                            ) : (
                                <svg
                                    ref={svgRef}
                                    viewBox="0 0 400 400"
                                    className={`w-[400px] h-[400px] shadow-2xl bg-transparent rounded-sm select-none pointer-events-auto border border-[var(--border-dim)]`} 
                                    preserveAspectRatio="xMidYMid meet"
                                >
                                    {/* Render elements */}
                                    {data.elements.map((el, i) => {
                                        const isSelected = selectedIds.includes(el.id);
                                        
                                        // Calculate visual offset if dragging
                                        let transformStr = el.transform || '';
                                        if (tempTransforms[el.id]) {
                                            transformStr += ` translate(${tempTransforms[el.id].dx}, ${tempTransforms[el.id].dy})`;
                                        }

                                        // Animation Logic
                                        let animStyle = {};
                                        if (animationConfig) {
                                            // Find if this element belongs to a track
                                            const track = animationConfig.tracks.find(t => t.targetIds.includes(el.id));
                                            if (track) {
                                                if (track.type === 'float') {
                                                    animStyle = {
                                                        animation: `anim-float ${track.params.duration}s ease-in-out infinite alternate`,
                                                        animationDelay: `${track.params.delay}s`,
                                                        transformBox: 'fill-box',
                                                        transformOrigin: 'center'
                                                    };
                                                } else if (track.type === 'breathe') {
                                                    animStyle = {
                                                        animation: `anim-breathe ${track.params.duration}s ease-in-out infinite`,
                                                        animationDelay: `${track.params.delay}s`,
                                                        transformBox: 'fill-box',
                                                        transformOrigin: 'center'
                                                    };
                                                }
                                            }
                                        }

                                        const commonProps = {
                                            key: el.id || i,
                                            "data-id": el.id, // For target detection
                                            fill: el.fill || 'none',
                                            stroke: el.stroke || 'none',
                                            strokeWidth: el.strokeWidth || 0,
                                            opacity: el.opacity,
                                            transform: transformStr,
                                            className: `transition-opacity ${isEditMode ? 'hover:opacity-80' : ''} ${isSelected ? 'stroke-[var(--accent)] drop-shadow-md' : ''}`,
                                            style: {
                                                ...(isSelected ? { filter: 'drop-shadow(0 0 2px var(--accent))', stroke: 'var(--accent)', strokeWidth: Math.max(2, (el.strokeWidth || 0) + 2) } : {}),
                                                ...animStyle
                                            }
                                        };
                                        
                                        const type = (el.type || '').toLowerCase();
                                        switch (type) {
                                            case 'circle': return <circle {...commonProps} cx={el.cx} cy={el.cy} r={el.r} />;
                                            case 'ellipse': return <ellipse {...commonProps} cx={el.cx} cy={el.cy} rx={el.rx} ry={el.ry} />;
                                            case 'rect': case 'rectangle': return <rect {...commonProps} x={el.x} y={el.y} width={el.width} height={el.height} rx={el.rx} ry={el.ry || el.rx} />;
                                            case 'polygon': return <polygon {...commonProps} points={el.points} />;
                                            case 'path': return <path {...commonProps} d={el.d} />;
                                            case 'line': return <line {...commonProps} x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} />;
                                            default: return null;
                                        }
                                    })}

                                    {/* Selection Box Overlay */}
                                    {interaction.type === 'box-select' && (
                                        <rect
                                            x={Math.min(interaction.startPos.x, interaction.currentPos.x)}
                                            y={Math.min(interaction.startPos.y, interaction.currentPos.y)}
                                            width={Math.abs(interaction.currentPos.x - interaction.startPos.x)}
                                            height={Math.abs(interaction.currentPos.y - interaction.startPos.y)}
                                            fill="var(--accent)"
                                            fillOpacity="0.1"
                                            stroke="var(--accent)"
                                            strokeWidth="1"
                                            strokeDasharray="4 4"
                                            className="pointer-events-none"
                                        />
                                    )}
                                </svg>
                            )}
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
}