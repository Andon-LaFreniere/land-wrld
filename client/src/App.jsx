import { useState } from 'react';
import Map from './Map';
import AuthModal from './components/AuthModal';

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    return savedUser && savedToken ? JSON.parse(savedUser) : null;
  });

  const [showAuth, setShowAuth] = useState(() => {
    return !localStorage.getItem('token');
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowAuth(true);
  };

  return (
    <>
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={(user) => { setUser(user); setShowAuth(false); }}
        />
      )}

      {user && (
        <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-md rounded-xl shadow-lg px-4 py-2 flex items-center gap-3">
          <span className="text-sm font-bold text-gray-700">{user.username}</span>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-red-500 font-bold uppercase tracking-tighter transition-colors"
          >
            Logout
          </button>
        </div>
      )}

      <Map user={user} />
    </>
  );
}