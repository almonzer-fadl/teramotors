"use client";

import { Fragment, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/hooks/useSession";
import { getNavigationItems } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import NavItemPill from "./NavItemPill"; 
import {
  LayoutDashboard, Users, Car, ClipboardList, FileText, Package, Search, CreditCard,
  BarChart3, Settings, Wrench, MessageSquare,
} from "lucide-react";

const iconMap = { LayoutDashboard, Users, Car, ClipboardList, FileText, Package, Search, CreditCard, BarChart3, Settings, Wrench, MessageSquare };

const containerVariants = {
  open: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.05, // Subtle stagger for "imperfect" feel
    },
  },
  closed: {
    opacity: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  open: (i: number) => ({ // Custom prop 'i' for index
    y: 0,
    x: (i % 2) * 10 - 5, // Small alternating x-offset for "imperfect" line
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  }),
  closed: { 
    y: 20, // Animate slightly down on close
    x: 0,
    opacity: 0
  },
};

export default function Sidebar({ isOpen, onClose, position }: { isOpen: boolean; onClose: () => void; position: {x: number, y: number} }) {
    const { user } = useSession();
    const { t } = useTranslation("common");
    const userRole = (user as any)?.role || "mechanic";
    const navigation = getNavigationItems(userRole).map(item => ({...item, icon: iconMap[item.icon as keyof typeof iconMap], tKey: t(item.tKey) }));

    const getPositionStyles = () => {
        if (typeof window === 'undefined' || !position) return { top: '50%', left: '50%' };

        const { innerWidth, innerHeight } = window;
        const listWidth = 192; // w-48, approx width of the list container
        const listHeight = navigation.length * 52; // approx height of all pills
        const margin = 16; // 1rem
        const buttonSize = 56;

        // Default to opening above and to the left of the button
        let top = position.y - listHeight;
        let left = position.x - listWidth;

        // If opening ABOVE would go off-screen, open BELOW
        if (top < margin) {
            top = position.y + buttonSize + margin;
        }

        // If opening to the LEFT would go off-screen, open to the RIGHT
        if (left < margin) {
            left = position.x + buttonSize;
        }

        // Final boundary checks to pull the panel back into view
        if (top < margin) top = margin;
        if (top + listHeight > innerHeight - margin) top = innerHeight - listHeight - margin;
        if (left < margin) left = margin;
        if (left + listWidth > innerWidth - margin) left = innerWidth - listWidth - margin;

        // Add a small vertical offset to move it down slightly as requested
        top += 10; 

        return { top: `${top}px`, left: `${left}px` };
    };
    
    return (
        <AnimatePresence>
            {isOpen && (
                <Fragment>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/40"
                        onClick={onClose} 
                    />
                    <motion.div
                        variants={containerVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        style={getPositionStyles()}
                        className="fixed z-50 flex flex-col items-center gap-3 p-2 rounded-xl bg-white/20 dark:bg-gray-800/20 shadow-xl backdrop-blur-md border border-white/30 dark:border-white/10"
                    >
                        {navigation.map((item, index) => (
                           <NavItemPill 
                                key={item.tKey} 
                                item={item} 
                                onClick={onClose} 
                                variants={itemVariants} 
                                custom={index} // Pass index as custom prop
                           />
                        ))}
                    </motion.div>
                </Fragment>
            )}
        </AnimatePresence>
    )
}
