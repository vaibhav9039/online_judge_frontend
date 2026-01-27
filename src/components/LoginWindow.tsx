import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function LoginWindow() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const success = await login(username, password);
        if (!success) {
          setError('Invalid username or password');
        }
      } else {
        const success = await register(username, password, role);
        if (!success) {
          setError('Username already exists');
        }
      }
    } catch (err) {
      setError('An error occurred');
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
              />
            </label>
          </div>

          {!isLogin && (
            <div className="mb-2">
              <label className="text-xs flex items-center gap-2">
                <span className="w-20">Account type:</span>
                <select
                  className="xp-input flex-1"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                >
                  <option value="user">User</option>
                  <option value="admin">Administrator</option>
                </select>
              </label>
            </div>
          )}

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
            <p>Demo credentials:</p>
            <p>• Admin: admin / admin123</p>
            <p>• User: user / user123</p>
          </div>
        )}
      </div>
    </div>
  );
}
