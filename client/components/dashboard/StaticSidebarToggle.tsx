"use client";

import { useSidebar } from "@/lib/contexts/SidebarContext";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";

export default function StaticSidebarToggle() {
  const { toggleSidebar } = useSidebar();

  return (
    <motion.button
      onClick={toggleSidebar}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle Sidebar"
    >
      <Menu className="h-6 w-6" />
    </motion.button>
  );
}
