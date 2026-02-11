function ControlPanel({ data, isProcessing, meta, onAnimationToggle, isAnimating, onExportAnimation, isPro, onOpenUpgrade }) {
    if (isProcessing) {
        return (
            <div className="panel p-4 h-full flex flex-col gap-4 animate-pulse">
                <div className="h-4 bg-[var(--bg-surface)] rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-8 bg-[var(--bg-surface)] rounded-[2px]"></div>
                    <div className="h-8 bg-[var(--bg-surface)] rounded-[2px]"></div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="panel p-6 h-full flex flex-col items-center justify-center text-center text-[var(--text-dim)]">
                <div className="opacity-50 mb-3">
                    <Logo className="w-8 h-8" color="currentColor" />
                </div>
                <p className="text-xs font-mono">READY_FOR_PROMPT...</p>
            </div>
        );
    }

    // Determine score color and label
    const score = meta?.score;
    const hasScore = score !== null && score !== undefined;
    
    let scoreColor = 'text-[var(--text-dim)]';
    let barColor = 'bg-[var(--bg-surface)]';
    let qualityLabel = 'N/A';

    if (hasScore) {
        if (score >= 80) {
            scoreColor = 'text-green-500';
            barColor = 'bg-green-500';
            qualityLabel = 'EXCELLENT';
        } else if (score >= 50) {
            scoreColor = 'text-yellow-500';
            barColor = 'bg-yellow-500';
            qualityLabel = 'MODERATE';
        } else {
            scoreColor = 'text-red-500';
            barColor = 'bg-red-500';
            qualityLabel = 'POOR';
        }
    }

    return (
        <div className="panel p-4 h-full flex flex-col gap-6 overflow-y-auto">
            {/* Header Info */}
            <div className="pb-4 border-b border-[var(--border-dim)]">
                <div className="flex justify-between items-end mb-2">
                     <div className="label-text mb-0">QUALITY_SCORE</div>
                     <div className={`text-lg font-mono font-bold leading-none ${hasScore ? scoreColor : 'text-[var(--text-dim)]'}`}>
                         {hasScore ? `${score}/100` : '--'}
                     </div>
                </div>
                
                {/* Score Progress Bar */}
                {hasScore && (
                    <div className="w-full h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden mb-1">
                        <div 
                            className={`h-full ${barColor} transition-all duration-500`} 
                            style={{ width: `${score}%` }}
                        ></div>
                    </div>
                )}
                <div className={`text-[9px] font-mono text-right ${hasScore ? scoreColor : 'text-[var(--text-dim)]'} mb-4`}>
                    {qualityLabel}
                </div>

                <div className="mb-4">
                     <AnimationControls 
                        isActive={isAnimating}
                        onToggle={onAnimationToggle}
                        onExport={onExportAnimation}
                        isPro={isPro}
                        onOpenUpgrade={onOpenUpgrade}
                     />
                </div>

                <div className="label-text">ASSET_DETAILS</div>
                <div className="text-[var(--text-main)] font-mono text-sm uppercase truncate mb-1 font-bold">
                    {data.name || 'UNTITLED'}
                </div>
                <div className="flex flex-col gap-1 text-[10px] text-[var(--text-dim)] font-mono">
                    <div className="flex justify-between">
                        <span>DIMENSIONS:</span>
                        <span className="text-[var(--text-main)]">{data.width}x{data.height}px</span>
                    </div>
                    {data.reference && (
                        <div className="flex justify-between">
                            <span>REFERENCE:</span>
                            <span className="text-[var(--text-muted)] truncate max-w-[120px]" title={data.reference}>{data.reference}</span>
                        </div>
                    )}
                </div>

                {/* Warnings Section */}
                {meta?.warnings && meta.warnings.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-[2px]">
                        <div className="text-[10px] text-yellow-500 font-bold mb-2 flex items-center gap-1.5">
                            <div className="icon-triangle-alert w-3 h-3"></div> 
                            OPTIMIZATION_HINTS
                        </div>
                        <ul className="list-none space-y-1.5">
                            {meta.warnings.map((w, i) => (
                                <li key={i} className="text-[9px] text-[var(--text-muted)] leading-tight flex gap-1.5">
                                    <span className="text-yellow-500/50">•</span>
                                    {w}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Elements List */}
            <div className="flex-1 min-h-0 flex flex-col">
                <div className="label-text">VECTOR_NODES ({data.elements.length})</div>
                <div className="space-y-1 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    {data.elements.map((el, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-body)] border border-[var(--border-dim)] rounded-[2px] text-[10px] font-mono group hover:border-[var(--text-dim)] transition-colors">
                            <span className="text-[var(--text-muted)] uppercase">{el.type}</span>
                            <div className="flex gap-2 opacity-50 group-hover:opacity-100">
                                {el.fill && el.fill !== 'none' && (
                                    <div className="w-3 h-3 rounded-[1px]" style={{backgroundColor: el.fill}}></div>
                                )}
                                {el.stroke && (
                                    <div className="w-3 h-3 rounded-[1px] border border-current" style={{color: el.stroke}}></div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-4 mt-auto border-t border-[var(--border-dim)]">
                 <div className="flex items-center gap-2 text-[10px] text-[var(--text-dim)] font-mono">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    SYSTEM_ONLINE
                 </div>
            </div>
        </div>
    );
}