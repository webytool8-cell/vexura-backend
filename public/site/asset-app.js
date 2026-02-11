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

function AssetApp() {
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
                <AssetDetailView user={user} onOpenAuth={() => setIsAuthOpen(true)} />
            </main>
            <Footer />
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={handleLogin} />
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ErrorBoundary><AssetApp /></ErrorBoundary>);