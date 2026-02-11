function CreditCounter({ credits, onClick }) {
    // Determine color based on credits
    let colorClass = 'text-[var(--text-interactive)]';
    let bgClass = 'bg-[var(--bg-surface)] border-[var(--border-dim)]';
    
    if (credits <= 2) {
        colorClass = 'text-red-500';
        bgClass = 'bg-red-500/10 border-red-500/30';
    } else if (credits <= 5) {
        colorClass = 'text-yellow-500';
        bgClass = 'bg-yellow-500/10 border-yellow-500/30';
    }

    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[2px] border transition-all hover:bg-[var(--bg-hover)] group ${bgClass}`}
            title="Click to upgrade"
        >
            <div className={`icon-zap w-3 h-3 ${colorClass} ${credits <= 2 ? 'animate-pulse' : ''}`}></div>
            <div className="flex flex-col items-start leading-none">
                <span className={`text-xs font-mono font-bold ${colorClass}`}>
                    {credits} LEFT
                </span>
            </div>
            <div className="text-[9px] font-mono text-[var(--text-dim)] group-hover:text-[var(--text-main)] ml-1 border-l border-[var(--border-dim)] pl-2">
                UPGRADE
            </div>
        </button>
    );
}