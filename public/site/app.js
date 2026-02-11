// Important: DO NOT remove this `ErrorBoundary` component.
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
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-black"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [user, setUser] = React.useState(null);
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);

  React.useEffect(() => {
      const stored = localStorage.getItem('vector_user');
      if (stored) setUser(JSON.parse(stored));

      // Check for Redirect Login Result (Firebase)
      if (window.fireAuth && window.fireAuth.checkRedirectResult) {
          window.fireAuth.checkRedirectResult().then(async (googleUser) => {
              if (googleUser) {
                  // If we got a user from redirect, process the login
                  try {
                      const user = await apiLoginWithGoogle(
                          googleUser.uid, 
                          googleUser.email, 
                          googleUser.displayName
                      );
                      handleLogin(user);
                  } catch (e) {
                      console.error("Redirect Login processing failed:", e);
                  }
              }
          });
      }
  }, []);

  const handleLogin = (userData) => {
      setUser(userData);
      localStorage.setItem('vector_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('vector_user');
  };

  try {
    return (
      <div className="min-h-screen flex flex-col" data-name="app" data-file="app.js">
        <Header user={user} onOpenAuth={() => setIsAuthOpen(true)} onLogout={handleLogout} />
        <main className="flex-1">
            <Generator user={user} onOpenAuth={() => setIsAuthOpen(true)} />
        </main>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={handleLogin} />
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);