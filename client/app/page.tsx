"use client";

import { useEffect } from 'react';
import LandingPage from '@/components/LandingPage';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const hostname = window.location.hostname;

    // If on app subdomain or Vercel preview, redirect to login
    if (hostname.startsWith('app.') || hostname.includes('vercel.app')) {
      router.push('/login');
    }
    // If on main domain (teramotor.cc), show landing page (do nothing, it renders below)
  }, [router]);

  // Show landing page for main domain
  return <LandingPage />;
}
