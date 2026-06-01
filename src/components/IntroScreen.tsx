import React from 'react';
import { 
  Sparkles, 
  Database, 
  Lock, 
  Cpu, 
  ArrowRight, 
  Layers, 
  Compass, 
  BarChart4 
} from 'lucide-react';
import { ThemeConfig } from '../types';

interface IntroScreenProps {
  onNext: () => void;
  themeConfig: ThemeConfig;
}

export default function IntroScreen({ onNext, themeConfig }: IntroScreenProps) {
  const isTr = themeConfig.lang === 'tr';

  const t = {
    welcome: isTr ? 'MBG Ai42 Dünyasına Hoş Geldiniz' : 'Welcome to MBG Ai42 Universe',
    tagline: isTr 
      ? 'Gelişmiş 8K Çözünürlüklü Yapay Zeka Görsel Üretim ve Prompt Yönetim Platformu' 
      : 'Advanced 8K AI Image Generation and Prompt Management Engine',
    btnStart: isTr ? 'Sisteme Giriş Yap / Hızlı Giriş' : 'Sign In / Secure Gate',
    flowTitle: isTr ? 'Sistem Çalışma Akışı' : 'System Architecture Flow',
    
    step1Title: isTr ? '1. Akıllı Prompt Yazım Alanı' : '1. Smart Semantic Input',
    step1Desc: isTr 
      ? 'Kendi promplarınızı oluşturun, kategorilere ayırın veya sistemin alternatif promplarını tek tıkla tercih edin.' 
      : 'Author customized prompts, organize selections, or fetch system suggestions instantly.',

    step2Title: isTr ? '2. Çoklu Referans ve Düzenleme' : '2. Multi-Ref & Canvas Align',
    step2Desc: isTr 
      ? 'Görsel üretimine girdi olarak 5 adede kadar referans resim veya tam üzerinde çalışmak için 1 adet düzenleme resmi yükleyin.' 
      : 'Attach up to 5 aesthetic reference templates or supply 1 focal canvas edit image.',

    step3Title: isTr ? '3. Üçlü Yapay Zeka Çekirdeği' : '3. Triple AI Engine Pipeline',
    step3Desc: isTr 
      ? 'Süreç Nano Banana Pro ile başlar. Başarısız olunursa Nano Banana 2 denenir; nihai olarak Fallback AI kararlı üretim yapar.' 
      : 'Runs Nano Banana Pro pipeline first. Transitions to Nano Banana 2 on retry, using Fallback AI as final solver.',

    step4Title: isTr ? '4. Yerel Şifreleme ve Bulut Yedek' : '4. Secured Device Encryption',
    step4Desc: isTr 
      ? 'Tüm verileriniz cihazda yerel anahtarla şifrelenir. Güvenlik katmanı ile bulut sunucularımıza uçtan uca şifreli yedeklenir.' 
      : 'All data is cryptographically cached on device. Synced end-to-end to secure cloud clusters.'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-4 py-8 max-w-5xl mx-auto">
      
      {/* Hero Welcome Unit */}
      <div className="text-center max-w-3xl mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-950/40 rounded-full text-primary-600 dark:text-primary-400 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles size={12} className="animate-pulse" />
          <span>{isTr ? 'Yeni Nesil Yapay Zeka Tasarlayıcı' : 'Next-Generation Artificer'}</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 dark:text-white leading-tight">
          {t.welcome}
        </h2>
        
        <p className="mt-4 text-base md:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans font-medium">
          {t.tagline}
        </p>
      </div>

      {/* Grid: App Flow Explanation */}
      <div className="w-full">
        <h3 className="text-xs uppercase tracking-widest font-mono font-bold text-center text-zinc-400 mb-8 flex items-center justify-center gap-2">
          <Layers size={14} />
          {t.flowTitle}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-md shadow-zinc-100/30 dark:shadow-none hover:border-primary-400 dark:hover:border-primary-800 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4 font-bold">
              <Compass size={20} className="group-hover:rotate-45 transition-transform" />
            </div>
            <h4 className="font-bold text-base text-zinc-900 dark:text-white mb-2">{t.step1Title}</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{t.step1Desc}</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-md shadow-zinc-100/30 dark:shadow-none hover:border-primary-400 dark:hover:border-primary-800 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4 font-bold">
              <Layers size={20} className="group-hover:translate-y-0.5 transition-transform" />
            </div>
            <h4 className="font-bold text-base text-zinc-900 dark:text-white mb-2">{t.step2Title}</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{t.step2Desc}</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-md shadow-zinc-100/30 dark:shadow-none hover:border-primary-400 dark:hover:border-primary-800 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4 font-bold">
              <Cpu size={20} className="group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="font-bold text-base text-zinc-900 dark:text-white mb-2">{t.step3Title}</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{t.step3Desc}</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-md shadow-zinc-100/30 dark:shadow-none hover:border-primary-400 dark:hover:border-primary-800 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4 font-bold">
              <Lock size={20} className="group-hover:animate-pulse" />
            </div>
            <h4 className="font-bold text-base text-zinc-900 dark:text-white mb-2">{t.step4Title}</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{t.step4Desc}</p>
          </div>
        </div>
      </div>

      {/* Bottom CTA Block */}
      <div className="w-full flex justify-center mt-4">
        <button
          onClick={onNext}
          className="relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 via-sky-600 to-primary-700 text-white font-bold text-base rounded-2xl cursor-pointer shadow-lg hover:shadow-primary-500/20 active:scale-95 transition-all text-center"
        >
          <span>{t.btnStart}</span>
          <ArrowRight size={18} />
        </button>
      </div>

    </div>
  );
}
