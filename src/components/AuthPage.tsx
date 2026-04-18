import React from 'react';
import { motion } from 'motion/react';
import { Globe, ShieldCheck, RefreshCw } from 'lucide-react';

interface AuthPageProps {
  onLogin: () => void;
  isLoggingIn: boolean;
  onBack: () => void;
  t: (key: any) => string;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, isLoggingIn, onBack, t }) => {
  return (
    <div className="min-h-screen bg-[#f5f5f4] flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-12 max-w-lg w-full text-center relative overflow-hidden bg-white rounded-[2.5rem] shadow-2xl border border-black/5"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-black" />
        
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-2"
        >
          ← {t('back')}
        </button>

        <div className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center text-white mx-auto mb-10 shadow-2xl transform -rotate-6">
          <Globe className="w-12 h-12" />
        </div>
        
        <h1 className="text-4xl font-black text-[#0a0a0a] mb-4 tracking-tighter uppercase">Liminality</h1>
        <p className="text-gray-500 mb-12 text-base font-medium leading-relaxed">
          {t('tagline')}<br/>
          <span className="text-black font-bold">{t('taglineCrossBorder')}</span><br/>
          {t('taglineGlobalCitizen')}
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={onLogin}
            disabled={isLoggingIn}
            className="w-full py-5 bg-black text-white text-[10px] font-bold rounded-2xl uppercase tracking-[0.2em] hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
          >
            {isLoggingIn ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Globe className="w-4 h-4" />
            )}
            {isLoggingIn ? t('loggingIn') : t('loginWithGoogle')}
          </button>
          
          <div className="flex items-center gap-4 py-4 px-6 bg-gray-50 rounded-2xl border border-gray-100">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <div className="text-left">
              <p className="text-[10px] font-bold text-black uppercase tracking-widest">{t('encryptionAES')}</p>
              <p className="text-[9px] text-gray-400 font-medium">{t('encryptionDesc')}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center gap-8">
          <div className="flex flex-col items-center gap-1">
            <div className="text-[10px] font-bold text-black">100%</div>
            <div className="text-[8px] text-gray-400 uppercase tracking-widest">{t('private')}</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="text-[10px] font-bold text-black">AI</div>
            <div className="text-[8px] text-gray-400 uppercase tracking-widest">{t('powered')}</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="text-[10px] font-bold text-black">24/7</div>
            <div className="text-[8px] text-gray-400 uppercase tracking-widest">{t('automated')}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
