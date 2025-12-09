"use client";

import Link from 'next/link';

export default function StaticAdminLogo() {
  return (
    <Link href="/admin" className="flex items-center gap-2">
      <img src="/icon.png" alt="TeraMotors Logo" className="w-9 h-9 object-contain rounded-lg" />
      <div className="flex flex-col">
        <span className="text-lg font-bold tracking-tight text-foreground">
          Tera<span className="text-primary">Motors</span>
        </span>
        <span className="text-xs text-muted-foreground -mt-1">Super Admin</span>
      </div>
    </Link>
  );
}
