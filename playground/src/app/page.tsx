'use client'

import ToastContainer from '../../../src/components/toast-container';
import Header from './components/Hero';
import QuickStart from './components/QuickStart';
import InteractiveDemo from './components/InteractiveDemo';
import Features from './components/Features';
import Stats from './components/Stats';
import Footer from './components/Footer';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

export default function Home() {
  const mainContentRef = useRef(null);
  const quickStartRef = useRef(null);
  const footerRef = useRef(null);

  const isMainContentInView = useInView(mainContentRef, { once: true, margin: "-100px" });
  const isQuickStartInView = useInView(quickStartRef, { once: true, margin: "-100px" });
  const isFooterInView = useInView(footerRef, { once: true, margin: "-100px" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-zinc-100 to-stone-50 text-gray-800">
      {/* Hero/Intro Section */}
      <Header />

      {/* Main Content Section */}
      <motion.div
        ref={mainContentRef}
        initial={{ opacity: 0, y: 50 }}
        animate={isMainContentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 py-16 px-4"
      >
        <div className="max-w-5xl mx-auto space-y-16">

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Demo - 2/3 width */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isMainContentInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <InteractiveDemo />
            </motion.div>

            {/* Sidebar - 1/3 width */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isMainContentInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <Features />
              <Stats />
            </motion.div>
          </div>

          {/* Quick Start Section */}
          <motion.div
            ref={quickStartRef}
            initial={{ opacity: 0, y: 50 }}
            animate={isQuickStartInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <QuickStart />
          </motion.div>

          <Footer />
        </div>
      </motion.div>

      <ToastContainer />
    </div>
  );
} 