import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

export default function Features() {
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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200 shadow-lg"
    >
      <motion.h3
        variants={itemVariants}
        className="text-lg font-semibold text-gray-800 mb-4 flex items-center"
      >
        <span className="text-lg mr-2">🎯</span>
        Features
      </motion.h3>
      <ul className="space-y-2.5 text-gray-700">
        <motion.li variants={itemVariants} className="flex items-start">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span className="text-sm">Multiple positions supported</span>
        </motion.li>
        <motion.li variants={itemVariants} className="flex items-start">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span className="text-sm">Fully type-safe API</span>
        </motion.li>
        <motion.li variants={itemVariants} className="flex items-start">
          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span className="text-sm">Auto-close timing</span>
        </motion.li>
        <motion.li variants={itemVariants} className="flex items-start">
          <div className="w-1.5 h-1.5 bg-sky-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span className="text-sm">Click to dismiss</span>
        </motion.li>
        <motion.li variants={itemVariants} className="flex items-start">
          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span className="text-sm">Easily style with any CSS framework</span>
        </motion.li>
      </ul>
    </motion.div>
  );
} 