"use client";

import { useEffect, useState } from "react";
import LandingPage from "@/components/LandingPage";
import SaasLandingPage from "@/components/SaasLandingPage";

export default function Home() {
  const [showMarketing, setShowMarketing] = useState<boolean | null>(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    const searchParams = new URLSearchParams(window.location.search);

    const shouldShowMarketing =
      hostname.startsWith("app.") ||
      hostname === "app.teramotor.cc" ||
      searchParams.get("saas") === "true" ||
      (hostname === "localhost" && searchParams.get("view") === "saas");

    setShowMarketing(shouldShowMarketing);
  }, []);

  if (showMarketing === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#F97402] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showMarketing) {
    return <SaasLandingPage />;
  }

  return <LandingPage />;
}
