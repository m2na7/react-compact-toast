'use client'

import { ToastContainer } from 'react-compact-toast';
import Header from './components/Header';
import QuickStart from './components/QuickStart';
import InteractiveDemo from './components/InteractiveDemo';
import Features from './components/Features';
import Stats from './components/Stats';
import Footer from './components/Footer';
import ActionButtons from './components/ActionButtons';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-200 to-slate-100 relative">
      {/* Subtle background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-50/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-50/40 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-5xl w-full">
          <Header />

          <ActionButtons />

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <InteractiveDemo />

            {/* Sidebar */}
            <div className="space-y-4">
              <Features />
              <Stats />
            </div>
          </div>

          <QuickStart />

          <Footer />
        </div>
      </div>

      <ToastContainer />
    </div>
  );
} 