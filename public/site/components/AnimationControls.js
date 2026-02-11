function AnimationControls({ isActive, onToggle, onExport, isPro, onOpenUpgrade }) {
    const [showMenu, setShowMenu] = React.useState(false);

    if (!isActive && !isPro) {
        return (
            <button 
                onClick={onOpenUpgrade}
                className="w-full flex items-center justify-between p-3 bg-[var(--bg-surface)] border border-[var(--border-dim)] rounded-[2px] hover:border-[var(--accent)] group transition-all"
            >
                <div className="flex items-center gap-2">
                    <div className="icon-film w-4 h-4 text-[var(--text-dim)] group-hover:text-[var(--accent)]"></div>
                    <span className="text-xs font-mono font-bold text-[var(--text-muted)] group-hover:text-[var(--text-main)]">ANIMATION</span>
                </div>
                <div className="icon-lock w-3 h-3 text-[var(--text-dim)]"></div>
            </button>
        );
    }

    return (
        <div className="w-full flex flex-col gap-2 p-3 bg-[var(--bg-surface)] border border-[var(--border-dim)] rounded-[2px] animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <div className={`icon-film w-4 h-4 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-main)]'}`}></div>
                    <span className="text-xs font-mono font-bold text-[var(--text-main)]">SMART MOTION</span>
                </div>
                <div className="px-1.5 py-0.5 bg-[var(--accent)] text-black text-[9px] font-bold rounded-[2px]">PRO</div>
            </div>
            
            <p className="text-[10px] text-[var(--text-dim)] mb-2 font-mono leading-tight">
                AI groups elements and applies physics-based floating behaviors.
            </p>

            <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={onToggle}
                    className={`btn text-xs h-8 ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                >
                    {isActive ? (
                        <>
                            <div className="icon-pause w-3 h-3"></div> STOP
                        </>
                    ) : (
                        <>
                            <div className="icon-play w-3 h-3"></div> PREVIEW
                        </>
                    )}
                </button>
                
                <div className="relative">
                    <button 
                        onClick={() => setShowMenu(!showMenu)}
                        disabled={!isActive}
                        className="btn btn-secondary text-xs h-8 w-full gap-2"
                    >
                        EXPORT <div className={`icon-chevron-down w-3 h-3 transition-transform ${showMenu ? 'rotate-180' : ''}`}></div>
                    </button>
                    
                    {showMenu && (
                        <div className="absolute top-full right-0 mt-1 w-full bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-[2px] shadow-xl z-20 flex flex-col py-1">
                            <button onClick={() => { onExport('svg'); setShowMenu(false); }} className="px-3 py-2 text-left text-[10px] font-mono hover:bg-[var(--bg-hover)] text-[var(--text-main)] flex items-center gap-2">
                                <div className="icon-file-code w-3 h-3"></div> SVG (ANIMATED)
                            </button>
                            <button onClick={() => { onExport('html'); setShowMenu(false); }} className="px-3 py-2 text-left text-[10px] font-mono hover:bg-[var(--bg-hover)] text-[var(--text-main)] flex items-center gap-2">
                                <div className="icon-globe w-3 h-3"></div> HTML DEMO
                            </button>
                            <button onClick={() => { onExport('json'); setShowMenu(false); }} className="px-3 py-2 text-left text-[10px] font-mono hover:bg-[var(--bg-hover)] text-[var(--text-main)] flex items-center gap-2">
                                <div className="icon-file-json w-3 h-3"></div> JSON CONFIG
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}