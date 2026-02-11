function ProBadge() {
    return (
        <div className="flex items-center gap-1.5 bg-black border border-[var(--accent)] px-3 py-1 rounded-[2px] shadow-[0_0_10px_rgba(204,255,0,0.15)] group relative overflow-hidden h-[28px] select-none">
            {/* Scanline effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            
            <div className="flex items-center justify-center w-4 h-4">
                <div className="icon-crown text-[var(--accent)] text-base"></div>
            </div>
            <span className="text-[11px] font-mono font-bold text-[var(--accent)] tracking-widest leading-none pt-[1px]">PRO</span>
        </div>
    );
}