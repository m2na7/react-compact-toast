'use client'

import ToastContainer from '../../../src/components/toast-container';
import Header from './components/Hero';
import QuickStart from './components/QuickStart';
import InteractiveDemo from './components/InteractiveDemo';
import Features from './components/Features';
import Footer from './components/Footer';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

export default function Home() {
  const mainContentRef = useRef(null);
  const quickStartRef = useRef(null);

  const isMainContentInView = useInView(mainContentRef, { once: true, margin: "-100px" });
  const isQuickStartInView = useInView(quickStartRef, { once: true, margin: "-100px" });

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-neutral-900 selection:text-neutral-50">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 opacity-[0.015]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />
      </div>

      {/* Hero/Intro Section */}
      <Header />

      {/* Main Content Section */}
      <motion.div
        ref={mainContentRef}
        initial={{ opacity: 0, y: 24 }}
        animate={isMainContentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.6, ease: [0.21, 1.11, 0.81, 0.99] }}
        className="relative z-10 py-16 px-4 sm:py-24 sm:px-6"
      >
        <div className="max-w-6xl mx-auto">

          {/* Main Content Grid - Cleaner approach */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Interactive Demo - Main focus */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={isMainContentInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-3 order-1"
            >
              <InteractiveDemo />
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={isMainContentInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 32 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1 order-2 lg:order-2"
            >
              <div className="sticky top-24">
                <Features />
              </div>
            </motion.div>
          </div>

          {/* Quick Start Section - Breathing room */}
          <motion.div
            ref={quickStartRef}
            initial={{ opacity: 0, y: 32 }}
            animate={isQuickStartInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
            transition={{ duration: 0.5, ease: [0.21, 1.11, 0.81, 0.99] }}
            className="mt-12"
          >
            <QuickStart />
          </motion.div>

          <div className="mt-24">
            <Footer />
          </div>
        </div>
      </motion.div>

      <ToastContainer />
    </div>
  );
} 