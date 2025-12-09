'use client';

import { useState, useEffect, useCallback } from 'react';

interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

interface CustomerSession {
  customer: Customer | null;
  isAuthenticated: boolean;
}

export function useCustomerSession() {
  const [session, setSession] = useState<CustomerSession>({
    customer: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch('/api/portal/session');
      if (response.ok) {
        const data = await response.json();
        if (data.isAuthenticated) {
            setSession({ customer: data.customer, isAuthenticated: true });
        } else {
            setSession({ customer: null, isAuthenticated: false });
        }
      } else {
        setSession({ customer: null, isAuthenticated: false });
      }
    } catch (error) {
        setSession({ customer: null, isAuthenticated: false });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return { ...session, isLoading, update: fetchSession };
}