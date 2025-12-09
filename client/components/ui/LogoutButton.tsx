"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/simple-auth-client';
import { LogOut, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      toast.success('You have been logged out.');
      router.push('/login'); // Redirect to login page
    } catch (error) {
      console.error('Failed to sign out', error);
      toast.error('Failed to log out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-200"
    >
      {loading ? (
        <>
          <Loader2 className="me-2 h-5 w-5 animate-spin" />
          <span>Logging out...</span>
        </>
      ) : (
        <>
          <LogOut className="me-2 h-5 w-5" />
          <span>Log Out Super Admin</span>
        </>
      )}
    </button>
  );
}
