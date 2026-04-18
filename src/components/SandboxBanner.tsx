import React from 'react';
import { ShieldCheck, RefreshCw, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface SandboxBannerProps {
  isActive: boolean;
  onReset: () => Promise<void>;
  t: (key: string) => string;
}

export function SandboxBanner({ isActive, onReset, t }: SandboxBannerProps) {
  if (!isActive) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between sticky top-0 z-[60] shadow-lg"
    >
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-white/20 rounded-lg">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          <p className="text-xs font-bold uppercase tracking-widest">{t('privacySandboxActive')}</p>
          <p className="text-[10px] opacity-90 font-medium">{t('simulationModeDesc')}</p>
        </div>
      </div>
      <button
        onClick={onReset}
        className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
      >
        <XCircle className="w-3 h-3" />
        {t('exitSandbox')}
      </button>
    </motion.div>
  );
}
