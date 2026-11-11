import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  PhoneCall, 
  Star, 
  CheckCircle2, 
  ShoppingCart, 
  Briefcase,
  Sparkles,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  Users
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { LoginPage } from '../auth/LoginPage';
import { RegisterPage } from '../auth/RegisterPage';
import { Logo } from '../ui/kit';

interface HomePageProps {
  store: ReturnType<typeof useERPStore>;
}

type Mode = 'home' | 'login' | 'register';

export const HomePage: React.FC<HomePageProps> = ({ store }) => {
  const [mode, setMode] = useState<Mode>('home');

  if (mode !== 'home') {
    return (
      <div className="min-h-screen bg-white flex flex-col select-text">
        <header className="px-4 sm:px-8 py-4 flex items-center justify-between border-b border-gray-200 bg-white">
          <button 
            onClick={() => setMode('home')} 
            className="focus:outline-none"
            aria-label="Back to home"
          >
            <Logo />
          </button>
          
          <button 
            onClick={() => setMode('home')} 
            className="text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full inline-flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-12 bg-gray-50/50">
          <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-9 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600" />
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
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-indigo-600 selection:text-white">
      {/* 1. TOP ANNOUNCEMENT BAR (Clean Indigo Accent) */}
      <div className="bg-indigo-600 text-white px-4 sm:px-8 py-2 text-[11px] sm:text-xs font-semibold flex flex-wrap items-center justify-between border-b border-indigo-700">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            We&apos;re top enterprise ERP &amp; cloud infrastructure agency
          </span>
          <span className="hidden md:inline text-white/50">|</span>
          <span className="hidden md:inline">info@auratech.it</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">Dhaka Silicon Tower Cloud Datacenter</span>
          <div className="flex items-center gap-2 font-bold">
            <span>Follow Us:</span>
            <span className="hover:underline cursor-pointer">X</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">LinkedIn</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Facebook</span>
          </div>
        </div>
      </div>

      {/* 2. PURE WHITE NAVBAR */}
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-8 lg:px-14 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm/50">
        <div className="flex items-center gap-2.5">
          <Logo />
        </div>

        <div className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-gray-600">
          <a href="#home" className="text-indigo-600 transition">Home</a>
          <a href="#modules" className="hover:text-indigo-600 transition">ERP Modules</a>
          <a href="#about" className="hover:text-indigo-600 transition">About Us</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode('login')}
            className="group inline-flex items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
          >
            <span>Launch ERP Portal</span>
            <div className="w-5 h-5 rounded-full bg-indigo-800 text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        </div>
      </nav>

      {/* 3. HERO SECTION (Pure White Background with High Contrast Dark Typography) */}
      <section id="home" className="bg-white px-4 sm:px-8 lg:px-14 pt-10 sm:pt-14 pb-16 sm:pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">
            {/* Review Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-900 shadow-sm">
              <span className="bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px]">4.9</span>
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="text-gray-600 font-medium">500+ Enterprise Reviews</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-black text-gray-900 tracking-tight uppercase leading-[1.12]">
              NEXT — GEN TOP <br />
              NOTCH <span className="text-indigo-600">BUSINESS</span> <br />
              SOLUTION
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed">
              We provide unified enterprise ERP systems to help companies grow, optimize high-speed retail operations, manage 30-person human capital, and achieve scalable governance.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6">
              <button
                onClick={() => setMode('login')}
                className="group inline-flex items-center gap-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 text-xs sm:text-sm font-bold shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
              >
                <span>Access ERP Portal</span>
                <div className="w-5 h-5 rounded-full bg-indigo-800 text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>

              <a 
                href="tel:+88029883401" 
                className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold text-gray-900 hover:text-indigo-600 transition group"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block font-semibold tracking-wide uppercase">Call Us (Hotline)</span>
                  <span className="text-xs sm:text-sm font-extrabold tracking-wide text-gray-900">+880 (2) 9883401</span>
                </div>
              </a>
            </div>

            {/* Micro proof badges */}
            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" /> ISO 27001 Certified Security
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Sub-Second Offline POS
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" /> 30-Person Org Tree
              </span>
            </div>
          </div>

          {/* Right Column: Hero Corporate Executives Imagery */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden border border-gray-200 shadow-2xl bg-white">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
                alt="Corporate Enterprise Executives"
                className="w-full h-[360px] sm:h-[430px] object-cover object-top"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
              
              {/* Floating pill badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl p-3.5 flex items-center justify-between text-gray-900 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold leading-tight text-gray-900">Tier III Cloud Datacenter</p>
                    <p className="text-[11px] text-gray-500 font-medium">Silicon Tower, Gulshan-2, Dhaka</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ESSENTIAL FEATURES SECTION (3 Signature Cards on Pure White Background) */}
      <section id="modules" className="px-4 sm:px-8 lg:px-14 py-16 sm:py-24 bg-gray-50/70 border-t border-gray-200/80">
        <div className="max-w-7xl mx-auto">
          {/* Header Strip */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                Our Approach
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-snug">
                Essential features for modern business success
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md leading-relaxed">
              Explore integrated enterprise modules: automate retail checkout, streamline multi-warehouse inventory, govern 30-person human resources, and track double-entry finances with AI.
            </p>
          </div>

          {/* 3 Signature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
            {/* Card 1: White Card */}
            <div className="bg-white rounded-3xl p-7 border border-gray-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group">
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                  <Briefcase className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-gray-900">Next-gen Human Resources</h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    30-person structured hierarchy org tree, real check-in/out attendance, leave allocations, and corporate payroll compliance.
                  </p>
                </div>
              </div>
              <div className="pt-8">
                <button 
                  onClick={() => setMode('login')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition group-hover:translate-x-1"
                >
                  <span>Explore HR Suite</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 2: Indigo Primary Signature Card */}
            <div className="bg-indigo-600 text-white rounded-3xl p-7 shadow-xl shadow-indigo-200 hover:shadow-2xl transition-all flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="space-y-5 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-white">Enterprise Inventory &amp; Stock</h3>
                  <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium">
                    Multi-warehouse stock visibility, barcode receiving, IT hardware assets, aging analytics, and smart automated requisitions.
                  </p>
                </div>
              </div>
              <div className="pt-8 relative z-10">
                <button 
                  onClick={() => setMode('login')}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-white hover:underline transition group-hover:translate-x-1"
                >
                  <span>Explore Inventory</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 3: White Card (Consistent Clean Aesthetic) */}
            <div className="bg-white rounded-3xl p-7 border border-gray-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group">
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                  <ShoppingCart className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-gray-900">Intelligent POS &amp; Billing</h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    Sub-second cashier register, dual-pane tender, thermal receipts, double-entry financial ledger, and offline-first resilience.
                  </p>
                </div>
              </div>
              <div className="pt-8">
                <button 
                  onClick={() => setMode('login')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition group-hover:translate-x-1"
                >
                  <span>Launch Cashier POS</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. COMPREHENSIVE SOLUTION & ENTERPRISE STATS (Pure White Background) */}
      <section id="about" className="px-4 sm:px-8 lg:px-14 py-16 sm:py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Visual Grid with Stat Cards */}
          <div className="lg:col-span-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-md h-52 sm:h-64">
                <img
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80"
                  alt="Enterprise collaboration"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-md h-52 sm:h-64">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80"
                  alt="Engineering team"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Bottom Stat Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              {/* Badge 1: Indigo */}
              <div className="bg-indigo-600 text-white rounded-2xl p-4 shadow-md shadow-indigo-100">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 fill-current text-indigo-200" />
                  <span className="text-xl font-black">10K+</span>
                </div>
                <p className="text-[11px] font-medium mt-1 text-indigo-100">Completed Transactions &amp; Invoices</p>
              </div>

              {/* Badge 2: Indigo Light / White */}
              <div className="bg-indigo-50/70 rounded-2xl p-4 border border-indigo-100 shadow-sm">
                <div className="flex text-amber-500 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xl font-black text-gray-900">4.9<span className="text-xs text-gray-500 font-normal">/5.0</span></p>
                <p className="text-[11px] font-semibold text-gray-600 mt-0.5">Avg. Enterprise Rating</p>
              </div>

              {/* Badge 3: Architecture pills */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col justify-between">
                <p className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Cloud Stack</p>
                <div className="flex flex-wrap gap-1 mt-1.5 text-[9px] font-bold">
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">REACT 19</span>
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">FASTAPI</span>
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">NODE</span>
                  <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-extrabold">AI ML</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              Who We Are &amp; What We Deliver
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
              Comprehensive solution for business excellence
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              AuraTech ERP harmonizes front-of-house sales, multi-branch inventory depots, double-entry financial ledger accounting, and 30-person staff governance into one high-availability corporate cloud suite.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { title: 'Unified Data Sync', desc: 'Instant alignment between retail billing, stock levels, and ledger journals.' },
                { title: 'Offline-First Resilience', desc: 'Terminals continue billing even during Internet drops without losing any invoice.' },
                { title: 'AI-Powered Business Intelligence', desc: 'Weekly footfall forecasting, safety stock thresholds, and RFM customer segmentation.' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900">{item.title}</h4>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Founder/CEO Card & Button */}
            <div className="pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => setMode('login')}
                className="group inline-flex items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 transition"
              >
                <span>Launch ERP System</span>
                <div className="w-4 h-4 rounded-full bg-indigo-800 text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                  SA
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-gray-900">System Administrator</h5>
                  <p className="text-[11px] text-gray-500">CEO / Managing Director — AuraTech ERP</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CLEAN FOOTER */}
      <footer className="bg-gray-900 text-gray-400 border-t border-gray-800 px-4 sm:px-8 lg:px-14 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-xs">
              A
            </div>
            <span className="font-bold text-white text-sm">AuraTech ERP Suite</span>
            <span>•</span>
            <span>Level 14-16, Silicon Tower, Plot 8/A, Gulshan-2, Dhaka-1212</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setMode('login')} className="hover:text-white transition font-semibold">
              Portal Log In
            </button>
            <span>•</span>
            <button onClick={() => setMode('register')} className="hover:text-white transition font-semibold">
              Staff Registration
            </button>
            <span>•</span>
            <span>© {new Date().getFullYear()} AuraTech ERP. All Rights Reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
