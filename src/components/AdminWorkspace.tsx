import React, { useState } from 'react';
import { 
  Users, 
  Trash2, 
  Edit, 
  Plus, 
  Save, 
  Key, 
  Cpu, 
  Check, 
  Settings, 
  X,
  FileImage,
  Layers,
  AlertTriangle,
  Lightbulb,
  Download,
  Eye,
  LogIn,
  LogOut,
  Calendar
} from 'lucide-react';
import { User, PromptItem, GenerationRecord, ThemeConfig, LoginAuditLog } from '../types';

interface AdminWorkspaceProps {
  users: User[];
  defaultPrompts: PromptItem[];
  generations: GenerationRecord[];
  onUpdateUsers: (users: User[]) => void;
  onUpdateDefaultPrompts: (prompts: PromptItem[]) => void;
  onUpdateGenerations: (generations: GenerationRecord[]) => void;
  adminPasswordCurrent: string;
  onChangeAdminPassword: (newPass: string) => void;
  lang: ThemeConfig['lang'];
  loginLogs: LoginAuditLog[];
}

export default function AdminWorkspace({
  users,
  defaultPrompts,
  generations,
  onUpdateUsers,
  onUpdateDefaultPrompts,
  onUpdateGenerations,
  adminPasswordCurrent,
  onChangeAdminPassword,
  lang,
  loginLogs
}: AdminWorkspaceProps) {
  const isTr = lang === 'tr';

  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const selectedUser = users.find(u => u.id === selectedUserId) || null;

  // Modals / Dialog state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetType, setDeleteTargetType] = useState<'user' | 'generation'>('user');
  const [deleteTargetId, setDeleteTargetId] = useState<string>('');

  // Editing state - user
  const [userEditEmail, setUserEditEmail] = useState('');
  const [userEditPass, setUserEditPass] = useState('');
  const [userEditProvider, setUserEditProvider] = useState<'email' | 'google' | 'apple'>('email');
  const [isEditingUser, setIsEditingUser] = useState(false);

  // Saving initial user values when selection changes
  React.useEffect(() => {
    if (selectedUser) {
      setUserEditEmail(selectedUser.email);
      setUserEditPass(selectedUser.password || '');
      setUserEditProvider(selectedUser.provider);
      setIsEditingUser(false);
    }
  }, [selectedUserId]);

  // Edits - alternative suggestions
  const [altEditId, setAltEditId] = useState<string | null>(null);
  const [altEditText, setAltEditText] = useState('');
  const [altEditTag, setAltEditTag] = useState('');
  const [altNewText, setAltNewText] = useState('');
  const [altNewTag, setAltNewTag] = useState('');

  // Edits - user generations
  const [genEditId, setGenEditId] = useState<string | null>(null);
  const [genEditPrompt, setGenEditPrompt] = useState('');
  const [genEditEngine, setGenEditEngine] = useState<'Nano Banana Pro' | 'Nano Banana 2' | 'Fallback AI'>('Nano Banana Pro');

  // Admin password editing
  const [passReveal, setPassReveal] = useState(false);
  const [newPass1, setNewPass1] = useState('');
  const [newPass2, setNewPass2] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // Lightbox view state for user-uploaded/generated image files
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string>('');

  // Tab for admin workspace
  const [adminTab, setAdminTab] = useState<'users' | 'prompts' | 'credentials' | 'logs'>('users');

  // Filtering generations to the selected user
  const filteredGenerations = generations.filter(g => g.userId === selectedUserId);

  const t = {
    userListHead: isTr ? 'Sistem Kullanıcıları' : 'System Users',
    alternativeHead: isTr ? 'Alternatif Prompt Yönetimi' : 'Sample Prompts Admin',
    adminPassHead: isTr ? 'Yönetici Şifre Ayarı' : 'Admin Credentials Setter',
    userProfileHead: isTr ? 'Seçili Kullanıcı Profil Bilgileri' : 'Selected User Profile',
    recordListHead: isTr ? 'Kullanıcı Üretim Geçmişi ve Kayıtları' : 'User Artwork logs',
    loginLogsHead: isTr ? 'Giriş ve Çıkış Kayıtları' : 'Login/Logout Audit Logs',
    confirmText: isTr ? 'Kullanıcı Verileri Silinecektir. Emin misin!' : 'User data and generations will be completely removed. Are you sure!',
    yes: isTr ? 'Evet, Sil' : 'Yes, Delete',
    no: isTr ? 'Vazgeç' : 'Cancel',
    emailLabel: isTr ? 'Girdiği E-Posta' : 'User Email',
    passLabel: isTr ? 'Girdiği Şifre' : 'User Password',
    providerLabel: isTr ? 'Kayıt Yöntemi' : 'Auth Method',
    editBtn: isTr ? 'Bilgileri Düzenle' : 'Edit Info',
    saveBtn: isTr ? 'Değişiklikleri Kaydet' : 'Save Changes',
    deleteUserBtn: isTr ? 'Kullanıcı Sistemini ve Kayıtlarını Sil' : 'Delete User & All Records',
    addPromptBtn: isTr ? 'Yeni Alternatif Ekle' : 'Add Alternative Prompt',
    currentPass: isTr ? 'Aktif Şifreniz' : 'Current Password',
    newPass: isTr ? 'Yeni Şifre' : 'New Password',
    repeatPass: isTr ? 'Yeni Şifre (Yeniden)' : 'Repeat New Password',
    passMismatch: isTr ? 'Hata: Şifreler uyuşmuyor!' : 'Error: Passwords do not match!',
    passShort: isTr ? 'Hata: Şifre en az 4 karakter olmalıdır!' : 'Error: Min length 4 characters!',
    passSuccessMsg: isTr ? 'Başarılı: Yönetici şifreniz güncellenmiştir!' : 'Success: Admin password updated!',
    noSelection: isTr ? 'Sol panelden düzenlemek istediğiniz kullanıcıyı seçin.' : 'Select a user from the left pane to edit profiles.',
    noGenerations: isTr ? 'Kullanıcının henüz üretilmiş görsel kaydı bulunmuyor.' : 'This user has no images generated yet.',
    noLogs: isTr ? 'Henüz giriş/çıkış kaydı bulunmuyor.' : 'No login/logout records yet.',
    userCol: isTr ? 'Kullanıcı' : 'User',
    actionCol: isTr ? 'İşlem' : 'Action',
    timeCol: isTr ? 'Zaman' : 'Time',
    providerCol: isTr ? 'Yöntem' : 'Provider',
  };

  const handleSaveUserEdit = () => {
    if (!selectedUserId) return;
    const updatedUsers = users.map(u => {
      if (u.id === selectedUserId) {
        return {
          ...u,
          email: userEditEmail,
          password: userEditPass,
          provider: userEditProvider
        };
      }
      return u;
    });
    onUpdateUsers(updatedUsers);
    setIsEditingUser(false);
  };

  const triggerDeleteUser = () => {
    if (!selectedUserId) return;
    setDeleteTargetType('user');
    setDeleteTargetId(selectedUserId);
    setShowDeleteModal(true);
  };

  const confirmDeleteAction = () => {
    if (deleteTargetType === 'user') {
      const remainingUsers = users.filter(u => u.id !== deleteTargetId);
      const remainingGenerations = generations.filter(g => g.userId !== deleteTargetId);
      onUpdateUsers(remainingUsers);
      onUpdateGenerations(remainingGenerations);
      setSelectedUserId(remainingUsers[0]?.id || '');
    } else {
      const remainingGenerations = generations.filter(g => g.id !== deleteTargetId);
      onUpdateGenerations(remainingGenerations);
    }
    setShowDeleteModal(false);
  };

  // Add Alternative Prompt Suggestion
  const handleAddAlternative = () => {
    if (!altNewText.trim()) return;
    const newItem: PromptItem = {
      id: 'alt_' + Math.random().toString(36).substr(2, 9),
      text: altNewText.trim(),
      isSystem: true,
      category: 'Admin-Added',
      tag: altNewTag.trim() || undefined
    };
    onUpdateDefaultPrompts([...defaultPrompts, newItem]);
    setAltNewText('');
    setAltNewTag('');
  };

  // Edit Alternative Prompt
  const handleSaveAltEdit = (id: string) => {
    if (!altEditText.trim()) return;
    const updated = defaultPrompts.map(p => p.id === id ? { ...p, text: altEditText.trim(), tag: altEditTag.trim() || undefined } : p);
    onUpdateDefaultPrompts(updated);
    setAltEditId(null);
    setAltEditText('');
    setAltEditTag('');
  };

  const handleDeleteAlt = (id: string) => {
    const updated = defaultPrompts.filter(p => p.id !== id);
    onUpdateDefaultPrompts(updated);
  };

  // User Generations edit
  const handleStartEditGen = (record: GenerationRecord) => {
    setGenEditId(record.id);
    setGenEditPrompt(record.originalPrompt);
    setGenEditEngine(record.modelUsed);
  };

  const handleSaveGenEdit = () => {
    if (!genEditId) return;
    const updated = generations.map(g => {
      if (g.id === genEditId) {
        return {
          ...g,
          originalPrompt: genEditPrompt,
          modelUsed: genEditEngine
        };
      }
      return g;
    });
    onUpdateGenerations(updated);
    setGenEditId(null);
  };

  const handleDeleteGen = (id: string) => {
    setDeleteTargetType('generation');
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  // Admin password updater
  const handleAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!newPass1 || !newPass2) {
      setPassError(isTr ? 'Lütfen gerekli alanları doldurun!' : 'Please fill all password fields!');
      return;
    }

    if (newPass1 !== newPass2) {
      setPassError(t.passMismatch);
      return;
    }

    if (newPass1.length < 4) {
      setPassError(t.passShort);
      return;
    }

    onChangeAdminPassword(newPass1);
    setNewPass1('');
    setNewPass2('');
    setPassSuccess(t.passSuccessMsg);
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Workspace Tabs */}
      <div className="flex flex-wrap gap-2 bg-zinc-100 dark:bg-zinc-900/80 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-fit">
        <button
          onClick={() => setAdminTab('users')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${adminTab === 'users' ? 'bg-primary-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
        >
          {isTr ? 'Kullanıcılar & Üretim' : 'Users & Content'}
        </button>
        <button
          onClick={() => setAdminTab('prompts')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${adminTab === 'prompts' ? 'bg-primary-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
        >
          {isTr ? 'Promptlar' : 'Prompts'}
        </button>
        <button
          onClick={() => setAdminTab('credentials')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${adminTab === 'credentials' ? 'bg-primary-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
        >
          {isTr ? 'Kimlik Bilgileri' : 'Credentials'}
        </button>
        <button
          onClick={() => setAdminTab('logs')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${adminTab === 'logs' ? 'bg-primary-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
        >
          {isTr ? 'Giriş Kayıtları' : 'Login Logs'}
        </button>
      </div>

      {/* Tab Content */}
      {adminTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
          
          {/* LEFT PANEL */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* User list card */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-4">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-3.5 flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <Users size={14} className="text-primary-500" />
                {t.userListHead} ({users.length})
              </span>
              <div className="space-y-1 max-h-56 overflow-y-auto">
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900/50 flex align-center justify-between transition-colors border cursor-pointer ${selectedUserId === u.id ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-200 dark:border-primary-800' : 'border-zinc-100 dark:border-zinc-800'}`}
                  >
                    <span>{u.name || u.email}</span>
                    <span className="text-[10px] font-mono text-zinc-400 capitalize bg-neutral-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                      {u.provider}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-7 space-y-6">
            
            {selectedUser ? (
              <>
                {/* User Profile */}
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-4 flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <Settings size={14} className="text-primary-500" />
                    {t.userProfileHead}
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-600 block mb-1.5">{t.emailLabel}</label>
                      <input
                        type="text"
                        value={userEditEmail}
                        onChange={e => { setUserEditEmail(e.target.value); setIsEditingUser(true); }}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-600 block mb-1.5">{t.passLabel}</label>
                      <input
                        type="text"
                        value={userEditPass}
                        onChange={e => { setUserEditPass(e.target.value); setIsEditingUser(true); }}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        placeholder="OAuth Synced"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-zinc-600 block mb-1.5">{t.providerLabel}</label>
                      <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 w-full max-w-sm">
                        {['email', 'google', 'apple'].map(prov => (
                          <button
                            key={prov}
                            onClick={() => { setUserEditProvider(prov as any); setIsEditingUser(true); }}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${userEditProvider === prov ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
                          >
                            {prov}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
                    {isEditingUser && (
                      <button
                        onClick={handleSaveUserEdit}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Save size={13} />
                        {t.saveBtn}
                      </button>
                    )}
                    
                    <button
                      onClick={triggerDeleteUser}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      {t.deleteUserBtn}
                    </button>
                  </div>
                </div>

                {/* User Generations */}
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-4 flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <FileImage size={14} className="text-primary-500" />
                    {t.recordListHead} ({filteredGenerations.length})
                  </span>

                  {filteredGenerations.length === 0 ? (
                    <div className="text-center py-10 text-zinc-400 text-xs">{t.noGenerations}</div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                      {filteredGenerations.map(record => {
                        const isGenEditing = genEditId === record.id;
                        
                        return (
                          <div key={record.id} className="p-4 border border-zinc-100 dark:border-zinc-800 rounded-xl flex flex-col md:flex-row gap-4 bg-zinc-50/20">
                            {/* Thumbnails */}
                            <div className="flex gap-2 shrink-0">
                              {(record.editImage || (record.referenceImages && record.referenceImages.length > 0)) && (
                                <div 
                                  onClick={() => {
                                    const url = record.editImage || record.referenceImages?.[0] || '';
                                    if (url) {
                                      setLightboxUrl(url);
                                      setLightboxTitle(isTr ? `Yüklenen - ${record.originalPrompt}` : `Uploaded - ${record.originalPrompt}`);
                                    }
                                  }}
                                  className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-950 shrink-0 cursor-pointer border-2 border-zinc-200"
                                >
                                  <img 
                                    src={record.editImage || record.referenceImages?.[0]} 
                                    alt="source" 
                                    className="w-full h-full object-cover" 
                                    referrerPolicy="no-referrer" 
                                  />
                                </div>
                              )}

                              <div 
                                onClick={() => {
                                  setLightboxUrl(record.imageUrl);
                                  setLightboxTitle(isTr ? `Üretilen - ${record.originalPrompt}` : `Generated - ${record.originalPrompt}`);
                                }}
                                className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-950 shrink-0 cursor-pointer border-2 border-primary-500"
                              >
                                <img 
                                  src={record.imageUrl} 
                                  alt="result" 
                                  className="w-full h-full object-cover" 
                                  referrerPolicy="no-referrer" 
                                />
                              </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                              <p className="text-xs text-zinc-800 dark:text-zinc-200 font-semibold mb-2">
                                {record.originalPrompt}
                              </p>
                              <div className="flex gap-2 text-[10px]">
                                <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-950/40 text-primary-600 rounded font-mono">
                                  {record.modelUsed}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleStartEditGen(record)}
                                className="p-1.5 hover:bg-zinc-100 rounded text-zinc-500 text-xs"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteGen(record.id)}
                                className="p-1.5 hover:bg-rose-50 rounded text-rose-500 text-xs"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-zinc-400 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                {t.noSelection}
              </div>
            )}
          </div>
        </div>
      )}

      {adminTab === 'prompts' && (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-4 flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <Lightbulb size={14} className="text-primary-500" />
            {t.alternativeHead}
          </span>
          
          <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
            {defaultPrompts.map(p => (
              <div key={p.id} className="p-2 border border-zinc-100 dark:border-zinc-800/80 rounded-xl text-xs flex items-center justify-between gap-2.5 bg-zinc-50/50 dark:bg-zinc-900/10">
                {altEditId === p.id ? (
                  <div className="flex-1 flex flex-col gap-1.5">
                    <input
                      type="text"
                      value={altEditText}
                      onChange={e => setAltEditText(e.target.value)}
                      placeholder={isTr ? 'Prompt metni...' : 'Prompt text...'}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs"
                    />
                    <button
                      onClick={() => handleSaveAltEdit(p.id)}
                      className="p-1 px-2.5 bg-emerald-600 text-white rounded text-[10px] font-bold"
                    >
                      <Check size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-zinc-700 dark:text-zinc-300 flex-1">{p.text}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setAltEditId(p.id); setAltEditText(p.text); }} className="p-1 hover:bg-zinc-200 rounded text-zinc-500">
                        <Edit size={11} />
                      </button>
                      <button onClick={() => handleDeleteAlt(p.id)} className="p-1 hover:bg-rose-50 rounded text-rose-500">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={altNewText}
              onChange={e => setAltNewText(e.target.value)}
              placeholder={isTr ? 'Yeni prompt...' : 'New prompt...'}
              className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs"
            />
            <button
              onClick={handleAddAlternative}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}

      {adminTab === 'credentials' && (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 max-w-md">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-4 flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <Key size={14} className="text-primary-500" />
            {t.adminPassHead}
          </span>

          <form onSubmit={handleAdminPasswordSubmit} className="space-y-3">
            <div className="text-xs flex items-center justify-between text-zinc-500 bg-zinc-100 dark:bg-zinc-900/60 p-2 rounded-lg">
              <span>{t.currentPass}:</span>
              <span className="font-mono font-bold text-amber-500">
                {passReveal ? adminPasswordCurrent : '••••••••'}
              </span>
              <button
                type="button"
                onClick={() => setPassReveal(!passReveal)}
                className="text-[10px] text-primary-500 underline"
              >
                {passReveal ? isTr ? 'Gizle' : 'Hide' : isTr ? 'Göster' : 'Show'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-400 font-bold block mb-1">{t.newPass}</label>
                <input
                  type="password"
                  value={newPass1}
                  onChange={e => { setNewPass1(e.target.value); setPassError(''); setPassSuccess(''); }}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-2 text-xs"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 font-bold block mb-1">{t.repeatPass}</label>
                <input
                  type="password"
                  value={newPass2}
                  onChange={e => { setNewPass2(e.target.value); setPassError(''); setPassSuccess(''); }}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-2 text-xs"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {passError && <span className="text-[10px] text-rose-500 font-semibold">{passError}</span>}
            {passSuccess && <span className="text-[10px] text-emerald-500 font-semibold">{passSuccess}</span>}

            <button
              type="submit"
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl text-xs font-black uppercase"
            >
              {isTr ? 'Şifre Güncelle' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {adminTab === 'logs' && (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-4 flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <LogIn size={14} className="text-primary-500" />
            {t.loginLogsHead} ({loginLogs.length})
          </span>

          {loginLogs.length === 0 ? (
            <div className="text-center py-10 text-zinc-400 text-xs">{t.noLogs}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b border-zinc-200 dark:border-zinc-800">
                  <tr className="text-zinc-600 dark:text-zinc-400">
                    <th className="text-left py-2 px-2">{t.userCol}</th>
                    <th className="text-left py-2 px-2">{t.actionCol}</th>
                    <th className="text-left py-2 px-2">{t.providerCol}</th>
                    <th className="text-left py-2 px-2">{t.timeCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {loginLogs.map(log => (
                    <tr key={log.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="py-2 px-2 font-semibold text-zinc-800 dark:text-zinc-200">
                        {log.userName} ({log.userEmail})
                      </td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-1 rounded text-white font-bold flex w-fit gap-1 items-center ${log.action === 'login' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                          {log.action === 'login' ? <LogIn size={11} /> : <LogOut size={11} />}
                          {log.action === 'login' ? isTr ? 'Giriş' : 'Login' : isTr ? 'Çıkış' : 'Logout'}
                        </span>
                      </td>
                      <td className="py-2 px-2 capitalize text-zinc-600 dark:text-zinc-400">{log.provider}</td>
                      <td className="py-2 px-2 text-zinc-600 dark:text-zinc-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="w-10 h-10 bg-rose-50 dark:bg-rose-950/40 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <h4 className="font-extrabold text-sm uppercase">{isTr ? 'Silme Onayı' : 'Delete Confirmation'}</h4>
            </div>

            <p className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold mb-6">
              {t.confirmText}
            </p>

            <div className="flex gap-3">
              <button
                onClick={confirmDeleteAction}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black"
              >
                {t.yes}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold"
              >
                {t.no}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4">
          <div className="absolute top-4 right-4 flex gap-3">
            <button
              onClick={() => {
                setLightboxUrl(null);
                setLightboxTitle('');
              }}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="max-w-4xl max-h-[85vh]">
            <img 
              src={lightboxUrl} 
              alt="preview" 
              className="max-w-full max-h-[75vh] rounded-2xl object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
