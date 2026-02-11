class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error(error, errorInfo); }
  render() {
    if (this.state.hasError) return <div className="p-8 text-center text-red-500">Something went wrong.</div>;
    return this.props.children;
  }
}

function MarketplaceApp() {
    const [user, setUser] = React.useState(null);
    const [isAuthOpen, setIsAuthOpen] = React.useState(false);

    React.useEffect(() => {
        const stored = localStorage.getItem('vector_user');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('vector_user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('vector_user');
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header user={user} onOpenAuth={() => setIsAuthOpen(true)} onLogout={handleLogout} />
            <main className="flex-1">
                <div className="bg-[var(--bg-panel)] border-b border-[var(--border-dim)] py-12 md:py-20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent)] opacity-[0.05] blur-[120px] pointer-events-none"></div>
                    <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                        <span className="text-[var(--accent)] font-mono text-xs font-bold uppercase tracking-widest mb-4 block animate-in fade-in slide-in-from-bottom-2">VEXURA MARKETPLACE</span>
                        <h1 className="text-4xl md:text-6xl font-bold font-mono text-[var(--text-main)] mb-6 uppercase tracking-tight">
                            Vector Assets<br/>For Builders
                        </h1>
                        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-8">
                            Curated collection of SVG icons, gradients, and shapes. Production-ready and optimized for modern interfaces.
                        </p>
                    </div>
                </div>
                
                <AssetGrid />
            </main>
            <Footer />
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={handleLogin} />
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ErrorBoundary><MarketplaceApp /></ErrorBoundary>);