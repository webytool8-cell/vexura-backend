function HistoryThumb({ data, isActive, onClick }) {
    if (!data) return null;

    const createdAt = data.createdAt ? new Date(data.createdAt).getTime() : null;
    const minutesAgo = createdAt ? Math.max(1, Math.round((Date.now() - createdAt) / 60000)) : null;
    const relativeLabel = minutesAgo ? `${minutesAgo}m ago` : 'Recent';

    return (
        <div className="shrink-0">
            <button 
                onClick={onClick}
                className={`w-20 h-20 rounded-[4px] border-2 bg-white flex items-center justify-center relative overflow-hidden transition-all duration-200 shrink-0 hover:scale-[1.04] ${isActive ? 'border-[var(--accent)] shadow-[0_0_14px_rgba(204,255,0,0.2)]' : 'border-[var(--border-dim)] hover:border-[var(--accent)]'}`}
                title={data.name || 'History Item'}
            >
                <svg
                    viewBox="0 0 400 400"
                    className="w-full h-full p-1.5"
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

                <span className="absolute bottom-1 right-1 text-[10px] bg-black/65 text-white rounded px-1">🎨</span>
            </button>
            <p className="mt-1 text-[10px] text-[var(--text-dim)] text-center">{relativeLabel}</p>
        </div>
    );
}
