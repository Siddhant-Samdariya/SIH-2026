import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowRight, ShieldCheck, CheckCircle2, Lock, User, AlertCircle, Camera } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if ((cleanUser === 'admin' && cleanPass === 'admin123') || (cleanUser.length > 0 && cleanPass.length > 0)) {
      setIsAuthenticating(true);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'admin');
      if (rememberMe) {
        localStorage.setItem('rememberedUser', username);
      }

      // Camera Transition Overlay before navigating to Overview
      setTimeout(() => {
        navigate('/');
      }, 900);
    } else {
      setError('Please enter a valid username and password.');
    }
  };

  const handleQuickDemoLogin = () => {
    setUsername('admin');
    setPassword('admin123');
    setIsAuthenticating(true);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', 'admin');
    setTimeout(() => {
      navigate('/');
    }, 900);
  };

  const capabilities = [
    'Traffic Intelligence',
    'Road & Infrastructure Monitoring',
    'AI Safety Detection',
    'ANPR & OCR',
    'Real-time Incident Detection'
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between font-sans text-slate-900 selection:bg-[#1b365d] selection:text-white relative">
      
      {/* Camera Cinematic Transition Overlay */}
      {isAuthenticating && (
        <div className="fixed inset-0 bg-[#0b192c]/95 z-50 flex flex-col items-center justify-center p-6 text-white backdrop-blur-md transition-all duration-300">
          <div className="relative flex items-center justify-center mb-6">
            <div className="w-24 h-24 rounded-full border-2 border-cyan-500/40 border-t-cyan-400 animate-spin flex items-center justify-center"></div>
            <div className="w-16 h-16 rounded-full border border-cyan-400/60 animate-ping absolute"></div>
            <div className="w-12 h-12 rounded-full bg-[#1b365d] flex items-center justify-center text-cyan-300 absolute shadow-lg border border-cyan-400/80">
              <Camera className="w-6 h-6 animate-pulse text-cyan-300" />
            </div>
          </div>
          <div className="text-center space-y-2 max-w-sm">
            <h3 className="text-lg font-bold tracking-tight text-white font-mono flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              CAM-FEED TELEMETRY VERIFIED
            </h3>
            <p className="text-xs text-cyan-200/80 font-mono tracking-wide">
              Connecting Administrator Terminal to Municipal Command Center...
            </p>
          </div>
        </div>
      )}

      {/* Top Subtle Header Bar */}
      <header className="px-6 py-4 border-b border-slate-200/80 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1b365d] flex items-center justify-center text-white shadow-2xs">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-base leading-none tracking-tight">UrbanSense</h1>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Urban Intelligence Platform</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Municipal AI Command Network</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* LEFT SIDE: Visual / Branding Section */}
          <div className="md:col-span-5 bg-gradient-to-b from-[#1b365d] to-[#112440] text-white p-8 sm:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/10 border border-white/15 rounded-full text-xs text-cyan-300 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  Enterprise Control Center
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  UrbanSense
                </h2>
                <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                  Urban Intelligence Platform
                </p>
              </div>

              <p className="text-slate-200 text-sm leading-relaxed font-normal">
                "Intelligent vision for safer, smarter cities."
              </p>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Core AI Capabilities
                </p>
                <ul className="space-y-2.5 text-xs text-slate-200">
                  {capabilities.map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between font-mono">
              <span>v2.4 Core Engine</span>
              <span className="text-emerald-400">● System Ready</span>
            </div>
          </div>

          {/* RIGHT SIDE: Centered Login Card */}
          <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white">
            <div className="max-w-md mx-auto w-full space-y-6">
              
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Welcome back
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Sign in to access the UrbanSense control dashboard.
                </p>
              </div>

              {/* Inline Error Alert */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700 font-medium">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      required
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#1b365d] focus:bg-white rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#1b365d] focus:bg-white rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Remember me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-600 font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-[#1b365d] focus:ring-0 cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full btn-primary justify-center py-2.5 text-sm font-semibold shadow-xs flex items-center gap-2 disabled:opacity-70"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Default Admin Login Button */}
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  disabled={isAuthenticating}
                  className="w-full btn-secondary justify-center py-2 text-xs font-semibold"
                >
                  <span>Default Admin Login</span>
                </button>
              </form>

              {/* Authorized Access Disclaimer */}
              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                  Authorized Access Only • UrbanSense Command Network
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-slate-200/80 bg-white text-center text-xs text-slate-400 font-mono">
        UrbanSense Core Platform • Municipal Security System
      </footer>
    </div>
  );
};

export default LoginPage;
