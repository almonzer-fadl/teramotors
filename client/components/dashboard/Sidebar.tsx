"use client";

import { Fragment, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/hooks/useSession";
import { getNavigationItems } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import NavItemPill from "./NavItemPill"; 
import {
  LayoutDashboard, Users, Car, ClipboardList, FileText, Package, Search, CreditCard,
  BarChart3, Settings, Wrench, MessageSquare, Shield, Database, Calendar,
} from "lucide-react";
import { useSidebar } from "@/lib/contexts/SidebarContext";

const iconMap = { LayoutDashboard, Users, Car, ClipboardList, FileText, Package, Search, CreditCard, BarChart3, Settings, Wrench, MessageSquare, Shield, Database, Calendar };

const containerVariants = {
  open: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.05,
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
  open: (i: number) => ({
    y: 0,
    x: (i % 2) * 10 - 5,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  }),
  closed: { 
    y: 20,
    x: 0,
    opacity: 0
  },
};

export default function Sidebar() {
    const { user } = useSession();
    const { t } = useTranslation("common");
    const { isSidebarOpen, setSidebarOpen } = useSidebar();
    const userRole = (user as any)?.role || "mechanic";
    const navigation = getNavigationItems(userRole).map(item => ({...item, icon: iconMap[item.icon as keyof typeof iconMap], tKey: t(item.tKey) }));

    const getPositionStyles = () => {
        return { top: '80px', left: '20px' };
    };
    
    return (
        <AnimatePresence>
            {isSidebarOpen && (
                <Fragment>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/40"
                        onClick={() => setSidebarOpen(false)} 
                    />
                    <motion.div
                        variants={containerVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        style={getPositionStyles()}
                        className="fixed z-50 flex flex-col items-center gap-3 p-4 max-h-[calc(100vh-100px)] overflow-y-auto scrollbar-glassy"
                    >
                        {navigation.map((item, index) => (
                           <NavItemPill 
                                key={item.tKey} 
                                item={item} 
                                onClick={() => setSidebarOpen(false)} 
                                variants={itemVariants} 
                                custom={index}
                           />
                        ))}
                    </motion.div>
                </Fragment>
            )}
        </AnimatePresence>
    )
}
