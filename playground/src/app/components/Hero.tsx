import Image from 'next/image';
import { motion } from 'motion/react';

export default function Header() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 -mt-16">
      <div className="text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1
          }}
          className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl mb-8 shadow-xl overflow-hidden cursor-pointer"
        >
          <Image
            src="/logo.webp"
            alt="React Compact Toast Logo"
            width={60}
            height={60}
            className="object-contain"
          />
        </motion.div>

        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-gray-900 via-blue-600 to-gray-900 bg-clip-text text-transparent leading-tight"
          >
            React Compact Toast
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <motion.span
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-700 border border-green-200 cursor-pointer shadow-md"
            >
              ✨ ~2.7 kB
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200 cursor-pointer shadow-md"
            >
              🚀 Zero deps
            </motion.span>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="text-xl md:text-2xl text-gray-600 font-normal max-w-3xl mx-auto leading-relaxed mb-8"
        >
          Compact, easy-to-use toast notifications for React
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed"
        >
          <p className="text-base text-gray-400">
            ⚡ Lightweight • ⚙️ Headless Architecture • 🎯 Intuitive API • ✨ Fully Customizable
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="mt-12"
        >
          <div className="animate-bounce">
            <svg
              className="w-6 h-6 text-gray-400 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 