import { motion, useInView, Variants } from 'motion/react';
import { useRef } from 'react';

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.21, 1.11, 0.81, 0.99]
      }
    }
  };

  const features = [
    'Multiple positioning options',
    'Fully type-safe API',
    'Custom styling support',
    'Works with any CSS framework',
    'Auto-close with custom timing',
    'Click to dismiss',
  ];

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className="backdrop-blur-xl bg-white/60 border border-neutral-200/50 rounded-3xl p-5 shadow-xl shadow-neutral-900/5"
    >
      <motion.h2
        variants={itemVariants}
        className="text-lg font-semibold text-neutral-900 mb-4"
      >
        Features
      </motion.h2>

      <ul className="space-y-3">
        {features.map((feature, index) => (
          <motion.li
            key={index}
            variants={itemVariants}
            className="flex items-center text-sm text-neutral-700"
          >
            <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mr-3 flex-shrink-0"></div>
            {feature}
          </motion.li>
        ))}
      </ul>

      <motion.div
        variants={itemVariants}
        className="mt-8 pt-4 border-t border-neutral-200/60"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[13px] text-neutral-600">
            <span>Bundle size</span>
            <span className="font-medium">~2kB</span>
          </div>
          <div className="flex items-center justify-between text-[13px] text-neutral-600">
            <span>Dependencies</span>
            <span className="font-medium">Zero</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}