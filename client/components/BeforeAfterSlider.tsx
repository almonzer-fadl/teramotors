"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface BeforeAfterSliderProps {
  before: React.ReactNode;
  after: React.ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function BeforeAfterSlider({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
  className = "",
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateFromClientX = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(8, Math.min(92, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handlePointerDown = useCallback(() => setDragging(true), []);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: PointerEvent) => {
      e.preventDefault();
      updateFromClientX(e.clientX);
    };
    const handleUp = () => setDragging(false);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragging, updateFromClientX]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg ${className}`}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) updateFromClientX(e.clientX);
      }}
    >
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
        {after}
        <span className="absolute bottom-3 left-4 z-10 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm sm:bottom-5 sm:left-5">
          {afterLabel}
        </span>
      </div>

      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        {before}
        <span className="absolute bottom-3 right-4 z-10 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#11100E] backdrop-blur-sm sm:bottom-5 sm:right-5">
          {beforeLabel}
        </span>
      </div>

      <div
        className="absolute inset-y-0 z-20 flex cursor-col-resize items-center justify-center"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        onPointerDown={handlePointerDown}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/10 sm:h-14 sm:w-14">
          <motion.div
            animate={{ x: dragging ? 0 : [0, -2, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex items-center gap-px text-[#11100E]">
              <ArrowLeft className="h-4 w-4" />
              <ArrowRight className="h-4 w-4" />
            </div>
          </motion.div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 z-10 w-px bg-white/60"
        style={{ left: `${position}%` }}
      />
    </div>
  );
}
