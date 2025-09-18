'use client';

import { useToast } from '@/lib/hooks/useToast';
import Toast from './Toast';

export default function ToastProvider() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
