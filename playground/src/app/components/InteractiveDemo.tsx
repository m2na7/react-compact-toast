import { toast } from '../../../../src/core/toast';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

export default function InteractiveDemo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const showSimpleToast = () => {
    toast('Hello! This is a simple toast!');
  };

  const showWithIcon = () => {
    toast({
      text: 'with custom icon',
      icon: '🚀',
      position: 'topRight',
      className: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg shadow-lg',
      autoClose: 5000,
    });
  };

  const showNoAutoClose = () => {
    toast({
      text: 'Click to close !',
      position: 'topCenter',
      className: 'bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg shadow-lg',
      autoClose: false,
      closeOnClick: true,
    });
  };

  const showCustomPosition = () => {
    toast({
      text: 'Toast with custom position',
      position: 'bottomLeft',
      containerStyle: { left: '40px', bottom: '100px' },
      className: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg shadow-lg',
      autoClose: 5000,
    });
  };

  const showCustomStyle = () => {
    toast({
      text: ' uploaded and processed. Click here to view details or dismiss this notification.',
      position: 'bottomRight',
      className: 'w-80 h-24 bg-white text-gray-800 rounded-lg shadow-lg border-l-4 border-green-500 p-4 flex flex-col justify-center hover:shadow-xl transition-shadow duration-200',
      highlightText: 'Successfully',
      highlightColor: '#10B981',
      autoClose: 10000,
    });
  };

  const showWithHighlight = () => {
    toast({
      text: ' text',
      position: 'topLeft',
      className: 'bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium rounded-lg shadow-lg',
      highlightText: 'This is highlighted',
      highlightColor: '#FCD34D',
      autoClose: 5000,
    });
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg"
    >
      <motion.h2
        variants={itemVariants}
        className="text-xl font-semibold text-gray-800 mb-5 flex items-center"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
        Interactive Demo
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <motion.button
          variants={itemVariants}
          onClick={showSimpleToast}
          className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-2xl hover:scale-102 active:scale-98"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-center">
            <span className="text-lg mr-2">🎉</span>
            Simple Toast
          </div>
        </motion.button>

        <motion.button
          variants={itemVariants}
          onClick={showWithIcon}
          className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-102 active:scale-98"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-center">
            <span className="text-lg mr-2">🚀</span>
            With Icon
          </div>
        </motion.button>

        <motion.button
          variants={itemVariants}
          onClick={showNoAutoClose}
          className="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-102 active:scale-98"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-center">
            <span className="text-lg mr-2">📌</span>
            No Auto Close
          </div>
        </motion.button>

        <motion.button
          variants={itemVariants}
          onClick={showWithHighlight}
          className="group relative overflow-hidden bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-102 active:scale-98"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-center">
            <span className="text-xl mr-2">✅</span>
            With Highlight
          </div>
        </motion.button>

        <motion.button
          variants={itemVariants}
          onClick={showCustomStyle}
          className="group relative overflow-hidden bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-102 active:scale-98"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-center">
            <span className="text-lg mr-2">🎨</span>
            Custom Style
          </div>
        </motion.button>

        <motion.button
          variants={itemVariants}
          onClick={showCustomPosition}
          className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-102 active:scale-98"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-center">
            <span className="text-lg mr-2">📍</span>
            Custom offset from top/bottom
          </div>
        </motion.button>
      </div>

      <motion.div
        variants={itemVariants}
        className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200"
      >
        <p className="text-blue-700 text-sm">
          <span className="font-medium">💡 Tip:</span> Click buttons to test different toast features and configurations
        </p>
      </motion.div>
    </motion.div>
  );
} 