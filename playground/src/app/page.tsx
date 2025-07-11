'use client'

import { ToastContainer } from '../../../src';
import Header from './components/Header';
import QuickStart from './components/QuickStart';
import InteractiveDemo from './components/InteractiveDemo';
import Features from './components/Features';
import Stats from './components/Stats';
import Footer from './components/Footer';
import ActionButtons from './components/ActionButtons';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-6xl w-full">
          <Header />

          <ActionButtons />

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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