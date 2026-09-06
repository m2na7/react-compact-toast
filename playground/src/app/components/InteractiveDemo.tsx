import { toast } from 'react-compact-toast';
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
    toast('Simple and clean notification');
  };

  const showTypes = () => {
    toast.success('Changes saved', { position: 'topRight' });
    toast.error('Could not reach the server', { position: 'topRight' });
    toast.warning('Your session expires in 5 minutes', {
      position: 'topRight',
    });
  };

  const showPromise = () => {
    const upload = new Promise<{ name: string }>((resolve, reject) =>
      setTimeout(
        () =>
          Math.random() > 0.25
            ? resolve({ name: 'report.pdf' })
            : reject(new Error('the connection dropped')),
        1800
      )
    );

    toast.promise(
      upload,
      {
        loading: 'Uploading…',
        success: (file) => `Uploaded ${file.name}`,
        error: (err) => `Upload failed: ${(err as Error).message}`,
      },
      { position: 'topCenter' }
    );
  };

  const showAction = () => {
    toast('Message archived', {
      id: 'archived',
      icon: '📥',
      position: 'bottomLeft',
      action: {
        label: 'Undo',
        onClick: () => toast.success('Message restored'),
      },
    });
  };

  const showPersistent = () => {
    toast('A new version is available. Reload to update.', {
      id: 'update',
      type: 'info',
      position: 'topCenter',
      autoClose: false,
      closeOnClick: false,
      closeButton: true,
    });
  };

  const showCustomStyle = () => {
    toast(
      <span>
        <strong>report.pdf</strong> uploaded and processed.
      </span>,
      {
        position: 'topLeft',
        className:
          'w-80 bg-white text-gray-800 rounded-lg shadow-lg border-l-4 border-blue-500 p-4',
        autoClose: 8000,
      }
    );
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

        <ShowToastButton onClick={showTypes} color="emerald" variants={itemVariants}>
          Types
        </ShowToastButton>

        <ShowToastButton onClick={showPromise} color="amber" variants={itemVariants}>
          Promise
        </ShowToastButton>

        <ShowToastButton onClick={showAction} color="red" variants={itemVariants}>
          With action
        </ShowToastButton>

        <ShowToastButton onClick={showPersistent} color="blue" variants={itemVariants}>
          Persistent
        </ShowToastButton>

        <ShowToastButton onClick={showCustomStyle} color="purple" variants={itemVariants}>
          Custom style
        </ShowToastButton>
      </div>

      <motion.div
        variants={itemVariants}
        className="mt-8 p-4 rounded-2xl bg-neutral-100/50 border border-neutral-200/50"
      >
        <p className="text-neutral-600 text-[13px] leading-relaxed">
          <span className="font-medium text-neutral-800">Try it:</span> hover a
          toast to pause its timer, press <kbd>Alt</kbd> + <kbd>T</kbd> to focus
          the newest one, then <kbd>Esc</kbd> to dismiss it.
        </p>
      </motion.div>
    </motion.div>
  );
} 