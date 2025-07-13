'use client'

import { ToastContainer } from 'react-compact-toast';
import Header from './components/Header';
import QuickStart from './components/QuickStart';
import InteractiveDemo from './components/InteractiveDemo';
import Features from './components/Features';
import Stats from './components/Stats';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-zinc-100 to-stone-50 text-gray-800">
      {/* Hero/Intro Section */}
      <Header />

      {/* Main Content Section */}
      <div className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">

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