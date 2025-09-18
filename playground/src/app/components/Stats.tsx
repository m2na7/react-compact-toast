import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

export default function Stats() {
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
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
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
        <span className="text-lg mr-2">📊</span>
        Stats
      </motion.h3>
      <div className="space-y-3">
        <motion.div
          variants={itemVariants}
          className="flex justify-between items-center"
        >
          <span className="text-gray-600 text-sm">Bundle Size</span>
          <span className="text-green-600 font-semibold text-sm">≈2 kB</span>
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="flex justify-between items-center"
        >
          <span className="text-gray-600 text-sm">Dependencies</span>
          <span className="text-blue-600 font-semibold text-sm">Zero</span>
        </motion.div>
      </div>
    </motion.div>
  );
} 