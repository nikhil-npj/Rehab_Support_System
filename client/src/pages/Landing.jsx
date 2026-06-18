import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans flex flex-col justify-between">
      {/* Header / Navbar */}
      <header className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo on Left */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875V16.5m-1.05-11.25a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0Zm0 9.75a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM6 6.75a3.375 3.375 0 1 1 6.75 0A3.375 3.375 0 0 1 6 6.75Zm0 9.75a3.375 3.375 0 1 1 6.75 0A3.375 3.375 0 0 1 6 6.75Z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-brand-500">RehabTrack</span>
          </div>
          
          {/* Buttons on Right */}
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-brand-500 transition-colors duration-200">
              Sign In
            </Link>
            <Link to="/signup" className="text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-lg shadow-sm transition-colors duration-200">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section (Centered) */}
      <main className="container mx-auto px-6 py-20 flex-grow flex flex-col items-center justify-center text-center max-w-3xl">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-800 tracking-tight leading-tight mb-6">
          Empower Your <span className="text-brand-500">Recovery</span> Journey
        </h1>
        
        <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-2xl">
          Track exercises, monitor milestones, and stay connected with real-time feedback designed to keep you moving forward. Keep your physical rehabilitation on path.
        </p>

        {/* Dynamic Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-200">
            Create Free Account
          </Link>
          <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-brand-500 text-brand-500 font-semibold rounded-lg hover:bg-brand-50 transition-colors duration-200">
            Access Dashboard
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6 bg-slate-50 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} RehabTrack Inc. All rights reserved. Secure health logging.
      </footer>
    </div>
  );
}
