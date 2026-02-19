function Generator({ user, onOpenAuth, onOpenUpgrade, onCreditUse }) {
    const [prompt, setPrompt] = React.useState('');
    const [type, setType] = React.useState('icon');
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    
    // Generator Mode: 'ai' | 'upload'
    const [inputMode, setInputMode] = React.useState('ai'); 

    // New: Intent State for Illustrations
    const [intent, setIntent] = React.useState('abstract'); // 'ui', 'diagram', 'abstract'

    // New: Vectorization Config State
    const [vectorConfig, setVectorConfig] = React.useState({
        mode: 'icon',   // icon | element | shape
        style: 'minimal', // minimal | organic | exact
        colors: 'low'   // bw | low | medium | high
    });

    const STYLE_CONFIG = {
        icon: [
            { id: 'auto', label: 'Auto Match', icon: 'icon-sparkles' },
            { id: 'minimal', label: 'Minimal', icon: 'icon-minus' },
            { id: 'outline', label: 'Outline', icon: 'icon-pencil' },
            { id: 'filled', label: 'Filled', icon: 'icon-square' },
            { id: 'geometric', label: 'Geometric', icon: 'icon-hexagon' },
        ],
        illustration: [
            { id: 'auto', label: 'Auto Match', icon: 'icon-sparkles' },
            { id: 'flat', label: 'Flat', icon: 'icon-image' },
            { id: 'organic', label: 'Organic', icon: 'icon-leaf' },
            { id: 'abstract', label: 'Abstract', icon: 'icon-shapes' },
            { id: 'technical', label: 'Technical', icon: 'icon-cpu' },
        ]
    };

    // State
    const [style, setStyle] = React.useState('auto'); 
    const [palette, setPalette] = React.useState('auto');
    const [customHex, setCustomHex] = React.useState('#000000');
    
    const [isProcessing, setIsProcessing] = React.useState(false); 
    const [processingStatus, setProcessingStatus] = React.useState(''); // For auto-improve feedback
    const [result, setResult] = React.useState(null);
    const [resultMeta, setResultMeta] = React.useState({ score: null, warnings: [] }); // Store metadata separate from vector
    const [originalResult, setOriginalResult] = React.useState(null); // For Reset
    
    const [history, setHistory] = React.useState([]); 
    const [saved, setSaved] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState('');
    
    // Feedback State
    const [feedbackSent, setFeedbackSent] = React.useState(false);

    // Changed to Array for Multi-select
    const [selectedElementIds, setSelectedElementIds] = React.useState([]);
    
    const [viewMode, setViewMode] = React.useState('create'); // 'create' | 'edit'
    const [animationConfig, setAnimationConfig] = React.useState(null);
    const [isAnimating, setIsAnimating] = React.useState(false);
    
    const canvasRef = React.useRef(null);
    const previewSvgRef = React.useRef(null);
    const fileInputRef = React.useRef(null);

    // Auto-scroll on mobile
    React.useEffect(() => {
        if ((isProcessing || result) && window.innerWidth < 768) {
            setTimeout(() => {
                canvasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [isProcessing, result]);

    // Auto-detect intent on prompt change
    React.useEffect(() => {
        if (type === 'illustration' && prompt && window.InputManager && window.InputManager.detectIntent) {
            const detected = window.InputManager.detectIntent(prompt);
            setIntent(detected);
        }
    }, [prompt, type]);

    const handleTypeChange = (newType) => {
        setType(newType);
        setStyle('auto'); 
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!user) { onOpenAuth(); return; }
        
        setIsProcessing(true);
        setProcessingStatus('ANALYZING_IMAGE...');
        setErrorMsg('');
        
        try {
            if (!window.Vectorizer) throw new Error("Vectorizer module not loaded");
            
            // Simulate pipeline delay steps for UX
            setTimeout(() => setProcessingStatus('SEGMENTING_COLORS...'), 800);
            setTimeout(() => setProcessingStatus('TRACING_REGIONS...'), 1600);
            
            const vectorResult = await window.Vectorizer.trace(file, vectorConfig);
            
            // Validate result
            if (!vectorResult.elements || vectorResult.elements.length === 0) {
                throw new Error("Could not trace any shapes. Try an image with higher contrast.");
            }

            const meta = {
                score: 100, // Manual upload gets full score
                warnings: [] 
            };
            
            const vectorData = {
                name: file.name.split('.')[0],
                width: 400,
                height: 400,
                elements: vectorResult.elements,
                svg: vectorResult.svg,
                source: 'upload'
            };

            setResult(vectorData);
            setResultMeta(meta);
            setOriginalResult(JSON.parse(JSON.stringify(vectorData)));
            setHistory(prev => [vectorData, ...prev].slice(0, 10));
            setViewMode('create');

        } catch (err) {
            console.error("Tracing failed", err);
            setErrorMsg(err.message || 'Image tracing failed');
        } finally {
            setIsProcessing(false);
            setProcessingStatus('');
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    
    // --- Data Manipulation Logic ---

    const handleElementUpdate = (id, updates) => {
        if (!result) return;
        // Handle single update or batch if id is null/array (logic for drag move)
        const updatedElements = result.elements.map(el => el.id === id ? { ...el, ...updates } : el);
        setResult({ ...result, elements: updatedElements });
    };

    const handleBatchUpdate = (updatesMap) => {
        // updatesMap: { [id]: { x: ..., y: ... } }
        if (!result) return;
        const updatedElements = result.elements.map(el => {
            if (updatesMap[el.id]) {
                return { ...el, ...updatesMap[el.id] };
            }
            return el;
        });
        setResult({ ...result, elements: updatedElements });
    };

    const handleDuplicate = (id) => {
        if (!user || user.plan !== 'pro') { onOpenUpgrade(); return; }
        
        const index = result.elements.findIndex(el => el.id === id);
        if (index === -1) return;

        const original = result.elements[index];
        const newElement = {
            ...original,
            id: `vex-dup-${Date.now()}-${Math.floor(Math.random()*1000)}`,
            // Offset slightly
            x: original.x ? original.x + 10 : undefined,
            y: original.y ? original.y + 10 : undefined,
            cx: original.cx ? original.cx + 10 : undefined,
            cy: original.cy ? original.cy + 10 : undefined,
            x1: original.x1 ? original.x1 + 10 : undefined,
            x2: original.x2 ? original.x2 + 10 : undefined,
            y1: original.y1 ? original.y1 + 10 : undefined,
            y2: original.y2 ? original.y2 + 10 : undefined,
            transform: original.transform // Ensure transform is copied for paths
        };

        const newElements = [...result.elements];
        newElements.splice(index + 1, 0, newElement);
        
        setResult({ ...result, elements: newElements });
        setSelectedElementIds([newElement.id]); // Select copy
    };

    const handleDelete = (ids) => {
        if (!user || user.plan !== 'pro') { onOpenUpgrade(); return; }
        // Handle single ID or array
        const idsToDelete = Array.isArray(ids) ? ids : [ids];
        const newElements = result.elements.filter(el => !idsToDelete.includes(el.id));
        setResult({ ...result, elements: newElements });
        setSelectedElementIds([]);
    };

    const handleReorder = (id, direction) => {
        if (!user || user.plan !== 'pro') { onOpenUpgrade(); return; }
        const index = result.elements.findIndex(el => el.id === id);
        if (index === -1) return;

        const newElements = [...result.elements];
        const element = newElements[index];

        if (direction === 'up' && index < newElements.length - 1) {
            newElements[index] = newElements[index + 1];
            newElements[index + 1] = element;
        } else if (direction === 'down' && index > 0) {
            newElements[index] = newElements[index - 1];
            newElements[index - 1] = element;
        }
        setResult({ ...result, elements: newElements });
    };

    const handleReset = () => {
        if (originalResult) {
            setResult(JSON.parse(JSON.stringify(originalResult)));
            setSelectedElementIds([]);
            setAnimationConfig(null);
            setIsAnimating(false);
        }
    };

    const handleAnimationToggle = () => {
        if (!user || user.plan !== 'pro') { onOpenUpgrade(); return; }
        
        if (isAnimating) {
            setIsAnimating(false);
            setAnimationConfig(null);
        } else {
            if (!result || !window.AnimationEngine) return;
            const config = window.AnimationEngine.generateConfig(result.elements);
            setAnimationConfig(config);
            setIsAnimating(true);
        }
    };

    const handleExportAnimation = (format) => {
        if (!animationConfig) return;

        let content, mimeType, extension;

        if (format === 'json') {
            content = JSON.stringify(animationConfig, null, 2);
            mimeType = 'application/json';
            extension = 'json';
        } 
        else if (format === 'svg' || format === 'html') {
            if (!previewSvgRef.current) return;
            
            // Serialize the current SVG DOM (includes inline animation styles)
            const serializer = new XMLSerializer();
            let svgString = serializer.serializeToString(previewSvgRef.current);
            
            // Generate the Keyframes CSS
            const cssKeyframes = window.AnimationEngine.generateCSS(animationConfig);
            
            // Inject Style tag into SVG
            // We look for the closing of the first tag or insert at start
            const styleTag = `<style>${cssKeyframes}</style>`;
            
            // Insert after <svg ...>
            const insertIdx = svgString.indexOf('>');
            if (insertIdx !== -1) {
                svgString = svgString.slice(0, insertIdx + 1) + styleTag + svgString.slice(insertIdx + 1);
            }

            if (format === 'svg') {
                content = svgString;
                mimeType = 'image/svg+xml;charset=utf-8';
                extension = 'svg';
            } else {
                // HTML Wrapper
                content = `<!DOCTYPE html>
<html>
<head>
    <title>VEXURA Animation Preview</title>
    <style>
        body { display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #09090b; color: #fafafa; font-family: monospace; }
        .container { text-align: center; }
        h1 { margin-bottom: 2rem; font-size: 14px; opacity: 0.5; }
    </style>
</head>
<body>
    <div class="container">
        <h1>VEXURA MOTION EXPORT</h1>
        ${svgString}
    </div>
</body>
</html>`;
                mimeType = 'text/html';
                extension = 'html';
            }
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vexura-motion-${Date.now()}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Feedback Logic ---
    const handleFeedback = (feedbackType) => {
        if (window.SignalCollector) {
            window.SignalCollector.track('feedback', {
                prompt: prompt,
                intent: type === 'illustration' ? intent : 'icon',
                feedback: feedbackType,
                resultId: result?.id || 'unsaved'
            });
        }
        setFeedbackSent(true);
        setTimeout(() => setFeedbackSent(false), 2000);
    };

    // --- Generation Logic ---

    const handleSmartRetry = () => {
        if (!resultMeta) return handleGenerate(null, 'similar');
        
        const { score, warnings } = resultMeta;
        let smartVariation = 'similar';
        let reasonLog = "Standard variation";

        // Heuristic 1: Complexity Checks (Warnings have highest priority)
        const hasComplexityWarning = warnings && warnings.some(w => 
            w.toLowerCase().includes('complex') || 
            w.toLowerCase().includes('node') || 
            w.toLowerCase().includes('path')
        );

        if (hasComplexityWarning) {
            smartVariation = 'simpler';
            reasonLog = "Complexity warning detected -> Simplifying";
        }
        // Heuristic 2: Low Score (Quality Issue)
        else if (score !== null && score < 50) {
            smartVariation = 'quality'; // Use new quality boost variation
            reasonLog = "Low score (<50) -> Boosting quality constraints";
        }
        // Heuristic 3: Moderate Score (Maybe lacking detail)
        else if (score !== null && score >= 50 && score < 70) {
            smartVariation = 'detailed';
            reasonLog = "Moderate score (<70) -> Adding structural detail";
        }

        console.log(`Smart Retry: ${reasonLog}`);
        handleGenerate(null, smartVariation);
    };

    const handleGenerate = async (e, variation = null, promptOverride = null, attempt = 1) => {
        if (e) e.preventDefault();
        
        // Initial checks only on first attempt
        if (attempt === 1) {
            if (!user) { onOpenAuth(); return; }
            if (user.plan !== 'pro' && user.credits <= 0) { onOpenUpgrade(); return; }
        }

        const activePrompt = promptOverride || prompt;
        
        let payload;
        try {
            payload = window.InputManager.createPayload(activePrompt, {
                type, style, palette, hexColor: customHex, variation, intent
            });
        } catch (validationErr) {
            setErrorMsg(validationErr.message);
            return;
        }

        if (attempt === 1) {
            setIsProcessing(true);
            setProcessingStatus('INITIALIZING_ENGINE...');
            setSaved(false);
            setErrorMsg('');
            setSelectedElementIds([]);
            setViewMode('create');
            setFeedbackSent(false); // Reset feedback
        } else {
            setProcessingStatus(`IMPROVING_QUALITY (ATTEMPT ${attempt})...`);
        }

        try {
            if (typeof window.orchestrateDesign !== 'function') throw new Error("AI Engine not initialized");
            
            // Expected Format: { vector: {}, score: number, warnings: [], svg: string }
            let responseData;
            try {
                responseData = await window.orchestrateDesign(payload);
            } catch (orchErr) {
                console.error("Orchestrator call failed:", orchErr);
                throw orchErr;
            }

            console.log(">> Generator received:", responseData);
            
            // Fallback for older responses or raw vector returns
            const rawVector = responseData && (responseData.vector || responseData);
            
            // Validate rawVector before processing
            if (!rawVector || typeof rawVector !== 'object') {
                throw new Error("Received invalid vector data structure");
            }

            // Filter out known false-positive warnings (e.g. Lines shouldn't strictly require fills)
            const rawWarnings = responseData.warnings || [];
            const filteredWarnings = rawWarnings.filter(w => 
                !w.includes("Element of type line has no fill")
            );

            const meta = {
                score: responseData.score,
                warnings: filteredWarnings
            };

            // --- AUTO IMPROVE LOGIC ---
            // If score is low (< 75) and we haven't retried too many times (limit 2)
            if (meta.score !== null && meta.score < 75 && attempt < 2) {
                console.log(`>> Low Score Detected (${meta.score}). Initiating Auto-Improvement...`);
                
                // Enhance prompt based on rules
                let improvementSuffix = " with more organic curves, balanced geometry, and natural forms";
                if (type === 'illustration') improvementSuffix += ", detailed flowing shapes";
                if (type === 'icon') improvementSuffix += ", clean simplified paths";

                const improvedPrompt = activePrompt + improvementSuffix;
                
                // Recursive call
                await handleGenerate(null, variation, improvedPrompt, attempt + 1);
                return; // Exit current execution to avoid setting low-quality result
            }
            // --------------------------

            let vectorData = typeof window.processVexuraOutput === 'function' ? window.processVexuraOutput(rawVector) : rawVector;
            
            // Preserve reference if it was in the vector response
            if (rawVector.reference) {
                vectorData.reference = rawVector.reference;
            }

            setResult(vectorData);
            setResultMeta(meta);
            setOriginalResult(JSON.parse(JSON.stringify(vectorData))); // Deep copy for reset
            setHistory(prev => [vectorData, ...prev].slice(0, 10));
            
            // Only deduct credit once per user action, not per retry
            if (attempt === 1 && onCreditUse) onCreditUse();

        } catch (err) {
            console.error("Generation Failed", err);
            setErrorMsg(err.message || 'Generation failed.');
        } finally {
            // Only stop processing if we are not recursing
            if (!resultMeta.score || resultMeta.score >= 75 || attempt >= 2 || errorMsg) {
                 setIsProcessing(false);
                 setProcessingStatus('');
            }
        }
    };

    const handleSave = async () => {
        if (!user) { onOpenAuth(); return; }
        if (!result) return;
        
        try {
            const svgString = JSON.stringify(result); 
            const styleInfo = { style, palette, hex: customHex };
            await apiSaveCreation(user.objectId, prompt, JSON.stringify(styleInfo), null, svgString);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            alert('Failed to save: ' + e.message);
        }
    };

    const handleRandomPrompt = () => {
        if (window.PromptData) {
            const randomP = window.PromptData.getRandomPrompt(type);
            setPrompt(randomP);
            // Trigger auto detect logic
            if (type === 'illustration' && window.InputManager && window.InputManager.detectIntent) {
                setIntent(window.InputManager.detectIntent(randomP));
            }
        }
        else setPrompt("Minimal vector icon");
    };

    const enterEditMode = () => {
        if (!user || user.plan !== 'pro') { onOpenUpgrade(); return; }
        if (!result) return;
        setViewMode('edit');
    };

    const StyleButton = ({ id, label, icon }) => (
        <button
            type="button"
            onClick={() => setStyle(id)}
            className={`flex flex-col items-center justify-center p-3 rounded-[2px] border transition-all ${style === id ? 'bg-[var(--bg-surface)] border-[var(--accent)] text-[var(--accent)] shadow-[0_0_10px_rgba(204,255,0,0.1)]' : 'border-[var(--border-dim)] text-[var(--text-dim)] hover:border-[var(--accent)] hover:text-[var(--accent)]'}`}
        >
            <div className={`mb-1.5 ${icon} w-4 h-4`}></div>
            <span className="text-[10px] font-mono uppercase tracking-wide">{label}</span>
        </button>
    );

function ExportDropdown({ svgRef, result, isPro, onOpenUpgrade }) {
    const [open, setOpen] = React.useState(false);

    const handleExport = async (type) => {
        if (!isPro) {
            onOpenUpgrade();
            return;
        }

        if (!svgRef?.current) return;

        const filename = result?.name || "vexura-export";

        try {
            switch (type) {
                case "png":
                    await window.ImageUtils.downloadSvgAsImage(
                        svgRef.current,
                        filename,
                        "png",
                        2,
                        "#ffffff"
                    );
                    break;

                case "jpeg":
                    await window.ImageUtils.downloadSvgAsImage(
                        svgRef.current,
                        filename,
                        "jpeg",
                        2,
                        "#ffffff"
                    );
                    break;

                case "svg":
                    if (window.ImageUtils.downloadSvg) {
                        window.ImageUtils.downloadSvg(svgRef.current, filename);
                    }
                    break;

                case "json":
                    if (window.ImageUtils.downloadJson) {
                        window.ImageUtils.downloadJson(result, filename);
                    }
                    break;

                case "html":
                    if (window.ImageUtils.downloadHtml) {
                        window.ImageUtils.downloadHtml(svgRef.current, filename);
                    }
                    break;

                default:
                    break;
            }
        } catch (err) {
            console.error("Export failed:", err);
        }

        setOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 hover:text-[var(--text-main)] transition-colors"
            >
                EXPORT
                <div className="icon-chevron-down w-3 h-3"></div>
            </button>

            {open && (
                <div className="absolute right-0 bottom-8 w-40 bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-[2px] shadow-lg z-50">
                    {["png", "jpeg", "svg", "json", "html"].map((type) => (
                        <button
                            key={type}
                            onClick={() => handleExport(type)}
                            className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-[var(--bg-surface)] border-b border-[var(--border-dim)] last:border-none"
                        >
                            {type.toUpperCase()}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}


    const currentStyles = STYLE_CONFIG[type];
    
    // Derived state for selection
    const singleSelectedId = selectedElementIds.length === 1 ? selectedElementIds[0] : null;
    const selectedElement = result && singleSelectedId ? result.elements.find(el => el.id === singleSelectedId) : null;

function ExportDropdown({ svgRef, result, isPro, onOpenUpgrade }) {
  const [open, setOpen] = React.useState(false);

  const handleExport = async (type) => {
    if (!isPro) {
      onOpenUpgrade();
      return;
    }

    const filename = result.name || "vexura-export";

    switch (type) {
      case "png":
        await window.ImageUtils.downloadSvgAsImage(
          svgRef.current,
          filename,
          "png",
          2,
          "#ffffff"
        );
        break;

      case "jpeg":
        await window.ImageUtils.downloadSvgAsImage(
          svgRef.current,
          filename,
          "jpeg",
          2,
          "#ffffff"
        );
        break;

      case "svg":
        window.ImageUtils.downloadSvg(svgRef.current, filename);
        break;

      case "json":
        window.ImageUtils.downloadJson(result, filename);
        break;

      case "html":
        window.ImageUtils.downloadHtml(svgRef.current, filename);
        break;

      default:
        break;
    }

    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-secondary text-xs"
      >
        EXPORT
        <div className="icon-chevron-down w-3 h-3"></div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-[2px] shadow-lg z-50">
          {["png", "jpeg", "svg", "json", "html"].map((type) => (
            <button
              key={type}
              onClick={() => handleExport(type)}
              className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-[var(--bg-surface)] border-b border-[var(--border-dim)] last:border-none"
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


    return (
        <div className="flex flex-col md:flex-row md:h-[calc(100vh-56px)] md:overflow-hidden bg-[var(--bg-body)]">
            
            {/* Left Sidebar - Switches content based on View Mode */}
            <div className="w-full md:w-[320px] shrink-0 border-r border-[var(--border-dim)] flex flex-col h-auto md:h-full bg-[var(--bg-panel)] z-10 transition-all duration-300">
                
                {viewMode === 'create' ? (
                    // --- CREATE MODE SIDEBAR ---
                    <div className="p-4 bg-[var(--bg-surface)] md:overflow-y-auto custom-scrollbar flex-1 animate-in slide-in-from-left-2 fade-in">
                         {/* Input Mode Toggles */}
                         <div className="flex p-1 bg-[var(--bg-body)] rounded-[2px] border border-[var(--border-dim)] mb-6">
                             <button
                                 onClick={() => setInputMode('ai')}
                                 className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono font-bold rounded-[1px] transition-all ${inputMode === 'ai' ? 'bg-[var(--bg-surface)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'}`}
                             >
                                 <div className="icon-sparkles w-3 h-3"></div>
                                 AI GENERATE
                             </button>
                             <button
                                 onClick={() => setInputMode('upload')}
                                 className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono font-bold rounded-[1px] transition-all ${inputMode === 'upload' ? 'bg-[var(--bg-surface)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'}`}
                             >
                                 <div className="icon-upload w-3 h-3"></div>
                                 UPLOAD
                             </button>
                         </div>

                         {inputMode === 'ai' ? (
                             <form onSubmit={(e) => handleGenerate(e)} className="flex flex-col gap-6">
                                <div className="space-y-3">
                                    <label className="label-text">Select Type</label>
                                    <div className="flex gap-2">
                                        <button 
                                            type="button" 
                                            onClick={() => handleTypeChange('icon')} 
                                            className={`flex-1 flex flex-col items-center justify-center p-3 rounded-[2px] border transition-all ${type === 'icon' ? 'bg-[var(--bg-surface)] border-[var(--accent)] text-[var(--accent)] shadow-sm' : 'border-[var(--border-dim)] text-[var(--text-dim)] hover:border-[var(--text-muted)] bg-[var(--bg-body)]'}`}
                                        >
                                            <div className="icon-component w-5 h-5 mb-2"></div>
                                            <span className="text-xs font-mono font-bold">ICON</span>
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => handleTypeChange('illustration')} 
                                            className={`flex-1 flex flex-col items-center justify-center p-3 rounded-[2px] border transition-all ${type === 'illustration' ? 'bg-[var(--bg-surface)] border-[var(--accent)] text-[var(--accent)] shadow-sm' : 'border-[var(--border-dim)] text-[var(--text-dim)] hover:border-[var(--text-muted)] bg-[var(--bg-body)]'}`}
                                        >
                                            <div className="icon-image w-5 h-5 mb-2"></div>
                                            <span className="text-xs font-mono font-bold">ILLUSTRATION</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Intent Selector (Only for Illustration) */}
                                {type === 'illustration' && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                                        <label className="label-text flex items-center justify-between">
                                            Illustration Intent
                                            <span className="text-[9px] text-[var(--text-dim)] lowercase bg-[var(--bg-body)] px-1 rounded border border-[var(--border-dim)]">auto-detect</span>
                                        </label>
                                        <div className="flex flex-col gap-2">
                                            <button 
                                                type="button"
                                                onClick={() => setIntent('ui')}
                                                className={`flex items-center gap-3 p-2 rounded-[2px] border transition-all text-left ${intent === 'ui' ? 'bg-[var(--bg-body)] border-[var(--accent)] text-[var(--text-main)]' : 'bg-[var(--bg-body)] border-[var(--border-dim)] text-[var(--text-dim)] hover:border-[var(--text-muted)]'}`}
                                            >
                                                <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${intent === 'ui' ? 'border-[var(--accent)]' : 'border-[var(--border-dim)]'}`}>
                                                    {intent === 'ui' && <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full"></div>}
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold font-mono">UI / PRODUCT</div>
                                                    <div className="text-[9px] opacity-60">Clean SaaS interfaces, buttons, cards</div>
                                                </div>
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setIntent('diagram')}
                                                className={`flex items-center gap-3 p-2 rounded-[2px] border transition-all text-left ${intent === 'diagram' ? 'bg-[var(--bg-body)] border-[var(--accent)] text-[var(--text-main)]' : 'bg-[var(--bg-body)] border-[var(--border-dim)] text-[var(--text-dim)] hover:border-[var(--text-muted)]'}`}
                                            >
                                                <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${intent === 'diagram' ? 'border-[var(--accent)]' : 'border-[var(--border-dim)]'}`}>
                                                    {intent === 'diagram' && <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full"></div>}
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold font-mono">DIAGRAM / SYSTEM</div>
                                                    <div className="text-[9px] opacity-60">Networks, flows, structures</div>
                                                </div>
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setIntent('abstract')}
                                                className={`flex items-center gap-3 p-2 rounded-[2px] border transition-all text-left ${intent === 'abstract' ? 'bg-[var(--bg-body)] border-[var(--accent)] text-[var(--text-main)]' : 'bg-[var(--bg-body)] border-[var(--border-dim)] text-[var(--text-dim)] hover:border-[var(--text-muted)]'}`}
                                            >
                                                <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${intent === 'abstract' ? 'border-[var(--accent)]' : 'border-[var(--border-dim)]'}`}>
                                                    {intent === 'abstract' && <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full"></div>}
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold font-mono">CONCEPTUAL / ABSTRACT</div>
                                                    <div className="text-[9px] opacity-60">Ideas, metaphors, branding</div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                     <div className="flex justify-between items-center">
                                        <label className="label-text">Describe It</label>
                                        <button type="button" onClick={handleRandomPrompt} className="text-[10px] text-[var(--accent)] hover:underline flex items-center gap-1">
                                            <div className="icon-dices w-3 h-3"></div>
                                            RANDOM
                                        </button>
                                    </div>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder={`Describe your ${type}... e.g. "Space rocket launching"`}
                                        className="input-field min-h-[100px] resize-none text-base"
                                        disabled={isProcessing}
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-primary w-full py-4 text-base font-bold shadow-[0_0_15px_rgba(204,255,0,0.1)] relative overflow-hidden"
                                    disabled={isProcessing || !prompt.trim()}
                                >
                                    {isProcessing && (
                                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                            <div className="w-full h-1 bg-[var(--accent-dim)] absolute bottom-0 left-0 animate-[shimmer_1.5s_infinite]"></div>
                                        </div>
                                    )}
                                    {isProcessing ? (processingStatus || 'GENERATING...') : 'GENERATE VECTOR'}
                                </button>

                                <div className="pt-4 border-t border-[var(--border-dim)]">
                                    <button 
                                        type="button"
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        className="flex items-center justify-between w-full text-xs font-mono text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
                                    >
                                        <span className="flex items-center gap-2">
                                            <div className="icon-sliders-horizontal w-3 h-3"></div>
                                            ADVANCED SETTINGS
                                        </span>
                                        <div className={`icon-chevron-down w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}></div>
                                    </button>
                                    {showAdvanced && (
                                        <div className="mt-4 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="space-y-2">
                                                <label className="label-text">Visual Style</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {currentStyles.map(s => (
                                                        <StyleButton key={s.id} id={s.id} label={s.label} icon={s.icon} />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2 relative">
                                                <div className="flex items-center justify-between">
                                                    <label className="label-text">Color Palette</label>
                                                    {user?.plan !== 'pro' && (
                                                        <button type="button" onClick={onOpenUpgrade} className="flex items-center gap-1 text-[9px] font-bold text-[var(--accent)] hover:underline">
                                                            <div className="icon-lock w-3 h-3"></div>
                                                            UNLOCK PRO
                                                        </button>
                                                    )}
                                                </div>
                                                <div className={`grid grid-cols-3 gap-2 ${user?.plan !== 'pro' ? 'opacity-50 pointer-events-none' : ''}`}>
                                                    {[
                                                        { id: 'auto', label: 'Auto', bg: 'bg-gradient-to-br from-gray-700 to-gray-500' },
                                                        { id: 'monochrome', label: 'Mono', bg: 'bg-zinc-500' },
                                                        { id: 'warm', label: 'Warm', bg: 'bg-orange-500' },
                                                        { id: 'cool', label: 'Cool', bg: 'bg-blue-500' },
                                                        { id: 'pastel', label: 'Pastel', bg: 'bg-pink-300' },
                                                        { id: 'vibrant', label: 'Vibrant', bg: 'bg-purple-600' },
                                                    ].map(p => (
                                                        <button key={p.id} type="button" onClick={() => setPalette(p.id)} className={`flex items-center gap-2 p-2 rounded-[2px] border transition-all ${palette === p.id ? 'bg-[var(--bg-surface)] border-[var(--accent)] text-[var(--text-main)] shadow-sm' : 'border-[var(--border-dim)] text-[var(--text-dim)] hover:border-[var(--text-muted)]'}`}>
                                                            <div className={`w-3 h-3 rounded-full ${p.bg}`}></div>
                                                            <span className="text-[9px] font-mono uppercase">{p.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {errorMsg && <div className="text-[10px] text-red-500 font-mono mt-1 p-2 bg-red-900/10 border border-red-900/30 rounded-[2px] break-words">! {errorMsg}</div>}
                            </form>
                         ) : (
                             // --- UPLOAD MODE ---
                             <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-1">
                                 <div className="space-y-2">
                                     <h3 className="text-sm font-bold font-mono text-[var(--text-main)]">Smart Vectorization</h3>
                                     <p className="text-xs text-[var(--text-muted)]">
                                         Convert raster images (PNG, JPG) into editable, color-separated SVG layers.
                                     </p>
                                 </div>

                                 {/* Config Panel */}
                                 <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-mono text-[var(--text-dim)] uppercase">Mode</label>
                                        <select 
                                            value={vectorConfig.mode}
                                            onChange={(e) => setVectorConfig({...vectorConfig, mode: e.target.value})}
                                            className="w-full bg-[var(--bg-body)] border border-[var(--border-dim)] rounded-[2px] text-[10px] px-2 py-1 text-[var(--text-main)]"
                                        >
                                            <option value="icon">Icon (Simple)</option>
                                            <option value="element">Element</option>
                                            <option value="shape">Shape (Detail)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-mono text-[var(--text-dim)] uppercase">Style</label>
                                        <select 
                                            value={vectorConfig.style}
                                            onChange={(e) => setVectorConfig({...vectorConfig, style: e.target.value})}
                                            className="w-full bg-[var(--bg-body)] border border-[var(--border-dim)] rounded-[2px] text-[10px] px-2 py-1 text-[var(--text-main)]"
                                        >
                                            <option value="minimal">Minimal</option>
                                            <option value="organic">Organic</option>
                                            <option value="exact">Exact</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-mono text-[var(--text-dim)] uppercase">Colors</label>
                                        <select 
                                            value={vectorConfig.colors}
                                            onChange={(e) => setVectorConfig({...vectorConfig, colors: e.target.value})}
                                            className="w-full bg-[var(--bg-body)] border border-[var(--border-dim)] rounded-[2px] text-[10px] px-2 py-1 text-[var(--text-main)]"
                                        >
                                            <option value="bw">B&W</option>
                                            <option value="low">Low (4)</option>
                                            <option value="medium">Med (8)</option>
                                            <option value="high">High (16)</option>
                                        </select>
                                    </div>
                                 </div>

                                 <div className="border-2 border-dashed border-[var(--border-dim)] rounded-[2px] p-8 flex flex-col items-center justify-center text-center gap-4 hover:border-[var(--accent)] transition-colors group relative">
                                     <div className="w-12 h-12 rounded-full bg-[var(--bg-body)] flex items-center justify-center group-hover:scale-110 transition-transform">
                                         <div className="icon-cloud-upload w-6 h-6 text-[var(--text-dim)] group-hover:text-[var(--accent)]"></div>
                                     </div>
                                     <div>
                                         <p className="text-sm font-bold text-[var(--text-main)] mb-1">Upload Image</p>
                                         <p className="text-[10px] text-[var(--text-dim)]">PNG, JPG up to 2MB</p>
                                     </div>
                                     <input 
                                         ref={fileInputRef}
                                         type="file" 
                                         accept="image/png,image/jpeg,image/webp" 
                                         className="absolute inset-0 opacity-0 cursor-pointer"
                                         onChange={handleFileUpload}
                                         disabled={isProcessing}
                                     />
                                 </div>

                                 {errorMsg && (
                                     <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-[2px] flex items-center gap-2">
                                         <div className="icon-circle-alert w-4 h-4 shrink-0"></div>
                                         {errorMsg}
                                     </div>
                                 )}
                             </div>
                         )}
                    </div>
                ) : (
                    // --- EDIT MODE SIDEBAR (LAYERS) ---
                    <div className="flex flex-col h-full bg-[var(--bg-panel)] animate-in slide-in-from-left-2 fade-in">
                        <div className="p-3 border-b border-[var(--border-dim)] bg-[var(--bg-surface)] flex items-center justify-between">
                            <h3 className="text-xs font-mono font-bold text-[var(--text-main)] uppercase">Layers</h3>
                            <button onClick={() => setViewMode('create')} className="text-[10px] text-[var(--text-dim)] hover:text-[var(--accent)] font-mono flex items-center gap-1">
                                <div className="icon-arrow-left w-3 h-3"></div> DONE
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {result && result.elements.slice().reverse().map((el, index) => {
                                const realIndex = result.elements.length - 1 - index; // Reverse index for display
                                const isSel = selectedElementIds.includes(el.id);
                                return (
                                    <div 
                                        key={el.id || index}
                                        onClick={(e) => {
                                            if (e.shiftKey) {
                                                // Multi-select toggle
                                                setSelectedElementIds(prev => 
                                                    prev.includes(el.id) ? prev.filter(id => id !== el.id) : [...prev, el.id]
                                                );
                                            } else {
                                                setSelectedElementIds([el.id]);
                                            }
                                        }}
                                        className={`flex items-center justify-between p-2 rounded-[2px] cursor-pointer border transition-all ${isSel ? 'bg-[var(--bg-surface)] border-[var(--accent)]' : 'border-transparent hover:bg-[var(--bg-body)] hover:border-[var(--border-dim)]'}`}
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className={`w-1 h-8 rounded-full shrink-0 ${isSel ? 'bg-[var(--accent)]' : 'bg-[var(--border-dim)]'}`}></div>
                                            <div className="flex flex-col truncate">
                                                <span className={`text-[10px] font-mono font-bold uppercase ${isSel ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>
                                                    {el.type} {realIndex + 1}
                                                </span>
                                                <span className="text-[9px] text-[var(--text-dim)] truncate">ID: {el.id?.slice(-4)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {/* Preview Dot */}
                                            <div className="w-3 h-3 border border-[var(--border-dim)] rounded-[1px]" style={{backgroundColor: el.fill !== 'none' ? el.fill : 'transparent'}}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-2 border-t border-[var(--border-dim)]">
                            <button onClick={handleReset} className="btn btn-secondary w-full text-xs py-2">
                                <div className="icon-rotate-ccw w-3 h-3"></div>
                                RESET CHANGES
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-auto md:h-full md:overflow-hidden relative" ref={canvasRef}>
                <div className="flex-1 p-4 md:p-8 bg-[var(--bg-body)] overflow-auto flex flex-col min-h-[500px] md:min-h-0 relative">
                     
                     {/* Top Action Bar */}
                     {result && !isProcessing && viewMode === 'create' && (
                        <div className="mb-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                             {/* Feedback UI (Only show for AI generated) */}
                             {!feedbackSent && result.source !== 'upload' && (
                                 <div className="flex items-center justify-center gap-2 py-2 bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-[2px] w-fit mx-auto shadow-sm">
                                     <span className="text-[10px] font-mono text-[var(--text-dim)] px-2">RATE_RESULT:</span>
                                     <button onClick={() => handleFeedback('good')} className="p-1 hover:text-green-500 transition-colors" title="Good result"><div className="icon-thumbs-up w-4 h-4"></div></button>
                                     <div className="w-px h-3 bg-[var(--border-dim)]"></div>
                                     <button onClick={() => handleFeedback('too_abstract')} className="p-1 hover:text-red-400 transition-colors" title="Too Abstract"><div className="icon-help-circle w-4 h-4"></div></button>
                                     <button onClick={() => handleFeedback('wrong_style')} className="p-1 hover:text-red-400 transition-colors" title="Wrong Style"><div className="icon-brush w-4 h-4"></div></button>
                                 </div>
                             )}
                             {feedbackSent && (
                                 <div className="text-center text-[10px] text-green-500 font-mono py-2">FEEDBACK_LOGGED</div>
                             )}

<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    
  {/* LEFT SIDE */}
  <div className="flex items-center gap-2 w-full sm:w-auto">
    <button 
      onClick={enterEditMode}
      className="btn btn-primary btn-primary-animate shadow-[0_0_15px_rgba(204,255,0,0.2)] text-black font-bold px-4 py-2 w-full sm:w-auto justify-center"
    >
      <div className="icon-edit-3 w-4 h-4"></div>
      <span className="text-xs sm:text-sm">ENTER EDIT MODE</span>
    </button>
  </div>

  {/* RIGHT SIDE */}
  <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">

    {result.source !== 'upload' && (
      <button 
        onClick={handleSmartRetry} 
        className="btn btn-secondary text-[10px] sm:text-xs py-2 px-3 h-[32px]"
      >
        SMART RETRY
      </button>
    )}

    <button 
      onClick={() => handleGenerate(null, 'simpler')} 
      className="btn btn-secondary text-[10px] sm:text-xs py-2 px-3 h-[32px]"
      disabled={result.source === 'upload'}
    >
      SIMPLER
    </button>

    <button 
      onClick={() => handleGenerate(null, 'detailed')} 
      className="btn btn-secondary text-[10px] sm:text-xs py-2 px-3 h-[32px]"
      disabled={result.source === 'upload'}
    >
      DETAILED
    </button>

    {/* SAVE BUTTON */}
    <button 
      onClick={handleSave}
      disabled={saved}
      className={`flex items-center gap-1 text-xs hover:text-[var(--text-main)] transition-colors ${saved ? 'text-green-500' : ''}`}
    >
      <div className={`w-2 h-2 rounded-full ${saved ? 'bg-green-500' : 'bg-[var(--border-mid)]'}`}></div>
      {saved ? 'SAVED' : (user ? 'SAVE' : 'LOGIN_TO_SAVE')}
    </button>

    {/* EXPORT DROPDOWN */}
    <ExportDropdown
      svgRef={previewSvgRef}
      result={result}
      isPro={user?.plan === "pro" || window.__DEV_PRO__}
      onOpenUpgrade={onOpenUpgrade}
    />

  </div>
</div>

                     )}

                     {viewMode === 'edit' && (
                         <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 animate-in fade-in">
                            <div className="flex items-center gap-2 text-[var(--accent)] bg-[var(--bg-panel)] px-2 py-1.5 sm:px-3 rounded-[2px] border border-[var(--accent)] w-full sm:w-auto justify-center sm:justify-start">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[var(--accent)] animate-pulse"></div>
                                <span className="text-[10px] sm:text-xs font-mono font-bold">EDITING ACTIVE</span>
                            </div>
                            <div className="text-[9px] sm:text-[10px] font-mono text-[var(--text-muted)] w-full text-center sm:w-auto sm:text-right">
                                DRAG TO MOVE • CLICK+DRAG BG TO SELECT
                            </div>
                        </div>
                     )}

                     <PreviewCanvas 
                        data={result} 
                        loading={isProcessing} 
                        selectedIds={selectedElementIds}
                        setSelectedIds={setSelectedElementIds}
                        isPro={user?.plan === 'pro'}
                        onOpenUpgrade={onOpenUpgrade}
                        viewMode={viewMode}
                        onBatchUpdate={handleBatchUpdate}
                        animationConfig={animationConfig}
                        forwardedSvgRef={previewSvgRef}
                     />
                     
                     {/* Floating Editor Panel - Only in Edit Mode & Single Selection */}
                     {selectedElement && viewMode === 'edit' && selectedElementIds.length === 1 && (
                        <EditorPanel 
                            selection={{ element: selectedElement, type: selectedElement.type }}
                            onChange={handleElementUpdate}
                            onDuplicate={() => handleDuplicate(selectedElement.id)}
                            onDelete={() => handleDelete(selectedElementIds)}
                            onReorder={(dir) => handleReorder(selectedElement.id, dir)}
                            onClose={() => setSelectedElementIds([])}
                        />
                     )}

                     {/* Multi-select Actions Panel */}
                     {viewMode === 'edit' && selectedElementIds.length > 1 && (
                         <div className="absolute top-4 right-4 z-20 w-64 bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-[2px] shadow-2xl p-4 animate-in slide-in-from-right-2 fade-in">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border-dim)]">
                                <span className="text-xs font-mono font-bold text-[var(--text-main)]">{selectedElementIds.length} ITEMS SELECTED</span>
                                <button onClick={() => setSelectedElementIds([])} className="icon-x w-3 h-3 text-[var(--text-dim)]"></button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => handleDelete(selectedElementIds)} className="btn btn-secondary text-xs text-red-400 hover:text-red-500 hover:border-red-500">
                                    <div className="icon-trash w-3 h-3"></div> DELETE ALL
                                </button>
                                {/* Future: Align tools? */}
                            </div>
                         </div>
                     )}
                </div>
                
                {/* Session History */}
                {history.length > 0 && (
                    <div className="h-16 border-t border-[var(--border-dim)] bg-[var(--bg-panel)] flex items-center px-4 gap-2 overflow-x-auto shrink-0 custom-scrollbar">
                        <span className="text-[10px] font-mono text-[var(--text-dim)] mr-2 shrink-0">HISTORY:</span>
                        {history.map((item, idx) => (
                            <HistoryThumb 
                                key={item.id || idx} 
                                data={item} 
                                isActive={result && result === item}
                                onClick={() => setResult(item)}
                            />
                        ))}
                    </div>
                )}
                
{/* Footer */}
                <div className="border-t border-[var(--border-dim)] bg-[var(--bg-surface)] px-4 py-2 text-[10px] font-mono text-[var(--text-dim)] shrink-0">
                    <div className="flex items-center justify-between">
                        <span>STATUS: {isProcessing ? 'BUSY' : (viewMode === 'edit' ? 'EDITING' : 'READY')}</span>
                        {result && <span>NODES: {result.elements ? result.elements.length : 0}</span>}
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Info/Control Panel */}
            <div className="hidden md:block w-[280px] shrink-0 border-l border-[var(--border-dim)] bg-[var(--bg-panel)] z-10">
                <ControlPanel 
                    data={result} 
                    isProcessing={isProcessing} 
                    meta={resultMeta}
                    onAnimationToggle={handleAnimationToggle}
                    isAnimating={isAnimating}
                    onExportAnimation={handleExportAnimation}
                    isPro={user?.plan === 'pro'}
                    onOpenUpgrade={onOpenUpgrade}
                />
            </div>

        </div>
    );
}
