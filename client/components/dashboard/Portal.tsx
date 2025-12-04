"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // On unmount, we don't need to do anything as React will remove the children
    return () => setMounted(false);
  }, []);

  // Only render the portal on the client-side where the document is available
  return mounted
    ? createPortal(children, document.body)
    : null;
}
