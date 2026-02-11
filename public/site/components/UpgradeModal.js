function UpgradeModal({ isOpen, onClose, onUpgrade }) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    
    // REPLACE WITH YOUR ACTUAL STRIPE PRICE ID
    // For testing with Vexura mock backend, this ID is passed to the backend 
    // which then creates the session.
    const PRICE_ID = 'price_1SuMlkQnCSq64o0ct5yHX91f'; 

    if (!isOpen) return null;

    const handleUpgrade = async () => {
        setLoading(true);
        setError('');
        
        try {
            // Using the proxy API to call the Vercel backend
            const response = await fetch(window.VexuraAPI ? window.VexuraAPI.checkoutUrl() : 'https://vexura-backend-aces-projects-a13cbb83.vercel.app/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId: PRICE_ID,
                    successUrl: window.location.href + (window.location.search ? '&' : '?') + 'upgrade=success',
                    cancelUrl: window.location.href
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Checkout initialization failed');
            }

            const data = await response.json();
            
            if (data.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }

        } catch (err) {
            console.error("Checkout Error:", err);
            setError(err.message || "Failed to start checkout. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-mono">
            <div className="panel max-w-md w-full shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="p-6 border-b border-[var(--border-dim)] flex items-center justify-between bg-[var(--bg-surface)]">
                    <div>
                        <h2 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
                            <div className="icon-crown text-[var(--accent)]"></div>
                            Upgrade to Pro
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-[var(--text-dim)] hover:text-[var(--text-main)]">
                        <div className="icon-x w-5 h-5"></div>
                    </button>
                </div>
                
                <div className="p-6">
                    {/* Hero Area */}
                    <div className="flex items-center gap-4 mb-6 p-4 bg-[var(--bg-body)] border border-[var(--accent)] rounded-[2px] relative overflow-hidden">
                        <div className="absolute inset-0 bg-[var(--accent)] opacity-5"></div>
                        <div className="w-12 h-12 bg-[var(--accent)] text-black rounded-[2px] flex items-center justify-center shrink-0 shadow-lg">
                            <div className="icon-sparkles w-6 h-6"></div>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-[var(--text-main)]">UNLIMITED ACCESS</div>
                            <div className="text-xs text-[var(--text-muted)]">Unlock the full power of VEXURA AI</div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                            <div className="icon-check w-4 h-4 text-[var(--accent)] shrink-0"></div>
                            <span>Unlimited Generations (No daily limits)</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                            <div className="icon-check w-4 h-4 text-[var(--accent)] shrink-0"></div>
                            <span>Advanced Vector Editor Access</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                            <div className="icon-check w-4 h-4 text-[var(--accent)] shrink-0"></div>
                            <span>Commercial License Included</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                            <div className="icon-check w-4 h-4 text-[var(--accent)] shrink-0"></div>
                            <span>Priority Fast-Track Processing</span>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 border border-red-500/20 bg-red-500/5 text-red-400 text-xs flex items-center gap-2 rounded-[2px]">
                            <div className="icon-circle-alert w-4 h-4 shrink-0"></div>
                            {error}
                        </div>
                    )}

                    <button 
                        onClick={handleUpgrade} 
                        disabled={loading}
                        className="btn btn-primary btn-primary-animate w-full py-4 text-base font-bold shadow-[0_0_15px_rgba(204,255,0,0.1)] relative overflow-hidden group"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                REDIRECTING...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                UPGRADE NOW <span className="opacity-50 mx-1">|</span> $24.99/mo
                                <div className="icon-arrow-right w-4 h-4 group-hover:translate-x-1 transition-transform"></div>
                            </span>
                        )}
                    </button>
                    
                    <p className="text-center text-[10px] text-[var(--text-dim)] mt-4">
                        Secured by Stripe. Cancel anytime.
                    </p>
                </div>
            </div>
        </div>
    );
}