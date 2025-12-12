'use client';

import { X } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useEffect } from 'react';

interface ModernizedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'lg' | 'xl' | 'full';
}

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2, ease: 'easeIn' } },
};

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export default function ModernizedModal({ isOpen, onClose, children, title, size = 'lg' }: ModernizedModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  const containerWidth = size === 'full'
    ? 'w-full max-w-7xl h-[92vh]'
    : size === 'xl'
      ? 'w-full max-w-5xl'
      : size === 'lg'
        ? 'w-full max-w-2xl'
        : 'w-full max-w-md';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain"
        >
          {/* Backdrop with glassmorphism */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
          
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl ${containerWidth} m-4 flex flex-col max-h-[90vh]`}
          >
            <header className="flex items-center justify-between p-4 sm:p-6 border-b border-black/10 dark:border-white/10">
              {title && <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>}
              <motion.button
                onClick={onClose}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full p-1 transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-6 w-6" />
              </motion.button>
            </header>
            <main className="p-4 sm:p-6 overflow-auto flex-1">
              {children}
            </main>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
