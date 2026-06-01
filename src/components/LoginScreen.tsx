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
  Info,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { ThemeConfig, User } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: User, isAdmin: boolean) => void;
  lang: ThemeConfig['lang'];
  existingUsers: User[];
  adminPasswordCurrent: string;
}

interface OAuthModal {
  provider: 'google' | 'apple' | null;
  email: string;
  password: string;
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
  const [adminPass, setAdminPass] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  
  const [oauthModal, setOauthModal] = useState<OAuthModal>({ provider: null, email: '', password: '' });
  const [showOAuthPassword, setShowOAuthPassword] = useState(false);

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
      : 'Your password reset request has been sent to the administrator, password notification will be processed soon to your registered email address.',
    oauthTitle: isTr ? 'Hesap Kaydını Tamamlayın' : 'Complete Account Registration',
    oauthDesc: isTr 
      ? 'Bu sağlayıcı ile giriş yapmak için lütfen bir şifre belirleyin. Bu şifre gelecekte giriş yaparken kullanılacaktır.'
      : 'To sign in with this provider, please set a password. This password will be used for future logins.',
    setPassword: isTr ? 'Hesap Şifresi Belirle' : 'Set Account Password',
    oauthConfirm: isTr ? 'Kaydı Tamamla' : 'Complete Registration',
    passwordRequired: isTr ? 'Lütfen şifre belirleyin!' : 'Please set a password!',
    googleOAuthError: isTr ? 'Google girişi başarısız oldu.' : 'Google sign-in failed.',
    appleOAuthError: isTr ? 'Apple girişi başarısız oldu.' : 'Apple sign-in failed.',
  };

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

      const newUser: User = {
        id: 'usr_' + Math.random().toString(36).substr(2, 9),
        email: email,
        password: password,
        name: name,
        provider: 'email',
        joinedAt: new Date().toISOString()
      };

      onLoginSuccess(newUser, false);
      setInfoMessage(t.regSuccess);
    } else {
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

  // OAuth Login - Opens modal for password setup
  const handleOAuthTrigger = (provider: 'google' | 'apple') => {
    setErrorMessage('');
    setInfoMessage('');
    
    if (provider === 'google') {
      // In production, this would call Google Sign-In SDK
      setOauthModal({ provider: 'google', email: '', password: '' });
    } else if (provider === 'apple') {
      // In production, this would call Apple Sign-In
      setOauthModal({ provider: 'apple', email: '', password: '' });
    }
  };

  // Complete OAuth registration
  const handleOAuthComplete = () => {
    setErrorMessage('');
    
    if (!oauthModal.email || !oauthModal.password) {
      setErrorMessage(t.fillAll);
      return;
    }

    if (!isValidEmail(oauthModal.email)) {
      setErrorMessage(t.mailFormatError);
      return;
    }

    const exists = existingUsers.some(u => u.email.toLowerCase() === oauthModal.email.toLowerCase());
    if (exists) {
      setErrorMessage(t.userExists);
      return;
    }

    const newUser: User = {
      id: `usr_${oauthModal.provider}_${Math.random().toString(36).substr(2, 9)}`,
      email: oauthModal.email,
      password: oauthModal.password,
      name: oauthModal.email.split('@')[0],
      provider: oauthModal.provider as 'google' | 'apple',
      joinedAt: new Date().toISOString()
    };

    onLoginSuccess(newUser, false);
    setOauthModal({ provider: null, email: '', password: '' });
  };

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
      setInfoMessage(t.forgotAlert);
    }
  };

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
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'signin' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <LogIn size={13} />
            {t.signInTab}
          </span>
        </button>
        <button
          onClick={() => { setActiveTab('signup'); setErrorMessage(''); setInfoMessage(''); }}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'signup' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
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
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/30 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-xs flex items-start gap-2.5 mb-5 font-semibold">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {infoMessage && (
          <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-950/30 text-primary-600 dark:text-primary-400 p-3.5 rounded-xl text-xs flex items-start gap-2.5 mb-5 font-semibold">
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
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
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
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
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
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
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

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleOAuthTrigger('google')}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Chrome size={14} />
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={() => handleOAuthTrigger('apple')}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Apple size={14} />
            <span>Apple</span>
          </button>
        </div>
      </div>

      {/* Admin Panel Access */}
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

      {/* OAuth Modal */}
      {oauthModal.provider && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase">
                {t.oauthTitle}
              </h3>
              <button
                onClick={() => setOauthModal({ provider: null, email: '', password: '' })}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-zinc-500"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
              {t.oauthDesc}
            </p>

            {errorMessage && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/30 text-rose-600 dark:text-rose-400 p-2.5 rounded-lg text-xs mb-4 flex items-start gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  value={oauthModal.email}
                  onChange={e => setOauthModal({ ...oauthModal, email: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="isim@domain.com"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  {t.setPassword}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                  <input
                    type={showOAuthPassword ? 'text' : 'password'}
                    value={oauthModal.password}
                    onChange={e => setOauthModal({ ...oauthModal, password: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-9 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOAuthPassword(!showOAuthPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showOAuthPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleOAuthComplete}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-black transition-colors cursor-pointer"
              >
                {t.oauthConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
