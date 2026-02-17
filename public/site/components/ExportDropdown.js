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
