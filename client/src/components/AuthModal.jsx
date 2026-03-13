import { useState } from 'react';
import axios from 'axios';

export default function AuthModal({ onClose, onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const payload = mode === 'login'
        ? { email: formData.email, password: formData.password }
        : { username: formData.username, email: formData.email, password: formData.password };

      const res = await axios.post(`http://localhost:3001${endpoint}`, payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 flex flex-col gap-5">
        <h2 className="text-2xl font-bold text-gray-800">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex flex-col gap-4">
          {mode === 'signup' && (
            <input
              className="border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-black"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          )}
          <input
            className="border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-black"
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            className="border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-black"
            placeholder="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-all"
        >
          {mode === 'login' ? 'Login' : 'Sign up'}
        </button>

        <p className="text-sm text-center text-gray-500">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span
            className="font-bold text-black cursor-pointer"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
          >
            {mode === 'login' ? 'Sign up' : 'Login'}
          </span>
        </p>

        <button
          onClick={onClose}
          className="text-gray-400 text-xs font-bold hover:text-red-500 transition-colors uppercase tracking-tighter"
        >
          Continue without logging in
        </button>
      </div>
    </div>
  );
}