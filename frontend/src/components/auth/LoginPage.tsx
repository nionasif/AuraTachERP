import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { api } from '../../services/api';
import { Button, Field, Input, Notice } from '../ui/kit';
import { toUserAccount } from './authUtils';

interface LoginPageProps {
  store: ReturnType<typeof useERPStore>;
  onSwitch: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ store, onSwitch }) => {
  const { setAuthenticatedUser } = store;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter your username and password.');
      return;
    }
    setError(null);
    setLoading(true);
    const res = await api.loginFastAPI(username.trim(), password);
    setLoading(false);

    if (res.data?.user) {
      setAuthenticatedUser(toUserAccount(res.data.user));
      return;
    }
    if (res.status === 0) {
      setError('Cannot reach the server. Make sure the backend is running (python run.py).');
    } else {
      setError(res.error || 'Login failed.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
      <p className="text-sm text-gray-500 mt-1">Log in to continue to your workspace.</p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="Username or email">
          <Input value={username} onChange={e => setUsername(e.target.value)} autoFocus autoComplete="username" placeholder="e.g. admin" />
        </Field>

        <Field label="Password">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Your password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </Field>

        {error && <Notice tone="error">{error}</Notice>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Log in
        </Button>
      </form>

      <p className="text-sm text-gray-500 mt-6 text-center">
        New here?{' '}
        <button onClick={onSwitch} className="font-semibold text-indigo-600 hover:text-indigo-700">
          Create an account
        </button>
      </p>
      <p className="text-[11px] text-gray-400 mt-4 text-center">Demo admin login: admin / password123</p>
    </div>
  );
};
