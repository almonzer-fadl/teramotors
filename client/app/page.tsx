"use client";

import { useEffect, useState } from 'react';
import LandingPage from '@/components/LandingPage';
import SaaSLandingPage from './(marketing)/page';

export default function Home() {
  const [isSaasDomain, setIsSaasDomain] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if we're on the SaaS subdomain (app.teramotor.cc) or localhost with ?saas param
    const hostname = window.location.hostname;
    const searchParams = new URLSearchParams(window.location.search);

    const isSaas =
      hostname.startsWith('app.') ||
      hostname === 'app.teramotor.cc' ||
      searchParams.get('saas') === 'true' ||  // For local testing: localhost:3000?saas=true
      (hostname === 'localhost' && searchParams.get('view') === 'saas');

    setIsSaasDomain(isSaas);
  }, []);

  // Show loading while detecting domain
  if (isSaasDomain === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#F97402] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show SaaS marketing page on app.teramotor.cc or with ?saas=true
  if (isSaasDomain) {
    return <SaaSLandingPage />;
  }

  // Show original Tera workshop landing page on teramotor.cc
  return <LandingPage />;
}
