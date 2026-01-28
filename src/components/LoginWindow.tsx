import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ApiError {
  message: string;
  status?: number;
}

export function LoginWindow() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password);
      }
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status === 401) {
        setError('Invalid username or password');
      } else if (apiError.status === 409 || apiError.message?.toLowerCase().includes('exists')) {
        setError('Username already exists');
      } else if (apiError.status === 400) {
        setError('Invalid request. Please check your input.');
      } else if (!navigator.onLine) {
        setError('No internet connection');
      } else {
        setError(apiError.message || 'An error occurred. Please try again.');
      }
    }

    setLoading(false);
  };

  return (
    <div className="xp-window w-80 shadow-2xl">
      {/* Title Bar */}
      <div className="xp-titlebar">
        <div className="flex items-center gap-2">
          <span>🔐</span>
          <span className="text-sm">{isLogin ? 'Log On to Windows' : 'Create Account'}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-card">
        <div className="flex gap-4 mb-4">
          <div className="text-5xl">👤</div>
          <div>
            <p className="text-xs mb-1">
              {isLogin
                ? 'Type your user name and password to log on.'
                : 'Create a new account to access the Online Judge.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="text-xs flex items-center gap-2">
              <span className="w-20">User name:</span>
              <input
                type="text"
                className="xp-input flex-1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
              />
            </label>
          </div>

          <div className="mb-2">
            <label className="text-xs flex items-center gap-2">
              <span className="w-20">Password:</span>
              <input
                type="password"
                className="xp-input flex-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </label>
          </div>

          {error && (
            <div className="text-red-600 text-xs mb-2 flex items-center gap-1">
              ⚠️ {error}
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <button
              type="button"
              className="text-xs text-primary underline cursor-pointer"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? 'Create new account' : 'I have an account'}
            </button>

            <div className="flex gap-2">
              <button
                type="submit"
                className="xp-button-primary px-4"
                disabled={loading}
              >
                {loading ? 'Please wait...' : isLogin ? 'OK' : 'Create'}
              </button>
            </div>
          </div>
        </form>

        {isLogin && (
          <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
            <p>Use credentials:</p>
            <p>• Admin: admin / @Vaibhav1</p>
            <p>• User: user / @Vaibhav1</p>
          </div>
        )}
      </div>
    </div>
  );
}
