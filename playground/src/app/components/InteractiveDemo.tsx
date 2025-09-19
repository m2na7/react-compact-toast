import { toast } from '../../../../src/core/toast';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import ShowToastButton from './ShowToastButton';

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

  const showPlain = () => {
    toast({
      text: 'Simple and clean notification',
    });
  };

  const showWithIcon = () => {
    toast({
      text: 'Task completed successfully',
      icon: '✓',
      position: 'topRight',
      className: 'backdrop-blur-md bg-emerald-500/90 text-white border border-emerald-400/30 rounded-2xl shadow-2xl px-6 py-4 font-medium',
      autoClose: 4000,
    });
  };

  const showNoAutoClose = () => {
    toast({
      text: 'Please review your input',
      icon: '⚠',
      position: 'topCenter',
      className: 'backdrop-blur-md bg-amber-500/90 text-white border border-amber-400/30 rounded-2xl shadow-2xl px-6 py-4 font-medium',
      autoClose: false,
      closeOnClick: true,
    });
  };

  const showCustomOffset = () => {
    toast({
      text: 'Something went wrong',
      icon: '✕',
      position: 'bottomLeft',
      containerStyle: { left: '50px', bottom: '150px' },
      className: 'backdrop-blur-md bg-red-500/90 text-white border border-red-400/30 rounded-2xl shadow-2xl px-6 py-4 font-medium',
      autoClose: 5000,
    });
  };

  const showWithHighlightText = () => {
    toast({
      text: ' has been updated. Review the changes in your dashboard.',
      position: 'bottomRight',
      className: 'backdrop-blur-md bg-white/95 text-neutral-900 border border-neutral-200 rounded-2xl shadow-2xl p-6 max-w-sm',
      highlightText: 'Project status',
      highlightColor: '#a855f7',
      autoClose: 8000,
    });
  };

  const showFullyCustomizable = () => {
    toast({
      text: ' uploaded and processed. Click here to view details or dismiss this notification.',
      position: 'topLeft',
      className: 'w-80 h-24 bg-white text-gray-800 rounded-lg shadow-lg border-l-4 border-blue-500/90 p-4 flex flex-col justify-center hover:shadow-xl transition-shadow duration-200',
      highlightText: 'Successfully',
      highlightColor: '#3b82f6',
      autoClose: 10000,
    });
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className="backdrop-blur-xl bg-white/60 border border-neutral-200/50 rounded-3xl p-6 sm:p-8 shadow-xl shadow-neutral-900/5"
    >
      <motion.div
        variants={itemVariants}
        className="mb-8"
      >
        <h2 className="text-2xl font-medium text-neutral-900 mb-2">
          Toast Showcase
        </h2>
        <p className="text-neutral-600 text-sm leading-relaxed">
          Experience different notification styles and interactions
        </p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <ShowToastButton onClick={showPlain} color="neutral" variants={itemVariants}>
          Plain
        </ShowToastButton>

        <ShowToastButton onClick={showWithIcon} color="emerald" variants={itemVariants}>
          With icon
        </ShowToastButton>

        <ShowToastButton onClick={showNoAutoClose} color="amber" variants={itemVariants}>
          No auto close
        </ShowToastButton>

        <ShowToastButton onClick={showCustomOffset} color="red" variants={itemVariants}>
          Custom offset
        </ShowToastButton>

        <ShowToastButton onClick={showFullyCustomizable} color="blue" variants={itemVariants}>
          Fully customizable
        </ShowToastButton>

        <ShowToastButton onClick={showWithHighlightText} color="purple" variants={itemVariants}>
          With highlight
        </ShowToastButton>
      </div>

      <motion.div
        variants={itemVariants}
        className="mt-8 p-4 rounded-2xl bg-neutral-100/50 border border-neutral-200/50"
      >
        <p className="text-neutral-600 text-[13px] leading-relaxed">
          <span className="font-medium text-neutral-800">Interactive Demo:</span> Click any button to see toast notifications with different styles, positions, and behaviors.
        </p>
      </motion.div>
    </motion.div>
  );
} 