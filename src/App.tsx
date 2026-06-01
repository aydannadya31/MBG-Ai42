import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import IntroScreen from './components/IntroScreen';
import LoginScreen from './components/LoginScreen';
import MainWorkspace from './components/MainWorkspace';
import ArchiveWorkspace from './components/ArchiveWorkspace';
import ReportsWorkspace from './components/ReportsWorkspace';
import AdminWorkspace from './components/AdminWorkspace';
import { getGoogleDriveToken, saveBackupToGoogleDrive } from './firebase';

import { 
  User, 
  PromptItem, 
  GenerationRecord, 
  SystemNotification, 
  ThemeConfig, 
  AppStateData 
} from './types';
import { getSecureItem, setSecureItem } from './utils/crypto';

const COLOR_PALETTES: Record<string, Record<string, string>> = {
  blue: {
    '50': '#eff6ff',
    '100': '#dbeafe',
    '200': '#bfdbfe',
    '300': '#93c5fd',
    '400': '#60a5fa',
    '500': '#3b82f6',
    '600': '#2563eb',
    '700': '#1d4ed8',
    '850': '#1d40c0',
    '800': '#1e40af',
    '900': '#1e3a8a',
    '950': '#172554',
  },
  emerald: {
    '50': '#ecfdf5',
    '100': '#d1fae5',
    '200': '#a7f3d0',
    '300': '#6ee7b7',
    '400': '#34d399',
    '500': '#10b981',
    '600': '#059669',
    '700': '#047857',
    '850': '#056a4c',
    '800': '#065f46',
    '900': '#064e3b',
    '950': '#022c22',
  },
  rose: {
    '50': '#fff1f2',
    '100': '#ffe4e6',
    '200': '#fecdd3',
    '300': '#fda4af',
    '400': '#fb7185',
    '500': '#f43f5e',
    '600': '#e11d48',
    '700': '#be123c',
    '850': '#ab1034',
    '800': '#9f1239',
    '900': '#881337',
    '950': '#4c0519',
  },
  amber: {
    '50': '#fffbeb',
    '100': '#fef3c7',
    '200': '#fde68a',
    '300': '#fcd34d',
    '400': '#fbbf24',
    '500': '#f59e0b',
    '600': '#d97706',
    '700': '#b45309',
    '850': '#a04807',
    '800': '#92400e',
    '900': '#78350f',
    '950': '#451a03',
  },
  violet: {
    '50': '#f5f3ff',
    '100': '#ede9fe',
    '200': '#ddd6fe',
    '300': '#c4b5fd',
    '400': '#a78bfa',
    '500': '#8b5cf6',
    '600': '#7c3aed',
    '700': '#6d28d9',
    '850': '#6020c0',
    '800': '#5b21b6',
    '900': '#4c1d95',
    '950': '#2e1065',
  },
  slate: {
    '50': '#f8fafc',
    '100': '#f1f5f9',
    '200': '#e2e8f0',
    '300': '#cbd5e1',
    '400': '#94a3b8',
    '500': '#64748b',
    '600': '#475569',
    '700': '#334155',
    '850': '#2a3545',
    '800': '#1e293b',
    '900': '#0f172a',
    '950': '#020617',
  }
};

