function HistoryThumb({ data, isActive, onClick }) {
    if (!data) return null;

    return (
        <button 
            onClick={onClick}
            className={`w-12 h-12 rounded-[2px] border bg-white flex items-center justify-center relative overflow-hidden transition-all shrink-0 ${isActive ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]' : 'border-[var(--border-dim)] hover:border-[var(--text-muted)]'}`}
            title={data.name || 'History Item'}
        >
            {/* Simple SVG Preview */}
             <svg
                viewBox="0 0 400 400"
                className="w-full h-full p-1"
                preserveAspectRatio="xMidYMid meet"
            >
                {data.elements && data.elements.map((el, i) => {
                    const commonProps = {
                        key: i,
                        fill: el.fill || 'none',
                        stroke: el.stroke || 'none',
                        strokeWidth: el.strokeWidth || 0,
                        opacity: el.opacity,
                        transform: el.transform
                    };
                    
                    const type = (el.type || '').toLowerCase();
                    
                    // Basic shape support for thumbnails
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
            </svg>
            
            {isActive && (
                <div className="absolute inset-0 border-2 border-[var(--accent)] pointer-events-none rounded-[2px]"></div>
            )}
        </button>
    );
}