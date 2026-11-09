import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Users, CalendarCheck, Network } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { LoginPage } from '../auth/LoginPage';
import { RegisterPage } from '../auth/RegisterPage';
import { Button, Logo } from '../ui/kit';

interface HomePageProps {
  store: ReturnType<typeof useERPStore>;
}

type Mode = 'home' | 'login' | 'register';

export const HomePage: React.FC<HomePageProps> = ({ store }) => {
  const [mode, setMode] = useState<Mode>('home');

  if (mode !== 'home') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col select-text">
        <header className="px-6 py-4 flex items-center justify-between">
          <button onClick={() => setMode('home')} aria-label="Back to home">
            <Logo />
          </button>
          <button onClick={() => setMode('home')} className="text-sm text-gray-500 hover:text-gray-800 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 pb-16">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            {mode === 'login' ? (
              <LoginPage store={store} onSwitch={() => setMode('register')} />
            ) : (
              <RegisterPage store={store} onSwitch={() => setMode('login')} />
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col select-text">
      <header className="px-6 sm:px-10 py-4 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setMode('login')}>
            Log in
          </Button>
          <Button onClick={() => setMode('register')}>Register</Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-20">
        <span className="text-xs font-semibold tracking-wide text-indigo-600 bg-indigo-50 rounded-full px-3 py-1">Company workspace</span>
        <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight max-w-2xl leading-tight">
          Run your team and your business from one place
        </h1>
        <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-xl">
          People, attendance, projects, sales and inventory — simple, organised and always up to date.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Button className="px-6 py-3 text-base" onClick={() => setMode('login')}>
            Log in <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="secondary" className="px-6 py-3 text-base" onClick={() => setMode('register')}>
            Create an account
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full text-left">
          {[
            { icon: Users, title: 'Employees', text: 'One directory for everyone in the company.' },
            { icon: Network, title: 'Org chart', text: 'See who reports to whom, top to bottom.' },
            { icon: CalendarCheck, title: 'Attendance', text: 'Real check-in and check-out, no guesswork.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-5 text-center text-xs text-gray-400">© {new Date().getFullYear()} AuraTech</footer>
    </div>
  );
};
