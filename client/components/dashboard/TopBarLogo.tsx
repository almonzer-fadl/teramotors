"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/hooks/useSession';

const CodedLogo = () => (
    <Link href="/dashboard" className="flex items-center gap-2">
        <img src="/icon.png" alt="TeraMotors Logo" className="w-9 h-9 object-contain rounded-lg"/>
        <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-foreground">
                Tera<span className="text-primary">Motors</span>
            </span>
        </div>
    </Link>
);

export default function TopBarLogo() {
    const { user } = useSession();
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchBranding = async () => {
                try {
                    const response = await fetch('/api/settings/company-profile');
                    if (response.ok) {
                        const data = await response.json();
                        if (data.branding?.logoUrl) {
                            setLogoUrl(data.branding.logoUrl);
                        }
                    }
                } catch (error) { 
                    console.error("Failed to fetch tenant branding", error); 
                } finally {
                    setLoading(false);
                }
            };
            fetchBranding();
        } else if(user === null) {
            // No user, not loading
            setLoading(false);
        }
    }, [user]);

    if (loading) {
        return <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />;
    }

    return (
        <Link href="/dashboard" className="flex items-center h-full">
            {logoUrl ? (
                <img src={logoUrl} alt="Company Logo" className="max-h-9 object-contain"/>
            ) : (
                <CodedLogo />
            )}
        </Link>
    );
};
