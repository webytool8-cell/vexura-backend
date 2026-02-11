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

function ToolApp() {
  const [user, setUser] = React.useState(null);
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = React.useState(false);

  // Initialize User State (Simulating Backend Data)
  React.useEffect(() => {
      const stored = localStorage.getItem('vector_user');
      if (stored) {
          const parsedUser = JSON.parse(stored);
          // Ensure plan/credits exist (Migration for existing users)
          if (!parsedUser.plan) parsedUser.plan = 'free';
          if (parsedUser.credits === undefined) parsedUser.credits = 10;
          
          // Reset credits if it's a new day (Simulation)
          const lastReset = parsedUser.lastReset || 0;
          const now = Date.now();
          if (now - lastReset > 24 * 60 * 60 * 1000) {
              parsedUser.credits = 10;
              parsedUser.lastReset = now;
          }
          
          setUser(parsedUser);
          localStorage.setItem('vector_user', JSON.stringify(parsedUser));
      }

      // Check for Redirect Login Result
      if (window.fireAuth && window.fireAuth.checkRedirectResult) {
          window.fireAuth.checkRedirectResult().then(async (googleUser) => {
              if (googleUser) {
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
      
      // Listen for upgrade triggers from children
      const handleUpgradeEvent = () => setIsUpgradeOpen(true);
      window.addEventListener('vexura:open-upgrade', handleUpgradeEvent);
      
      // Check for URL param upgrade=true (trigger modal) or upgrade=success (payment done)
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('upgrade') === 'true') {
          setIsUpgradeOpen(true);
      } else if (urlParams.get('upgrade') === 'success') {
          // Handle successful payment redirect
          const handleSuccess = async () => {
             // In a real app, we might verify session_id with backend here
             // For now, we assume success from Stripe redirect
             if (user) {
                 const upgradedUser = { ...user, plan: 'pro' };
                 setUser(upgradedUser);
                 localStorage.setItem('vector_user', JSON.stringify(upgradedUser));
                 alert("Payment Successful! Welcome to VEXURA Pro.");
                 // Clean URL
                 window.history.replaceState({}, document.title, window.location.pathname);
             }
          };
          // Need to wait for user load if not ready, but effect runs after load
          if (user) handleSuccess();
          // If user isn't loaded yet, we can rely on the user check inside the effect deps if we added it, 
          // or just simple check here since user load is sync from localStorage in this mockup.
      }

      return () => window.removeEventListener('vexura:open-upgrade', handleUpgradeEvent);
  }, []);

  const handleLogin = (userData) => {
      // Initialize new user defaults
      const fullData = {
          ...userData,
          plan: 'free',
          credits: 10,
          lastReset: Date.now()
      };
      setUser(fullData);
      localStorage.setItem('vector_user', JSON.stringify(fullData));
  };

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('vector_user');
  };
  
  const handleUpgradeSuccess = () => {
      if (!user) return;
      
      const upgradedUser = { ...user, plan: 'pro' };
      setUser(upgradedUser);
      localStorage.setItem('vector_user', JSON.stringify(upgradedUser));
      
      // Notify user
      alert("Welcome to VEXURA Pro! Unlimited access unlocked.");
  };
  
  const handleCreditUse = () => {
      if (!user) return;
      if (user.plan === 'pro') return; // Pro users don't use credits
      
      const newCredits = Math.max(0, user.credits - 1);
      const updatedUser = { ...user, credits: newCredits };
      setUser(updatedUser);
      localStorage.setItem('vector_user', JSON.stringify(updatedUser));
  };

  try {
    return (
      <div className="min-h-screen flex flex-col" data-name="tool-app" data-file="tool-app.js">
        <Header user={user} onOpenAuth={() => setIsAuthOpen(true)} onLogout={handleLogout} />
        <main className="flex-1 flex flex-col" id="main-content">
            <Generator 
                user={user} 
                onOpenAuth={() => setIsAuthOpen(true)} 
                onOpenUpgrade={() => setIsUpgradeOpen(true)}
                onCreditUse={handleCreditUse}
            />
        </main>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={handleLogin} />
        <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} onUpgrade={handleUpgradeSuccess} />
      </div>
    );
  } catch (error) {
    console.error('ToolApp component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <ToolApp />
  </ErrorBoundary>
);