'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'lg' | 'xl' | 'full';
}

export default function Modal({ isOpen, onClose, children, title, size = 'sm' }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent background scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const containerWidth = size === 'full'
    ? 'w-full max-w-7xl h-[92vh]'
    : size === 'xl'
      ? 'w-full max-w-5xl max-h-[90vh]'
      : size === 'lg'
        ? 'w-full max-w-2xl max-h-[90vh]'
        : 'w-full max-w-md max-h-[90vh]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overscroll-contain">
      <div className={`bg-white rounded-lg shadow-xl ${containerWidth} m-4 flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4 overflow-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
