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

function ProfileView() {
    const [currentUser, setCurrentUser] = React.useState(null);
    const [targetUser, setTargetUser] = React.useState(null);
    const [creations, setCreations] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [isAuthOpen, setIsAuthOpen] = React.useState(false);
    const [deletingId, setDeletingId] = React.useState(null);

    const avatars = [
        'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 
        'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
        'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 
        'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500', 'bg-slate-500'
    ];

    React.useEffect(() => {
        const init = async () => {
            try {
                const storedUser = localStorage.getItem('vector_user');
                let loggedInUser = null;
                if (storedUser) {
                    loggedInUser = JSON.parse(storedUser);
                    setCurrentUser(loggedInUser);
                }

                const urlParams = new URLSearchParams(window.location.search);
                const usernameParam = urlParams.get('user');

                if (usernameParam) {
                    const user = await apiLogin(usernameParam);
                    if (user) {
                        setTargetUser(user);
                        const userCreations = await apiGetUserCreations(user.objectId);
                        setCreations(userCreations);
                    }
                } else if (loggedInUser) {
                    setTargetUser(loggedInUser);
                    const userCreations = await apiGetUserCreations(loggedInUser.objectId);
                    setCreations(userCreations);
                    window.history.replaceState(null, '', `?user=${loggedInUser.objectData.username}`);
                }
            } catch (err) {
                console.error("Profile Load Error:", err);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    const handleLoginSuccess = (user) => {
        localStorage.setItem('vector_user', JSON.stringify(user));
        setCurrentUser(user);
        if (!targetUser) {
            window.location.href = `profile.html?user=${user.objectData.username}`;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('vector_user');
        setCurrentUser(null);
        window.location.href = 'index.html';
    };

    const handleDelete = async (creationId, e) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this icon?')) return;
        
        setDeletingId(creationId);
        try {
            await trickleDeleteObject('vector_creations', creationId);
            setCreations(prev => prev.filter(c => c.objectId !== creationId));
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete item.');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-body)]">
                <div className="animate-spin h-8 w-8 border-2 border-[var(--accent)] border-t-transparent"></div>
            </div>
        );
    }

    if (!targetUser) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header user={currentUser} onOpenAuth={() => setIsAuthOpen(true)} onLogout={handleLogout} />
                <main className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="text-center max-w-md">
                        <div className="bg-[var(--bg-panel)] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--text-dim)]">
                            <div className="icon-user-x w-10 h-10"></div>
                        </div>
                        <h1 className="text-xl font-bold text-[var(--text-main)] mb-2 uppercase tracking-wide">User Not Found</h1>
                        <p className="text-[var(--text-muted)] mb-8 font-mono text-sm">Profile does not exist or was removed.</p>
                        <a href="index.html" className="btn btn-primary">LAUNCH_GENERATOR</a>
                    </div>
                </main>
                <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={handleLoginSuccess} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg-body)]">
            <Header user={currentUser} onOpenAuth={() => setIsAuthOpen(true)} onLogout={handleLogout} />
            
            <main className="flex-1">
                {/* Profile Header */}
                <div className="bg-[var(--bg-panel)] border-b border-[var(--border-dim)]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            <div className={`w-32 h-32 rounded-[2px] ${avatars[targetUser.objectData.avatar_idx || 0]} ring-1 ring-[var(--border-mid)] shadow-2xl flex items-center justify-center text-4xl font-mono text-[var(--text-main)]`}>
                                {targetUser.objectData.username[0].toUpperCase()}
                            </div>
                            <div className="text-center md:text-left flex-1">
                                <h1 className="text-3xl font-mono font-bold text-[var(--text-main)] mb-2 uppercase tracking-tight">{targetUser.objectData.username}</h1>
                                {targetUser.objectData.bio && (
                                    <p className="text-[var(--text-muted)] max-w-2xl mb-4 font-mono text-sm border-l-2 border-[var(--accent)] pl-3">{targetUser.objectData.bio}</p>
                                )}
                                <div className="flex items-center justify-center md:justify-start gap-6 text-xs font-mono text-[var(--text-dim)]">
                                    <div className="flex items-center gap-2">
                                        <div className="icon-calendar w-3 h-3"></div>
                                        JOINED: {formatDate(targetUser.createdAt).toUpperCase()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="icon-layers w-3 h-3"></div>
                                        CREATIONS: {creations.length}
                                    </div>
                                </div>
                            </div>
                            {currentUser && currentUser.objectId === targetUser.objectId && (
                                <div className="shrink-0">
                                    <a href="index.html" className="btn btn-primary">
                                        <div className="icon-plus w-4 h-4"></div>
                                        NEW_PROJECT
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Gallery Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {creations.length === 0 ? (
                        <div className="text-center py-20 bg-[var(--bg-panel)] rounded-[2px] border border-dashed border-[var(--border-mid)]">
                            <div className="icon-image-off w-12 h-12 text-[var(--text-dim)] mx-auto mb-4 opacity-50"></div>
                            <h3 className="text-sm font-mono text-[var(--text-main)] mb-1 uppercase">No Data Found</h3>
                            <p className="text-[var(--text-dim)] mb-6 text-xs">Initialize your first vector project.</p>
                            {currentUser && currentUser.objectId === targetUser.objectId && (
                                <a href="index.html" className="btn btn-secondary inline-flex">INITIALIZE</a>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {creations.map(creation => {
                                // Parse the stored data
                                let svgData = null;
                                let styleConfig = { style: 'abstract', palette: 'vibrant' };
                                try {
                                    // Handle different storage formats gracefully
                                    if (creation.objectData.svg_code.startsWith('SVG_DATA::')) {
                                         // Legacy or alternate format if we used it
                                         // For now we just stored JSON stringified
                                    }
                                    svgData = JSON.parse(creation.objectData.svg_code);
                                    styleConfig = JSON.parse(creation.objectData.style_config);
                                } catch (e) {
                                    console.error("Failed to parse creation data", e);
                                }

                                return (
                                    <div key={creation.objectId} className="card group overflow-hidden hover:border-[var(--border-mid)] transition-all duration-200">
                                        <div className="aspect-[4/3] relative bg-[var(--bg-surface)] overflow-hidden border-b border-[var(--border-dim)]">
                                            {/* Preview */}
                                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                                {svgData ? (
                                                     <svg
                                                        viewBox={`0 0 ${svgData.width || 400} ${svgData.height || 400}`}
                                                        className="w-full h-full shadow-sm bg-white"
                                                        preserveAspectRatio="xMidYMid meet"
                                                    >
                                                        {svgData.elements && svgData.elements.map((el, i) => {
                                                            const commonProps = {
                                                                key: i,
                                                                fill: el.fill || 'none',
                                                                stroke: el.stroke || 'none',
                                                                strokeWidth: el.strokeWidth || 0,
                                                                opacity: el.opacity,
                                                                transform: el.transform
                                                            };
                                                            // Basic render support for profile preview
                                                            if (el.type === 'circle') return <circle {...commonProps} cx={el.cx} cy={el.cy} r={el.r} />;
                                                            if (el.type === 'ellipse') return <ellipse {...commonProps} cx={el.cx} cy={el.cy} rx={el.rx} ry={el.ry} />;
                                                            if (el.type === 'rect') return <rect {...commonProps} x={el.x} y={el.y} width={el.width} height={el.height} rx={el.rx} ry={el.ry} />;
                                                            if (el.type === 'polygon') return <polygon {...commonProps} points={el.points} />;
                                                            if (el.type === 'path') return <path {...commonProps} d={el.d} />;
                                                            if (el.type === 'line') return <line {...commonProps} x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} />;
                                                            return null;
                                                        })}
                                                    </svg>
                                                ) : (
                                                    <div className="text-[var(--text-dim)] text-xs font-mono">NO_PREVIEW_DATA</div>
                                                )}
                                            </div>
                                            
                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                 <button 
                                                    className="p-2 bg-[var(--accent)] rounded-[2px] hover:bg-[var(--accent-dim)] text-black"
                                                    title="Download"
                                                >
                                                    <div className="icon-download w-4 h-4"></div>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="p-3">
                                            <p className="font-mono text-xs text-[var(--text-main)] truncate mb-2" title={creation.objectData.prompt}>
                                                &gt; {creation.objectData.prompt}
                                            </p>
                                            <div className="flex items-center justify-between text-[10px] text-[var(--text-dim)] font-mono uppercase">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-[var(--bg-body)] px-1.5 py-0.5 border border-[var(--border-dim)] rounded-[1px]">{styleConfig.style}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>{formatDate(creation.createdAt)}</span>
                                                    {currentUser && currentUser.objectId === targetUser.objectId && (
                                                        <button 
                                                            onClick={(e) => handleDelete(creation.objectId, e)}
                                                            disabled={deletingId === creation.objectId}
                                                            className="text-[var(--text-dim)] hover:text-red-500 transition-colors p-1"
                                                            title="Delete"
                                                        >
                                                            {deletingId === creation.objectId ? (
                                                                <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full"></div>
                                                            ) : (
                                                                <div className="icon-trash w-3 h-3"></div>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
            
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={handleLoginSuccess} />
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <ProfileView />
  </ErrorBoundary>
);