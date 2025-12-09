"use client";
import { motion, AnimatePresence } from 'framer-motion';

interface PlugAnimationProps {
  status: 'operational' | 'degraded' | 'outage' | 'checking';
}

const operationalColor = "#22c55e"; // green-500
const degradedColor = "#f59e0b"; // amber-500
const outageColor = "#ef4444"; // red-500
const checkingColor = "#3b82f6"; // blue-500

export default function PlugAnimation({ status }: PlugAnimationProps) {
  const statusConfig = {
    operational: {
      plugX: 0,
      socketX: 0,
      sparksOpacity: 0,
      glowOpacity: 0.7,
      color: operationalColor,
    },
    degraded: {
      plugX: 0,
      socketX: 0,
      sparksOpacity: 0,
      glowOpacity: 0.5,
      color: degradedColor,
    },
    outage: {
      plugX: -10,
      socketX: 10,
      sparksOpacity: 1,
      glowOpacity: 0,
      color: outageColor,
    },
    checking: {
      plugX: -5,
      socketX: 5,
      sparksOpacity: 0.8,
      glowOpacity: 0,
      color: checkingColor,
    },
  };

  const config = statusConfig[status];

  return (
    <div className="w-16 h-16 flex items-center justify-center">
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <AnimatePresence>
          {status === 'operational' && (
             <motion.circle
              cx="30" cy="30" r="10" fill={config.color}
              initial={{ scale: 0 }}
              animate={{ scale: 1, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
              exit={{ scale: 0 }}
            >
              <animate attributeName="r" values="10;12;10" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
            </motion.circle>
          )}
        </AnimatePresence>
        
        {/* The Plug */}
        <motion.g animate={{ x: config.plugX }}>
          <path d="M 20 25 L 30 25 L 30 20 L 35 30 L 30 40 L 30 35 L 20 35 Z" fill={config.color} />
        </motion.g>

        {/* The Socket */}
        <motion.g animate={{ x: config.socketX }}>
          <path d="M 40 25 L 50 25 L 50 35 L 40 35 Z M 45 28 L 45 32" stroke={config.color} strokeWidth="2" />
        </motion.g>

        {/* Sparks for outage/checking */}
        <AnimatePresence>
          {(status === 'outage' || status === 'checking') && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.2 } }}
              exit={{ opacity: 0 }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.line
                  key={i}
                  x1={35 + (Math.random() - 0.5) * 4}
                  y1={30 + (Math.random() - 0.5) * 8}
                  x2={40 + (Math.random() - 0.5) * 4}
                  y2={30 + (Math.random() - 0.5) * 8}
                  stroke={config.color}
                  strokeWidth="1.5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                  transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        {/* Flicker for degraded */}
        <AnimatePresence>
          {status === 'degraded' && (
            <motion.path
              d="M 20 25 L 30 25 L 30 20 L 35 30 L 30 40 L 30 35 L 20 35 Z"
              fill={config.color}
              initial={{ opacity: 1 }}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 0.2, repeat: Infinity }}
            />
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}
