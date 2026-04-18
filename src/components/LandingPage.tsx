import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Globe, 
  Zap, 
  Cloud, 
  ArrowRight, 
  Lock, 
  BarChart3, 
  RefreshCw,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  t: (key: any) => string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, t }) => {
  return (
    <div className="min-h-screen bg-[#f5f5f4] text-[#0a0a0a] font-sans selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-8 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-black/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full" />
          </div>
          <span className="text-xl font-bold tracking-tighter uppercase text-black">Liminality</span>
        </div>
        <button 
          onClick={onGetStarted}
          className="px-6 py-2 bg-black text-white rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform"
        >
          {t('getStarted')}
        </button>
      </nav>

      {/* Hero Section */}
      <main className="grid lg:grid-cols-2 min-h-screen pt-24 lg:pt-0">
        <div className="flex flex-col justify-center px-8 lg:px-24 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t('privateBeta')}
            </div>
            <h1 className="text-6xl lg:text-[84px] leading-[0.9] font-bold tracking-tight mb-8">
              {t('decisionEngineTitle') || 'Personal Wealth Decision Engine.'}
            </h1>
            <p className="text-lg text-gray-500 max-w-md leading-relaxed mb-12">
              {t('engineTagline') || 'Automated cross-border tax mastery for global citizens. Navigate US-Taiwan complexities with confidence.'}
              <br/><br/>
              <span className="text-sm font-bold uppercase tracking-widest text-black">{t('simplePrivateAutonomous')}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onGetStarted}
                className="group px-8 py-5 bg-black text-white rounded-2xl text-sm font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all flex items-center justify-center gap-3"
              >
                {t('getStarted')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center gap-4 px-6 py-5 rounded-2xl border border-black/10 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <ShieldCheck className="w-4 h-4" />
                {t('noDataLeaves')}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative bg-black flex items-center justify-center overflow-hidden p-8 lg:p-24">
          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]" />
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="relative z-10 w-full max-w-md aspect-[4/5] bg-[#1a1a1a] rounded-[40px] border border-white/10 shadow-2xl p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
              </div>
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-bold uppercase tracking-widest text-white/50">
                {t('dashboardPreview')}
              </div>
            </div>

            <div className="space-y-6">
              <div className="h-32 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 p-6">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2">{t('netWorth')}</div>
                <div className="text-3xl font-bold text-white">$124,500.00</div>
                <div className="flex items-center gap-2 mt-2 text-emerald-400 text-[10px] font-bold">
                  <Zap className="w-3 h-3" />
                  +12.4% {t('thisMonth')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-[8px] text-white/30 uppercase tracking-widest mb-1">{t('usdAssets')}</div>
                  <div className="text-sm font-bold text-white">$85,200</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-[8px] text-white/30 uppercase tracking-widest mb-1">{t('twdAssets')}</div>
                  <div className="text-sm font-bold text-white">NT$1.2M</div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-1.5 bg-blue-500 rounded-lg">
                    <BarChart3 className="w-3 h-3 text-white" />
                  </div>
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{t('aiStrategy')}</div>
                </div>
                <div className="text-[11px] text-white/70 leading-relaxed">
                  {t('fxStrategyAdvice')}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-white/20" />
                <div className="text-[8px] text-white/20 uppercase tracking-widest font-bold">{t('syncedToDrive')}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section className="px-8 lg:px-24 py-32 border-t border-black/5">
        <div className="grid md:grid-cols-3 gap-16">
          <div>
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-8">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">{t('encryptionAES')}</h3>
            <p className="text-gray-500 leading-relaxed">
              {t('encryptionDesc')}
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-8">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">{t('taglineCrossBorder')}</h3>
            <p className="text-gray-500 leading-relaxed">
              {t('globalCitizenDesc')}
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-8">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">{t('aiMinion')}</h3>
            <p className="text-gray-500 leading-relaxed">
              {t('aiMinionDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="px-8 lg:px-24 py-32 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-8">
                <ShieldCheck className="w-3 h-3" />
                {t('militaryGrade')}
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter uppercase mb-8">
                {t('yourDataYourKeys')}
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed mb-12">
                {t('securityDesc')}
              </p>
              <div className="space-y-6">
                {[
                  { title: t('clientSideEnc'), desc: t('clientSideDesc') },
                  { title: t('zeroKnowledge'), desc: t('zeroKnowledgeDesc') },
                  { title: t('standardProtocols'), desc: t('standardProtocolsDesc') }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-black uppercase tracking-tight">{item.title}</h4>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-black rounded-[60px] flex items-center justify-center overflow-hidden">
                <motion.div 
                  animate={{ 
                    rotate: [0, 90, 180, 270, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-64 h-64 border border-white/10 rounded-full flex items-center justify-center"
                >
                  <div className="w-48 h-48 border border-white/20 rounded-full flex items-center justify-center">
                    <div className="w-32 h-32 border border-white/40 rounded-full flex items-center justify-center" />
                  </div>
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-black text-white px-8 lg:px-24 py-32">
        <div className="max-w-4xl">
          <h2 className="text-4xl lg:text-6xl font-bold mb-24 tracking-tighter uppercase">{t('howItWorks')}</h2>
          
          <div className="space-y-24">
            <div className="flex gap-12 items-start">
              <div className="text-6xl font-bold text-white/10 font-serif italic">01</div>
              <div>
                <h4 className="text-2xl font-bold mb-4 uppercase tracking-tight">{t('step1')}</h4>
                <p className="text-white/50 text-lg leading-relaxed max-w-md">
                  {t('step1Desc')}
                </p>
              </div>
            </div>

            <div className="flex gap-12 items-start">
              <div className="text-6xl font-bold text-white/10 font-serif italic">02</div>
              <div>
                <h4 className="text-2xl font-bold mb-4 uppercase tracking-tight">{t('step2')}</h4>
                <p className="text-white/50 text-lg leading-relaxed max-w-md">
                  {t('step2Desc')}
                </p>
              </div>
            </div>

            <div className="flex gap-12 items-start">
              <div className="text-6xl font-bold text-white/10 font-serif italic">03</div>
              <div>
                <h4 className="text-2xl font-bold mb-4 uppercase tracking-tight">{t('step3')}</h4>
                <p className="text-white/50 text-lg leading-relaxed max-w-md">
                  {t('step3Desc')}
                </p>
              </div>
            </div>

            <div className="flex gap-12 items-start">
              <div className="text-6xl font-bold text-white/10 font-serif italic">04</div>
              <div>
                <h4 className="text-2xl font-bold mb-4 uppercase tracking-tight">{t('step4')}</h4>
                <p className="text-white/50 text-lg leading-relaxed max-w-md">
                  {t('step4Desc')}
                </p>
              </div>
            </div>

            <div className="flex gap-12 items-start">
              <div className="text-6xl font-bold text-white/10 font-serif italic">05</div>
              <div>
                <h4 className="text-2xl font-bold mb-4 uppercase tracking-tight">{t('step5')}</h4>
                <p className="text-white/50 text-lg leading-relaxed max-w-md">
                  {t('step5Desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 lg:px-24 py-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
          © 2026 Liminality Wealth Engine. {t('taglineGlobalCitizen')}
        </div>
        <div className="flex gap-8">
          <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">{t('privacy')}</a>
          <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">{t('terms')}</a>
          <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">{t('security')}</a>
        </div>
      </footer>
    </div>
  );
};
