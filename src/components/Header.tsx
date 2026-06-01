import React, { useState } from 'react';
import { 
  Sparkles, 
  Palette, 
  Sun, 
  Moon, 
  Globe, 
  Bell, 
  CloudRain, 
  CloudLightning, 
  CloudLightning as CloudIcon, 
  RefreshCw, 
  LogOut, 
  User as UserIcon,
  ShieldCheck,
  Check,
  Trash2
} from 'lucide-react';
import { ThemeConfig, SystemNotification, User } from '../types';

interface HeaderProps {
  themeConfig: ThemeConfig;
  setThemeConfig: (config: ThemeConfig) => void;
  currentUser: User | null;
  isAdmin: boolean;
  onLogout: () => void;
  notifications: SystemNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  onClearNotifications: () => void;
  onSyncCloud: () => void;
  isSyncing: boolean;
  lastSynced: string | null;
}

export default function Header({
  themeConfig,
  setThemeConfig,
  currentUser,
  isAdmin,
  onLogout,
  notifications,
  onMarkNotificationAsRead,
  onClearNotifications,
  onSyncCloud,
  isSyncing,
  lastSynced
}: HeaderProps) {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const palettes: { id: ThemeConfig['palette']; name: string; class: string }[] = [
    { id: 'blue', name: 'Ocean Blue', class: 'bg-blue-600' },
    { id: 'emerald', name: 'Neon Mint', class: 'bg-emerald-600' },
    { id: 'rose', name: 'Rose Quartz', class: 'bg-rose-600' },
    { id: 'amber', name: 'Sunset Amber', class: 'bg-amber-600' },
    { id: 'violet', name: 'Deep Violet', class: 'bg-violet-600' },
    { id: 'slate', name: 'Industrial Slate', class: 'bg-slate-600' }
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Translation helpers
  const t = {
    tr: {
      title: 'MBG Ai42',
      theme: 'Tema Rengi',
      notifications: 'Bildirimler',
      noNotifs: 'Hiç bildirim yok',
      markAllRead: 'Tümünü Temizle',
      backup: 'Bulut Yedekleme',
      syncBtn: 'Yedekle',
      synced: 'Eşitlendi',
      syncing: 'Eşitleniyor...',
      neverSynced: 'Hiç yedeklenmedi',
      logout: 'Çıkış Yap',
      admin: 'Yönetici',
      user: 'Kullanıcı'
    },
    en: {
      title: 'MBG Ai42',
      theme: 'Theme Color',
      notifications: 'Notifications',
      noNotifs: 'No notifications',
      markAllRead: 'Clear All',
      backup: 'Cloud Sync',
      syncBtn: 'Backup',
      synced: 'Synced',
      syncing: 'Syncing...',
      neverSynced: 'Never backed up',
      logout: 'Logout',
      admin: 'Administrator',
      user: 'User'
    }
  }[themeConfig.lang];

  const toggleMode = () => {
    setThemeConfig({
      ...themeConfig,
      mode: themeConfig.mode === 'dark' ? 'light' : 'dark'
    });
  };

  const handlePaletteSelect = (pal: ThemeConfig['palette']) => {
    setThemeConfig({
      ...themeConfig,
      palette: pal
    });
    setShowThemeMenu(false);
  };

  const handleLangSelect = (lang: ThemeConfig['lang']) => {
    setThemeConfig({
      ...themeConfig,
      lang: lang
    });
    setShowLangMenu(false);
  };

  return (
    <header className="relative w-full border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 py-3 z-40 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left Side: Current session indicator / cloud status */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-zinc-800 px-2.5 py-1.5 rounded-full dark:text-zinc-300">
              {isAdmin ? (
                <ShieldCheck size={14} className="text-amber-500 animate-pulse" />
              ) : (
                <UserIcon size={14} className="text-zinc-500" />
              )}
              <span className="font-medium hidden md:inline">
                {isAdmin ? t.admin : currentUser.name}
              </span>
            </div>
          )}

          {/* Secure Cloud Sync widget */}
          {currentUser && (
            <div className="flex items-center gap-2">
              <button
                onClick={onSyncCloud}
                disabled={isSyncing}
                title={t.backup}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                  isSyncing 
                    ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' 
                    : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                }`}
              >
                <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">
                  {isSyncing ? t.syncing : t.syncBtn}
                </span>
              </button>
              {lastSynced && (
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 hidden lg:inline">
                  {t.synced}: {new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Center: MANDATORY MBG Ai42 Title and Emblem on every screen */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center select-none pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="p-1 px-1.5 bg-gradient-to-tr from-sky-500 to-primary-600 text-white rounded-lg text-sm font-black flex items-center justify-center shadow-md shadow-primary-500/20">
              Ai42
            </span>
            <h1 className="text-lg md:text-xl font-black tracking-tight bg-gradient-to-r from-gray-900 via-primary-950 to-gray-900 dark:from-white dark:via-zinc-200 dark:to-white bg-clip-text text-transparent uppercase">
              {t.title}
            </h1>
          </div>
          <p className="text-[9px] font-mono tracking-widest text-primary-500 dark:text-primary-400 uppercase font-bold -mt-0.5">
            ● SECURED LOCAL-CLOUD DUAL NODE ●
          </p>
        </div>

        {/* Right Side: Theme, Language, Notifications, Logout Toggles */}
        <div className="flex items-center gap-2">
          {/* Palette selector */}
          <div className="relative">
            <button
              onClick={() => { setShowThemeMenu(!showThemeMenu); setShowLangMenu(false); setShowNotifMenu(false); }}
              className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              title={t.theme}
            >
              <Palette size={18} />
            </button>
            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <span className="text-xs font-semibold text-zinc-400 block px-2 mb-2">{t.theme}</span>
                <div className="grid grid-cols-3 gap-2">
                  {palettes.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handlePaletteSelect(p.id)}
                      className={`h-9 rounded-lg flex items-center justify-center text-white font-bold transition-all transform hover:scale-105 shadow-sm ${p.class} relative ${themeConfig.palette === p.id ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-zinc-900' : ''}`}
                      title={p.name}
                    >
                      {themeConfig.palette === p.id && <Check size={14} className="drop-shadow-md" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Light/Dark Mode Switch */}
          <button
            onClick={toggleMode}
            className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="Light / Dark"
          >
            {themeConfig.mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Language Switch */}
          <div className="relative">
            <button
              onClick={() => { setShowLangMenu(!showLangMenu); setShowThemeMenu(false); setShowNotifMenu(false); }}
              className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="Language"
            >
              <Globe size={18} />
            </button>
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => handleLangSelect('tr')}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-white ${themeConfig.lang === 'tr' ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600' : ''}`}
                >
                  <span>Türkçe (TR)</span>
                  {themeConfig.lang === 'tr' && <Check size={12} />}
                </button>
                <button
                  onClick={() => handleLangSelect('en')}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-white ${themeConfig.lang === 'en' ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600' : ''}`}
                >
                  <span>English (EN)</span>
                  {themeConfig.lang === 'en' && <Check size={12} />}
                </button>
              </div>
            )}
          </div>

          {/* Instant System Notifications Popup */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifMenu(!showNotifMenu); setShowThemeMenu(false); setShowLangMenu(false); }}
              className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors relative cursor-pointer"
              title={t.notifications}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-3 z-50 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{t.notifications}</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={onClearNotifications}
                      className="text-[10px] text-rose-500 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={10} />
                      {t.markAllRead}
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="text-zinc-400 text-xs text-center py-6">{t.noNotifs}</div>
                ) : (
                  <div className="space-y-1.5">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => onMarkNotificationAsRead(n.id)}
                        className={`p-2.5 rounded-lg text-xs transition-colors cursor-pointer border ${
                          n.isRead 
                            ? 'bg-zinc-50/50 dark:bg-zinc-900/30 border-transparent text-zinc-400 dark:text-zinc-500' 
                            : 'bg-primary-50/60 dark:bg-primary-950/20 border-primary-100 dark:border-primary-950/40 text-zinc-800 dark:text-zinc-200'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1 pb-1">
                          <span className={`font-semibold text-[10px] uppercase tracking-wider px-1 py-0.2 rounded ${
                            n.type === 'forgot_password' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' :
                            n.type === 'backup' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
                            'bg-primary-100 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300'
                          }`}>
                            {n.type}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="line-clamp-3">{n.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Logout Trigger button */}
          {currentUser && (
            <button
              onClick={onLogout}
              className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
              title={t.logout}
            >
              <LogOut size={18} />
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
