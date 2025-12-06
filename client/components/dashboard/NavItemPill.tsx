"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NavItemPill({ item, onClick, variants, custom }: any) {
  const Icon = item.icon;

  return (
    <motion.div variants={variants} custom={custom}>
        <Link 
            href={item.href} 
            onClick={onClick} 
            className="flex items-center w-40 gap-2 px-3 py-2 rounded-full bg-white/70 dark:bg-gray-800/70 shadow-lg backdrop-blur-lg border border-white/30 dark:border-white/10 group hover:bg-primary/10 hover:border-primary/20 transition-all"
        >
            <Icon className="h-5 w-5 text-foreground/80 group-hover:text-primary transition-colors" />
            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {item.tKey}
            </span>
        </Link>
    </motion.div>
  );
}
