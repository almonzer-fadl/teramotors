"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Icon } from 'lucide-react';

interface NavItemBubbleProps {
  item: {
    href: string;
    tKey: string;
    icon: React.ElementType;
  };
  onClick: () => void;
  // We will add animation props later
}

export default function NavItemBubble({ item, onClick }: NavItemBubbleProps) {
  const Icon = item.icon;

  return (
    <motion.div>
      <Link href={item.href} onClick={onClick}>
        <div className="flex items-center gap-4 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 dark:bg-gray-800/20 shadow-lg backdrop-blur-md border border-white/30 dark:border-white/10">
            <Icon className="h-6 w-6 text-foreground/80" />
          </div>
          <span className="text-sm font-semibold text-foreground bg-white/20 dark:bg-gray-800/20 px-3 py-1 rounded-md shadow-lg backdrop-blur-md border border-white/30 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
            {item.tKey} 
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
