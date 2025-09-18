
import { create } from 'zustand';
import { ToastType } from '@/components/dashboard/Toast';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type: ToastType) => void;
  dismissToast: (id: number) => void;
}

let id = 0;

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type) =>
    set((state) => ({ toasts: [...state.toasts, { id: id++, message, type }] })),
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
