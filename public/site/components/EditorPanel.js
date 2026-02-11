function EditorPanel({ selection, onChange, onClose, onDuplicate, onDelete, onReorder }) {
    if (!selection) return null;

    const { element, type } = selection;

    const handleChange = (key, value) => {
        onChange(element.id, { [key]: value });
    };

    const handleNudge = (axis, delta) => {
        const currentVal = element[axis] || (axis === 'x' ? (element.cx || element.x1 || 0) : (element.cy || element.y1 || 0));
        let updates = {};
        
        if (element.cx !== undefined && axis === 'x') updates.cx = currentVal + delta;
        else if (element.cy !== undefined && axis === 'y') updates.cy = currentVal + delta;
        else if (element.x1 !== undefined && axis === 'x') {
            updates.x1 = element.x1 + delta;
            updates.x2 = element.x2 + delta;
        }
        else if (element.y1 !== undefined && axis === 'y') {
            updates.y1 = element.y1 + delta;
            updates.y2 = element.y2 + delta;
        }
        else updates[axis] = currentVal + delta;

        onChange(element.id, updates);
    };

    return (
        <div className="absolute top-4 right-4 z-20 w-64 bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-[2px] shadow-2xl animate-in slide-in-from-right-2 fade-in duration-200 flex flex-col max-h-[calc(100%-32px)]">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-[var(--border-dim)] bg-[var(--bg-surface)] shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div>
                    <span className="text-xs font-mono font-bold text-[var(--text-main)] uppercase truncate max-w-[120px]">Edit {type}</span>
                </div>
                <button onClick={onClose} className="text-[var(--text-dim)] hover:text-[var(--text-main)]">
                    <div className="icon-x w-3 h-3"></div>
                </button>
            </div>

            <div className="p-4 space-y-5 overflow-y-auto custom-scrollbar">
                
                {/* Actions Toolbar */}
                <div className="grid grid-cols-4 gap-1">
                     <button onClick={() => onReorder('up')} className="btn btn-secondary p-1 h-8" title="Bring Forward">
                        <div className="icon-arrow-up w-4 h-4"></div>
                    </button>
                    <button onClick={() => onReorder('down')} className="btn btn-secondary p-1 h-8" title="Send Backward">
                        <div className="icon-arrow-down w-4 h-4"></div>
                    </button>
                    <button onClick={onDuplicate} className="btn btn-secondary p-1 h-8" title="Duplicate">
                        <div className="icon-copy w-4 h-4"></div>
                    </button>
                    <button onClick={onDelete} className="btn btn-secondary p-1 h-8 hover:text-red-500 hover:border-red-500" title="Delete">
                        <div className="icon-trash w-4 h-4"></div>
                    </button>
                </div>

                {/* Position & Nudge */}
                <div className="space-y-2">
                    <label className="label-text">Position</label>
                    <div className="grid grid-cols-2 gap-2">
                        {/* X Control */}
                        <div className="space-y-1">
                            <div className="relative">
                                <span className="absolute left-2 top-1.5 text-[10px] text-[var(--text-dim)] font-mono">X</span>
                                <input 
                                    type="number" 
                                    value={Math.round(element.x || element.cx || element.x1 || 0)}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        if (element.cx !== undefined) handleChange('cx', val);
                                        else if (element.x1 !== undefined) {
                                            const diff = val - element.x1;
                                            onChange(element.id, { x1: val, x2: element.x2 + diff });
                                        }
                                        else handleChange('x', val);
                                    }}
                                    className="w-full bg-[var(--bg-body)] border border-[var(--border-mid)] rounded-[2px] py-1 pl-6 pr-1 text-xs font-mono text-[var(--text-main)]"
                                />
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => handleNudge('x', -1)} className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-dim)] rounded-[1px] hover:bg-[var(--bg-hover)] text-[10px] py-0.5">-</button>
                                <button onClick={() => handleNudge('x', 1)} className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-dim)] rounded-[1px] hover:bg-[var(--bg-hover)] text-[10px] py-0.5">+</button>
                            </div>
                        </div>

                        {/* Y Control */}
                        <div className="space-y-1">
                            <div className="relative">
                                <span className="absolute left-2 top-1.5 text-[10px] text-[var(--text-dim)] font-mono">Y</span>
                                <input 
                                    type="number" 
                                    value={Math.round(element.y || element.cy || element.y1 || 0)}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        if (element.cy !== undefined) handleChange('cy', val);
                                        else if (element.y1 !== undefined) {
                                            const diff = val - element.y1;
                                            onChange(element.id, { y1: val, y2: element.y2 + diff });
                                        }
                                        else handleChange('y', val);
                                    }}
                                    className="w-full bg-[var(--bg-body)] border border-[var(--border-mid)] rounded-[2px] py-1 pl-6 pr-1 text-xs font-mono text-[var(--text-main)]"
                                />
                            </div>
                             <div className="flex gap-1">
                                <button onClick={() => handleNudge('y', -1)} className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-dim)] rounded-[1px] hover:bg-[var(--bg-hover)] text-[10px] py-0.5">-</button>
                                <button onClick={() => handleNudge('y', 1)} className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-dim)] rounded-[1px] hover:bg-[var(--bg-hover)] text-[10px] py-0.5">+</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appearance */}
                <div className="space-y-3 pt-4 border-t border-[var(--border-dim)]">
                    <label className="label-text">Style</label>
                    
                    {/* Fill */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--text-muted)]">Fill</span>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={element.fill === 'none' ? '#ffffff' : element.fill}
                                onChange={(e) => handleChange('fill', e.target.value)}
                                disabled={element.fill === 'none'}
                                className="w-6 h-6 rounded-[2px] border-0 p-0 cursor-pointer"
                            />
                            <button 
                                onClick={() => handleChange('fill', element.fill === 'none' ? '#000000' : 'none')}
                                className={`text-[10px] px-1.5 py-0.5 border rounded-[2px] ${element.fill === 'none' ? 'bg-[var(--accent)] text-black border-transparent' : 'text-[var(--text-dim)] border-[var(--border-dim)]'}`}
                            >
                                {element.fill === 'none' ? 'OFF' : 'ON'}
                            </button>
                        </div>
                    </div>

                    {/* Stroke Color */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--text-muted)]">Stroke</span>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={element.stroke === 'none' ? '#000000' : element.stroke}
                                onChange={(e) => handleChange('stroke', e.target.value)}
                                disabled={element.stroke === 'none'}
                                className="w-6 h-6 rounded-[2px] border-0 p-0 cursor-pointer"
                            />
                            <button 
                                onClick={() => handleChange('stroke', element.stroke === 'none' ? '#000000' : 'none')}
                                className={`text-[10px] px-1.5 py-0.5 border rounded-[2px] ${element.stroke === 'none' ? 'bg-[var(--accent)] text-black border-transparent' : 'text-[var(--text-dim)] border-[var(--border-dim)]'}`}
                            >
                                {element.stroke === 'none' ? 'OFF' : 'ON'}
                            </button>
                        </div>
                    </div>

                    {/* Stroke Width */}
                    {element.stroke !== 'none' && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-[var(--text-dim)]">
                                <span>Weight</span>
                                <span>{element.strokeWidth || 0}px</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="20" 
                                step="0.5"
                                value={element.strokeWidth || 0}
                                onChange={(e) => handleChange('strokeWidth', Number(e.target.value))}
                                className="w-full accent-[var(--accent)] h-1 bg-[var(--bg-body)] rounded-full appearance-none cursor-pointer"
                            />
                        </div>
                    )}
                    
                    {/* Opacity */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-[var(--text-dim)]">
                            <span>Opacity</span>
                            <span>{Math.round((element.opacity !== undefined ? element.opacity : 1) * 100)}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.1"
                            value={element.opacity !== undefined ? element.opacity : 1}
                            onChange={(e) => handleChange('opacity', Number(e.target.value))}
                            className="w-full accent-[var(--accent)] h-1 bg-[var(--bg-body)] rounded-full appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}