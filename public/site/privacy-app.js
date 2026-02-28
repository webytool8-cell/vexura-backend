class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <button onClick={() => window.location.reload()} className="btn btn-black">Reload Page</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function PrivacyApp() {
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
    <div className="min-h-screen flex flex-col">
      <Header user={user} onOpenAuth={() => setIsAuthOpen(true)} onLogout={handleLogout} />
      <main className="flex-1">
          <PrivacyView />
      </main>
      <Footer />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={handleLogin} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <PrivacyApp />
  </ErrorBoundary>
);
