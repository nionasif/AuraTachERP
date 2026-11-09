import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { api } from '../../services/api';
import { Button, Field, Input, Notice } from '../ui/kit';
import { toUserAccount } from './authUtils';

interface RegisterPageProps {
  store: ReturnType<typeof useERPStore>;
  onSwitch: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ store, onSwitch }) => {
  const { setAuthenticatedUser } = store;
  const [form, setForm] = useState({ full_name: '', email: '', username: '', password: '', confirm: '', phone: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.full_name.trim().length < 2) return setError('Please enter your full name.');
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError('Please enter a valid email address.');
    if (form.username.trim().length < 3) return setError('Username must be at least 3 characters.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirm) return setError('The two passwords do not match.');

    setError(null);
    setLoading(true);
    const res = await api.registerFastAPI({
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      username: form.username.trim(),
      password: form.password,
      phone: form.phone.trim(),
    });
    setLoading(false);

    if (res.data?.user) {
      setAuthenticatedUser(toUserAccount(res.data.user));
      return;
    }
    setError(res.status === 0 ? 'Cannot reach the server. Make sure the backend is running (python run.py).' : res.error || 'Registration failed.');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
      <p className="text-sm text-gray-500 mt-1">It takes less than a minute.</p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="Full name">
          <Input value={form.full_name} onChange={set('full_name')} autoFocus autoComplete="name" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email">
            <Input type="email" value={form.email} onChange={set('email')} autoComplete="email" />
          </Field>
          <Field label="Phone (optional)">
            <Input value={form.phone} onChange={set('phone')} autoComplete="tel" />
          </Field>
        </div>
        <Field label="Username">
          <Input value={form.username} onChange={set('username')} autoComplete="username" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Password" hint="At least 6 characters">
            <Input type="password" value={form.password} onChange={set('password')} autoComplete="new-password" />
          </Field>
          <Field label="Confirm password">
            <Input type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
          </Field>
        </div>

        {error && <Notice tone="error">{error}</Notice>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Create account
        </Button>
      </form>

      <p className="text-sm text-gray-500 mt-6 text-center">
        Already have an account?{' '}
        <button onClick={onSwitch} className="font-semibold text-indigo-600 hover:text-indigo-700">
          Log in
        </button>
      </p>
    </div>
  );
};
