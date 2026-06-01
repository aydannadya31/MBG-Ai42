import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  UserPlus, 
  LogIn, 
  Chrome, 
  Apple, 
  ShieldCheck, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { ThemeConfig, User } from '../types';
import { getGoogleDriveToken } from '../firebase';

interface LoginScreenProps {
  onLoginSuccess: (user: User, isAdmin: boolean) => void;
  lang: ThemeConfig['lang'];
  existingUsers: User[];
  adminPasswordCurrent: string;
}

export default function LoginScreen({ 
  onLoginSuccess, 
  lang, 
  existingUsers,
  adminPasswordCurrent
}: LoginScreenProps) {
  const isTr = lang === 'tr';

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [oauthPassword, setOauthPassword] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const t = {
    signInTab: isTr ? 'Giriş Yap' : 'Sign In',
    signUpTab: isTr ? 'Kayıt Ol' : 'Register',
    emailLabel: isTr ? 'E-Posta Adresi' : 'Email Address',
    nameLabel: isTr ? 'Adınız Soyadınız' : 'Full Name',
    passLabel: isTr ? 'Şifre' : 'Password',
    forgotPass: isTr ? 'Şifremi Unuttum?' : 'Forgot Password?',
    fastLogin: isTr ? 'Veya Tek Tıkla Giriş Yap' : 'Or Fast Login with One Click',
    btnGoogle: isTr ? 'Google ile Hızlı Giriş' : 'Sign In with Google',
    btnApple: isTr ? 'Apple ile Hızlı Giriş' : 'Sign In with Apple',
    btnAction: isTr ? 'Devam Et / Onayla' : 'Proceed / Confirm',
    adminOverride: isTr ? 'Yönetici Şifresi ile Güvenli Giriş' : 'Manager Secure Access Core',
    adminBtn: isTr ? 'Yönetici Paneline Gir' : 'Enter Manager Terminal',
    mailFormatError: isTr 
      ? 'Lütfen geçerli bir e-posta adresi yazın! (Örn: isim@domain.com)' 
      : 'Please write a valid email address! (e.g. name@domain.com)',
    fillAll: isTr ? 'Lütfen gerekli alanları doldurun!' : 'Please fill out all required fields!',
    userExists: isTr ? 'Bu e-posta adresiyle kayıtlı bir kullanıcı zaten mevcut.' : 'A user is already registered with this email.',
    invalidCreds: isTr ? 'Hata: E-posta veya şifre yanlış.' : 'Error: Invalid email or password.',
    regSuccess: isTr ? 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.' : 'Registration successful! You can now sign in.',
    forgotAlert: isTr 
      ? 'Şifre talebiniz Yöneticiye iletilmiştir, en kısa sürede Kayıt olduğunuz mail adresinize şifre bildiriminiz yapılacaktır'
      : 'Your password reset request has been sent to the administrator, password notification will be processed soon to your registered email address.'
  };

  // True email format validator rule (Turkish check)
  const isValidEmail = (addr: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(addr);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!email || !password || (activeTab === 'signup' && !name)) {
      setErrorMessage(t.fillAll);
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage(t.mailFormatError);
      return;
    }

    if (activeTab === 'signup') {
      const exists = existingUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        setErrorMessage(t.userExists);
        return;
      }

      // Register new user successfully
      const newUser: User = {
        id: 'usr_' + Math.random().toString(36).substr(2, 9),
        email: email,
        password: password,
        name: name,
        provider: 'email',
        joinedAt: new Date().toISOString()
      };

      // Mock update & log in
      onLoginSuccess(newUser, false);
      setInfoMessage(t.regSuccess);
    } else {
      // Sign in check
      const matched = existingUsers.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (matched) {
        onLoginSuccess(matched, false);
      } else {
        setErrorMessage(t.invalidCreds);
      }
    }
  };

  // 1-Click login simulations
  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setErrorMessage('');
    setInfoMessage('');
    const enteredPassword = oauthPassword || password;
    if (provider === 'google') {
      try {
        const authData = await getGoogleDriveToken();
        if (authData) {
          const matched = existingUsers.find(u => u.email.toLowerCase() === authData.email.toLowerCase());
          const googleUser: User = matched ? {
            ...matched,
            googleAccessToken: authData.accessToken,
            password: enteredPassword || matched.password
          } : {
            id: `usr_google_${Math.random().toString(36).substr(2, 9)}`,
            email: authData.email,
            name: authData.name,
            provider: 'google',
            joinedAt: new Date().toISOString(),
            googleAccessToken: authData.accessToken,
            password: enteredPassword
          };
          onLoginSuccess(googleUser, false);
        }
      } catch (err: any) {
        setErrorMessage(isTr 
          ? `Google ile giriş başarısız: ${err?.message || err}`
          : `Google Sign-in failed: ${err?.message || err}`
        );
      }
    } else {
      const randomSeed = Math.floor(Math.random() * 100);
      const email = `${provider}_user${randomSeed}@mbgai42.com`;
      const name = `Apple Kullanıcısı #${randomSeed}`;
      const matched = existingUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      const mockUser: User = matched ? {
        ...matched,
        password: enteredPassword || matched.password
      } : {
        id: `usr_${provider}_${randomSeed}`,
        email: email,
        name: name,
        provider: provider,
        joinedAt: new Date().toISOString(),
        password: enteredPassword
      };
      onLoginSuccess(mockUser, false);
    }
  };

  // Forgot password handler
  const handleForgotPassword = async () => {
    setErrorMessage('');
    setInfoMessage('');

    if (!email || !isValidEmail(email)) {
      setErrorMessage(t.mailFormatError);
      return;
    }

    try {
      await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      setInfoMessage(t.forgotAlert);
    } catch (e) {
      console.error(e);
      // fallback mock response
      setInfoMessage(t.forgotAlert);
    }
  };



  // Admin secure bypass password handler
  const handleAdminAccess = () => {
    setErrorMessage('');
    setInfoMessage('');
    if (!adminPass) {
      setErrorMessage(isTr ? 'Lütfen yönetici şifresini yazın!' : 'Please fill the admin password!');
      return;
    }

    if (adminPass === adminPasswordCurrent) {
      const adminUser: User = {
        id: 'usr_admin',
        email: 'admin@mbgai42.com',
        name: 'Sistem Yöneticisi',
        provider: 'email',
        joinedAt: new Date().toISOString()
      };
      onLoginSuccess(adminUser, true);
    } else {
      setErrorMessage(isTr ? 'Hatalı yönetici şifresi!' : 'Incorrect administrator credentials!');
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-[calc(100vh-140px)] max-w-md mx-auto px-4 py-8 relative">
      
      {/* Dynamic Tab Switcher */}
      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 flex items-center mb-6">
        <button
          onClick={() => { setActiveTab('signin'); setErrorMessage(''); setInfoMessage(''); }}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'signin' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'}`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <LogIn size={13} />
            {t.signInTab}
          </span>
        </button>
        <button
          onClick={() => { setActiveTab('signup'); setErrorMessage(''); setInfoMessage(''); }}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'signup' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'}`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <UserPlus size={13} />
            {t.signUpTab}
          </span>
        </button>
      </div>

      {/* Main Authentication Box */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-6 md:p-8">
        
        {errorMessage && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/30 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-xs flex items-start gap-2.5 mb-5 font-medium animate-shake">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {infoMessage && (
          <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-950/30 text-primary-600 dark:text-primary-400 p-3.5 rounded-xl text-xs flex items-start gap-2.5 mb-5 font-semibold leading-relaxed">
            <Info size={15} className="shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        <form onSubmit={handleManualSubmit} className="space-y-4">
          {activeTab === 'signup' && (
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">{t.nameLabel}</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-inner"
                placeholder={isTr ? 'Örn: Ahmet Yılmaz' : 'e.g. John Doe'}
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">{t.emailLabel}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
              <input
                type="text"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrorMessage(''); }}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-inner text-left"
                placeholder="isim@domain.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">{t.passLabel}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-inner"
                placeholder="••••••••"
                required
              />
            </div>
            {activeTab === 'signin' && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[10px] text-primary-500 hover:underline hover:text-primary-600 block mt-1.5 font-bold cursor-pointer"
              >
                {t.forgotPass}
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black tracking-wide shadow-md shadow-primary-500/20 active:scale-95 transition-all mt-6 cursor-pointer"
          >
            {t.btnAction}
          </button>
        </form>

        {/* Rapid OAuth login integration */}
        <div className="relative my-7 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
          </div>
          <span className="relative z-10 px-3 bg-white dark:bg-zinc-950 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            {t.fastLogin}
          </span>
        </div>

        {/* OAuth Password & Warning Box */}
        <div className="mb-5 p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-3">
          <div className="flex items-start gap-2 text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
            <AlertTriangle size={16} className="shrink-0 text-amber-500 mt-0.5" />
            <span>
              <strong>{isTr ? "Önemli Uyarı: " : "Warning: "}</strong>
              {isTr 
                ? "Şifre girişi yapmadığınız taktirde şifrenizi unutmanız durumunda kurtarma işlemi yapılamayacaktır."
                : "If you do not enter a password, recovery cannot be performed in case you forget your password."
              }
            </span>
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
              {isTr ? "Google / Apple Hesap Şifresi" : "Google / Apple Account Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
              <input
                type="password"
                value={oauthPassword}
                onChange={e => setOauthPassword(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-inner"
                placeholder={isTr ? "Hesabınız için şifre belirleyin" : "Set a password for your account"}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleOAuthLogin('google')}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            <Chrome size={14} className="text-colors" />
            <span>Google</span>
          </button>
          <button
            onClick={() => handleOAuthLogin('apple')}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            <Apple size={14} />
            <span>Apple</span>
          </button>
        </div>



      </div>

      {/* Admin Panel Access bottom override - MANDATORY secure login bypass */}
      <div className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/40 rounded-xl p-4 mt-6 text-center shadow-inner">
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1.5 mb-2">
          <ShieldCheck size={12} className="text-amber-500" />
          {t.adminOverride}
        </label>
        <div className="flex gap-2">
          <input
            type="password"
            value={adminPass}
            onChange={e => setAdminPass(e.target.value)}
            className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
            placeholder={isTr ? 'Yönetici Şifresi' : 'Admin Pass'}
          />
          <button
            onClick={handleAdminAccess}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg text-xs font-bold shadow hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            {t.adminBtn}
          </button>
        </div>
      </div>

    </div>
  );
}