export default function App() {
  // 1. Theme Configuration
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    mode: 'dark',
    palette: 'emerald',
    lang: 'tr'
  });

  // 2. Active Screen flow controllers
  // 'intro' -> 'auth' -> 'workspace'
  const [activeScreen, setActiveScreen] = useState<'intro' | 'auth' | 'workspace'>('intro');
  // Selected visual panel if logged in
  const [activeTab, setActiveTab] = useState<'generate' | 'archive' | 'reports' | 'admin'>('generate');

  // 3. User Credentials State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // 4. Central DB lists (synchronized client-side with secure fallback)
  const [users, setUsers] = useState<User[]>([
    {
      id: 'usr_admin',
      email: 'admin@mbgai42.com',
      password: 'admin',
      name: 'Yönetici',
      provider: 'email',
      joinedAt: new Date().toISOString()
    }
  ]);
  const [defaultPrompts, setDefaultPrompts] = useState<PromptItem[]>([
    { id: 'p1', text: 'Neon cyber-cat holographic portrait', isSystem: true, category: 'Futuristic' },
    { id: 'p2', text: 'Golden sunrise majestic mountains geometric peaks landscape', isSystem: true, category: 'Nature' },
    { id: 'p3', text: 'Cyberpunk humanoid robot interface terminal circuit connections', isSystem: true, category: 'Technology' },
    { id: 'p4', text: 'Cosmic celestial wormhole swirl magenta and stardust particles', isSystem: true, category: 'Space' }
  ]);
  const [generations, setGenerations] = useState<GenerationRecord[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'n_initial_01',
      text: 'MBG Ai42 ultra-güvenli yerel şifrelenmiş katman aktif.',
      type: 'system',
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ]);
  const [adminPassword, setAdminPassword] = useState<string>('ag2026');

  // Sync state trackers
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  // ------------------ EFFECTS / LIFE CYCLE ------------------
  
  // A. Load initial system DB on load
  useEffect(() => {
    // 1. Load local preferences first
    const localTheme = localStorage.getItem('mbg_theme_preferences');
    if (localTheme) {
      try {
        setThemeConfig(JSON.parse(localTheme));
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Load secure items cache on-device if exist
    const cachedUsers = getSecureItem<User[]>('users');
    const cachedPrompts = getSecureItem<PromptItem[]>('defaultPrompts');
    const cachedGenerations = getSecureItem<GenerationRecord[]>('generations');
    const cachedNotifs = getSecureItem<SystemNotification[]>('notifications');
    const cachedAdminPass = getSecureItem<string>('adminPassword');
    const cachedLastSync = localStorage.getItem('mbg_last_synced_time');

    if (cachedUsers) setUsers(cachedUsers);
    if (cachedPrompts) setDefaultPrompts(cachedPrompts);
    if (cachedGenerations) setGenerations(cachedGenerations);
    if (cachedNotifs) setNotifications(cachedNotifs);
    if (cachedAdminPass) setAdminPassword(cachedAdminPass);
    if (cachedLastSync) setLastSynced(cachedLastSync);

    // 3. Sync and restore securely from cloud backend in full-stack setup
    const fetchCloudData = async () => {
      try {
        const response = await fetch('/api/db');
        if (response.ok) {
          const dbData: AppStateData = await response.json();
          if (dbData) {
            // Restore missing state or override
            if (dbData.users?.length) setUsers(dbData.users);
            if (dbData.defaultPrompts?.length) setDefaultPrompts(dbData.defaultPrompts);
            if (dbData.generations?.length) setGenerations(dbData.generations);
            if (dbData.notifications?.length) setNotifications(dbData.notifications);
            if (dbData.adminPassword) setAdminPassword(dbData.adminPassword);
            
            // Persist locally too
            setSecureItem('users', dbData.users);
            setSecureItem('defaultPrompts', dbData.defaultPrompts);
            setSecureItem('generations', dbData.generations);
            setSecureItem('notifications', dbData.notifications);
            setSecureItem('adminPassword', dbData.adminPassword);
          }
        }
      } catch (err) {
        console.warn('Cloud sync could not reach backend, running on on-device secure cached values.', err);
      }
    };
    fetchCloudData();
  }, []);

  // B. Save theme mode configurations to body / localStorage dynamically
  useEffect(() => {
    const root = window.document.documentElement;
    if (themeConfig.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Set CSS primary color variables dynamically based on selected palette
    const colors = COLOR_PALETTES[themeConfig.palette] || COLOR_PALETTES.emerald;
    Object.entries(colors).forEach(([weight, value]) => {
      root.style.setProperty(`--primary-${weight}`, value);
    });

    // Palette custom attribute bindings or simple classes
    localStorage.setItem('mbg_theme_preferences', JSON.stringify(themeConfig));
  }, [themeConfig]);

  // C. Update secure cached items automatically when list state changes
  useEffect(() => {
    setSecureItem('users', users);
  }, [users]);

  useEffect(() => {
    setSecureItem('defaultPrompts', defaultPrompts);
  }, [defaultPrompts]);

  useEffect(() => {
    setSecureItem('generations', generations);
  }, [generations]);

  useEffect(() => {
    setSecureItem('notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    setSecureItem('adminPassword', adminPassword);
  }, [adminPassword]);


  // ------------------ HANDLERS ------------------

  // Cloud synchronized trigger - Backup Full DB securely back to the server and Google Drive
  const handleCloudBackup = async () => {
    setIsSyncing(true);
    let token = googleAccessToken;

    // Check if user is logged in with google and we can grab their token
    if (!token && currentUser?.provider === 'google' && currentUser.googleAccessToken) {
      token = currentUser.googleAccessToken;
    }

    // If no token exists, prompt for Google Drive Authorization
    if (!token) {
      try {
        const confirmMsg = themeConfig.lang === 'tr' 
          ? 'Verilerinizi bulut (Google Drive) üzerine güvenle yedeklemek için Google hesabınızı bağlamanız gerekmektedir. Devam edilsin mi?' 
          : 'To securely back up your data to the cloud (Google Drive), you need to connect your Google account. Do you want to proceed?';
        
        const consent = window.confirm(confirmMsg);
        if (!consent) {
          setIsSyncing(false);
          return;
        }

        const authData = await getGoogleDriveToken();
        if (authData?.accessToken) {
          token = authData.accessToken;
          setGoogleAccessToken(authData.accessToken);
          
          // Add notification about successful Google account connection
          const connectionNotif: SystemNotification = {
            id: 'n_conn_' + Date.now(),
            text: themeConfig.lang === 'tr'
              ? `Google Hesabı Başarıyla Bağlandı (${authData.email}). Drive yedeklemesi başlatılıyor.`
              : `Google Account Connected Successfully (${authData.email}). Starting Drive backup.`,
            type: 'system',
            isRead: false,
            createdAt: new Date().toISOString()
          };
          setNotifications(prev => [connectionNotif, ...prev]);
        } else {
          throw new Error('Yetkilendirme jetonu alınamadı.');
        }
      } catch (err: any) {
        console.error('Google Drive connection failed:', err);
        const errorNotif: SystemNotification = {
          id: 'n_err_' + Date.now(),
          text: themeConfig.lang === 'tr'
            ? `Google Drive Bağlantı Hatası: ${err?.message || 'Yetki alınamadı.'}`
            : `Google Drive Connection Error: ${err?.message || 'Authorization failed.'}`,
          type: 'system',
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [errorNotif, ...prev]);
        setIsSyncing(false);
        alert(themeConfig.lang === 'tr'
          ? 'Google Drive bağlantısı reddedildi veya kurulamadı. Yedekleme iptal edildi.'
          : 'Google Drive connection was denied or failed. Backup cancelled.'
        );
        return;
      }
    }

    // Add dynamic audit syncing notification
    const syncNotif: SystemNotification = {
      id: 'n_sync_' + Date.now(),
      text: themeConfig.lang === 'tr'
        ? `Sistem yedeklemesi hazırlandı. (${new Date().toLocaleTimeString()})`
        : `System backup prepared. (${new Date().toLocaleTimeString()})`,
      type: 'backup',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    const updatedNotifs = [syncNotif, ...notifications];
    setNotifications(updatedNotifs);

    const payload: AppStateData = {
      users,
      defaultPrompts,
      generations,
      notifications: updatedNotifs,
      adminPassword
    };

    try {
      // 1. Save to Google Drive!
      if (token) {
        const driveResult = await saveBackupToGoogleDrive(token, payload);
        console.log('Saved to Google Drive:', driveResult);
        
        const driveSuccessNotif: SystemNotification = {
          id: 'n_drive_' + Date.now(),
          text: themeConfig.lang === 'tr'
            ? 'Yedek verileriniz Google Drive hesabınıza başarıyla kaydedildi/güncellendi.'
            : 'Your backup files have been uploaded/updated successfully in Google Drive.',
          type: 'backup',
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [driveSuccessNotif, ...prev]);
      }

      // 2. Local fallback to Backend Server db file backup
      const resp = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        const timeNow = new Date().toISOString();
        setLastSynced(timeNow);
        localStorage.setItem('mbg_last_synced_time', timeNow);
        
        alert(themeConfig.lang === 'tr'
          ? 'Verileriniz bulut veri tabanına ve Google Drive hesabınıza başarıyla yedeklendi.'
          : 'Your data has been successfully backed up to the cloud database and your Google Drive.'
        );
      }
    } catch (e: any) {
      console.error('Unified Backup sync failed:', e);
      alert(themeConfig.lang === 'tr'
        ? `Yedekleme sırasında bir sorun oluştu: ${e?.message || e}`
        : `An error occurred during backup: ${e?.message || e}`
      );
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  // Login event responder
  const handleLoginSuccess = (user: User, adminAccess: boolean) => {
    setCurrentUser(user);
    setIsAdmin(adminAccess);
    
    // Maintain direct user lists updates
    let updatedUsers = [...users];
    if (!adminAccess) {
      const idx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
      if (idx >= 0) {
        updatedUsers[idx] = { ...updatedUsers[idx], ...user };
      } else {
        updatedUsers.push(user);
      }
      setUsers(updatedUsers);
    }

    // Set view of user
    setActiveScreen('workspace');
    if (adminAccess) {
      setActiveTab('admin');
    } else {
      setActiveTab('generate');
    }

    // Add notification audit log
    const entryNotif: SystemNotification = {
      id: 'log_' + Date.now(),
      text: `${user.name || user.email} sisteme giriş sağladı.`,
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    const updatedNotifs = [entryNotif, ...notifications];
    setNotifications(prev => [entryNotif, ...prev]);

    // Save and sync database states immediately
    if (!adminAccess) {
      const payload: AppStateData = {
        users: updatedUsers,
        defaultPrompts,
        generations,
        notifications: updatedNotifs,
        adminPassword
      };
      
      fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => {
        console.error('Fast login immediate sync error:', err);
      });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    setActiveScreen('auth');
    setActiveTab('generate');
  };

  // Notification management callbacks
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Actions on User Generations
  const handleAddGeneration = (gen: GenerationRecord) => {
    setGenerations(prev => [gen, ...prev]);
    
    // Auto sync new artwork record
    setTimeout(() => {
      handleCloudBackup();
    }, 1000);
  };

  const handleDeleteGeneration = (id: string) => {
    setGenerations(prev => prev.filter(g => g.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setGenerations(prev => prev.map(g => g.id === id ? { ...g, isFavorite: !g.isFavorite } : g));
  };

  // Define active primary palette accent colors
  const activePaletteClass = {
    blue: 'ring-blue-500 text-blue-600 border-blue-100 bg-blue-50/10 hover:text-blue-700 hover:bg-blue-50/30',
    emerald: 'ring-emerald-500 text-emerald-600 border-emerald-100 bg-emerald-50/10 hover:text-emerald-700 hover:bg-emerald-50/30',
    rose: 'ring-rose-500 text-rose-600 border-rose-100 bg-rose-50/10 hover:text-rose-700 hover:bg-rose-50/30',
    amber: 'ring-amber-500 text-amber-600 border-amber-100 bg-amber-50/10 hover:text-amber-700 hover:bg-amber-50/30',
    violet: 'ring-violet-500 text-violet-600 border-violet-100 bg-violet-50/10 hover:text-violet-700 hover:bg-violet-50/30',
    slate: 'ring-slate-500 text-slate-600 border-slate-100 bg-slate-50/10 hover:text-slate-700 hover:bg-slate-50/30'
  }[themeConfig.palette];

  const sidebarTabClass = (tab: typeof activeTab) => {
    const isSelected = activeTab === tab;
    let selectedColors = '';
    
    switch (themeConfig.palette) {
      case 'blue':
        selectedColors = 'bg-blue-600 text-white shadow-md shadow-blue-500/20';
        break;
      case 'emerald':
        selectedColors = 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20';
        break;
      case 'rose':
        selectedColors = 'bg-rose-600 text-white shadow-md shadow-rose-500/20';
        break;
      case 'amber':
        selectedColors = 'bg-amber-600 text-white shadow-md shadow-amber-500/20';
        break;
      case 'violet':
        selectedColors = 'bg-violet-600 text-white shadow-md shadow-violet-500/20';
        break;
      case 'slate':
      default:
        selectedColors = 'bg-slate-700 text-white shadow-md shadow-slate-500/20';
        break;
    }

    return `flex-1 sm:flex-initial px-5 py-3 rounded-xl text-xs font-extrabold tracking-wide uppercase transition-all duration-200 text-center cursor-pointer ${
      isSelected 
        ? selectedColors 
        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40'
    }`;
  };

  const isTr = themeConfig.lang === 'tr';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Dynamic Header on EVERY single screen */}
      <Header
        themeConfig={themeConfig}
        setThemeConfig={setThemeConfig}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkNotificationAsRead={handleMarkAsRead}
        onClearNotifications={handleClearNotifications}
        onSyncCloud={handleCloudBackup}
        isSyncing={isSyncing}
        lastSynced={lastSynced}
      />

      {/* Main Flow Section container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12 transition-all">
        
        {activeScreen === 'intro' && (
          <IntroScreen
            onNext={() => setActiveScreen('auth')}
            themeConfig={themeConfig}
          />
        )}

        {activeScreen === 'auth' && (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            lang={themeConfig.lang}
            existingUsers={users}
            adminPasswordCurrent={adminPassword}
          />
        )}

        {activeScreen === 'workspace' && currentUser && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Horizontal Nav Bar choices */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-900 pb-5">
              <div className="flex flex-wrap bg-zinc-100/80 dark:bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800">
                <button
                  onClick={() => setActiveTab('generate')}
                  className={sidebarTabClass('generate')}
                >
                  {isTr ? 'Görsel Üretim' : 'Create Visual'}
                </button>
                <button
                  onClick={() => setActiveTab('archive')}
                  className={sidebarTabClass('archive')}
                >
                  {isTr ? 'Arşivim' : 'My Archive'}
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={sidebarTabClass('reports')}
                >
                  {isTr ? 'Analiz ve Raporlar' : 'Reports & Charts'}
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={sidebarTabClass('admin')}
                  >
                    {isTr ? 'Yönetim Paneli' : 'Admin Core'}
                  </button>
                )}
              </div>

              {/* Secure Node Status Pill */}
              <div className="hidden lg:flex items-center gap-2 text-xs font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-bold animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>CYBER LAYER ONLINE ● CRYPTO_VERIFY_PASS</span>
              </div>
            </div>

            {/* Render selected workspace view */}
            <div className="transition-all duration-300">
              {activeTab === 'generate' && (
                <MainWorkspace
                  currentUser={currentUser}
                  themeConfig={themeConfig}
                  defaultPrompts={defaultPrompts}
                  generations={generations}
                  onAddGeneration={handleAddGeneration}
                  onToggleFavorite={handleToggleFavorite}
                  lang={themeConfig.lang}
                />
              )}

              {activeTab === 'archive' && (
                <ArchiveWorkspace
                  generations={generations.filter(g => g.userId === currentUser.id)}
                  onDeleteGeneration={handleDeleteGeneration}
                  lang={themeConfig.lang}
                  themeConfig={themeConfig}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsWorkspace
                  generations={generations.filter(g => g.userId === currentUser.id)}
                  lang={themeConfig.lang}
                  themeConfig={themeConfig}
                />
              )}

              {activeTab === 'admin' && isAdmin && (
                <AdminWorkspace
                  users={users}
                  defaultPrompts={defaultPrompts}
                  generations={generations}
                  onUpdateUsers={setUsers}
                  onUpdateDefaultPrompts={setDefaultPrompts}
                  onUpdateGenerations={setGenerations}
                  adminPasswordCurrent={adminPassword}
                  onChangeAdminPassword={setAdminPassword}
                  lang={themeConfig.lang}
                />
              )}
            </div>

          </div>
        )}

      </main>

      {/* Humble Footer */}
      <footer className="w-full text-center py-6 text-[10px] text-zinc-400 dark:text-zinc-600 border-t border-zinc-200 dark:border-zinc-900 select-none">
        <p>© 2026 MBG Ai42 Technologies. End-to-end local & secure cloud database nodes.</p>
      </footer>

    </div>
  );
}
