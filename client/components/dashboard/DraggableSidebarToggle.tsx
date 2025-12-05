"use client";

import { motion, PanInfo } from "framer-motion";
import { Menu } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface DraggableSidebarToggleProps {
  onOpen: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
}

export default function DraggableSidebarToggle({ onOpen, onPositionChange }: DraggableSidebarToggleProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const constraintsRef = useRef(null);

  useEffect(() => {
    // This effect runs only once on the client to set the initial position
    const savedPos = localStorage.getItem('sidebar-toggle-pos');
    let initialPos;

    const buttonSize = 56; // h-14 w-14
    const padding = 16; // 1rem
    const rightEdge = window.innerWidth - buttonSize - padding;
    const bottomEdge = window.innerHeight - buttonSize - padding;

    if (savedPos) {
      try {
        const pos = JSON.parse(savedPos);
        // Ensure saved position is within viewport bounds
        initialPos = {
            x: Math.min(Math.max(pos.x, padding), rightEdge),
            y: Math.min(Math.max(pos.y, padding), bottomEdge),
        };
      } catch (e) {
        initialPos = { x: rightEdge, y: bottomEdge };
      }
    } else {
      initialPos = { x: rightEdge, y: bottomEdge };
    }
    setPosition(initialPos);
    onPositionChange(initialPos);
  }, [onPositionChange]);


  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    onPositionChange(info.point);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    localStorage.setItem('sidebar-toggle-pos', JSON.stringify(info.point));
  };
  
  if (!position) {
    return null; // Render nothing until position is determined on the client
  }

  return (
    <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-50">
        <motion.div
            id="tour-step-3-nav-button"
            className="absolute pointer-events-auto"
            style={{ x: position.x, y: position.y }}
            onTap={onOpen}
            drag
            dragConstraints={constraintsRef}
            dragMomentum={false}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95, cursor: "grabbing" }}
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 dark:bg-gray-800/20 text-foreground/80 shadow-lg backdrop-blur-md border border-white/30 dark:border-white/10 cursor-grab">
                <Menu className="h-6 w-6" />
            </div>
        </motion.div>
    </div>
  );
}