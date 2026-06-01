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
  Eye
} from 'lucide-react';
import { User, PromptItem, GenerationRecord, ThemeConfig } from '../types';

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
  lang
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

  // Filtering generations to the selected user
  const filteredGenerations = generations.filter(g => g.userId === selectedUserId);

  const t = {
    userListHead: isTr ? 'Sistem Kullanıcıları' : 'System Users',
    alternativeHead: isTr ? 'Alternatif Prompt Yönetimi' : 'Sample Prompts Admin',
    adminPassHead: isTr ? 'Yönetici Şifre Ayarı' : 'Admin Credentials Setter',
    userProfileHead: isTr ? 'Seçili Kullanıcı Profil Bilgileri' : 'Selected User Profile',
    recordListHead: isTr ? 'Kullanıcı Üretim Geçmişi ve Kayıtları' : 'User Artwork logs',
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
    noGenerations: isTr ? 'Kullanıcının henüz üretilmiş görsel kaydı bulunmuyor.' : 'This user has no images generated yet.'
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
      
      {/* 1. LEFT PANEL (User list, suggested prompts builder, admin credentials) */}
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
                className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900/50 flex align-center justify-between transition-colors border cursor-pointer ${selectedUserId === u.id ? 'bg-primary-50 border-primary-100 dark:bg-primary-950/20 dark:border-primary-950/40 text-primary-600' : 'border-transparent text-zinc-700 dark:text-zinc-300'}`}
              >
                <span>{u.name || u.email}</span>
                <span className="text-[10px] font-mono text-zinc-400 capitalize bg-neutral-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                  {u.provider}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Alternatives prompts manager */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-4">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-3.5 flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <Lightbulb size={14} className="text-primary-500" />
            {t.alternativeHead}
          </span>
          
          <div className="space-y-2 mb-4 max-h-56 overflow-y-auto">
            {defaultPrompts.map(p => (
              <div key={p.id} className="p-2 border border-zinc-100 dark:border-zinc-800/80 rounded-xl text-xs flex items-center justify-between gap-2.5 bg-zinc-50/50 dark:bg-zinc-900/10">
                {altEditId === p.id ? (
                  <div className="flex-1 flex flex-col gap-1.5">
                    <input
                      type="text"
                      value={altEditText}
                      onChange={e => setAltEditText(e.target.value)}
                      placeholder={isTr ? 'Prompt metni...' : 'Prompt text...'}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-white"
                    />
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={altEditTag}
                        onChange={e => setAltEditTag(e.target.value)}
                        placeholder={isTr ? 'Etiket (Örn: Cyber)' : 'Tag (e.g. Cyber)'}
                        className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-white"
                      />
                      <button
                        onClick={() => handleSaveAltEdit(p.id)}
                        className="p-1 px-2.5 bg-emerald-600 text-white rounded text-[10px] font-bold shrink-0 flex items-center justify-center cursor-pointer"
                      >
                        <Check size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-wrap items-center gap-1.5 min-w-0">
                    {p.tag && (
                      <span className="bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-950/50 rounded-md text-[9px] px-1.5 py-0.5 font-bold shrink-0">
                        #{p.tag}
                      </span>
                    )}
                    <span className="text-zinc-700 dark:text-zinc-300 pr-2 line-clamp-2 leading-relaxed flex-1 break-words">{p.text}</span>
                  </div>
                )}
                
                {altEditId !== p.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { setAltEditId(p.id); setAltEditText(p.text); setAltEditTag(p.tag || ''); }}
                      className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-500 cursor-pointer"
                      title="Düzenle"
                    >
                      <Edit size={11} />
                    </button>
                    <button
                      onClick={() => handleDeleteAlt(p.id)}
                      className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick inline add suggestion form */}
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={altNewText}
              onChange={e => setAltNewText(e.target.value)}
              placeholder={isTr ? 'Örnek alternatif prompt metni...' : 'New alternative prompt suggestion...'}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-inner"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={altNewTag}
                onChange={e => setAltNewTag(e.target.value)}
                placeholder={isTr ? 'Etiket adı (Örn: Doğa, Cyber, Soyut...)' : 'Tag Name (e.g. Nature, Cyber, Abstract...)'}
                className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-inner"
              />
              <button
                onClick={handleAddAlternative}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
                title={t.addPromptBtn}
              >
                <Plus size={14} className="mr-1" />
                {isTr ? 'Ekle' : 'Add'}
              </button>
            </div>
          </div>
        </div>

        {/* Admin secure password change form */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-4">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-3 flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <Key size={14} className="text-primary-500" />
            {t.adminPassHead}
          </span>

          <form onSubmit={handleAdminPasswordSubmit} className="space-y-3">
            <div className="text-xs flex items-center justify-between text-zinc-500 bg-zinc-100 dark:bg-zinc-900/60 p-2 rounded-lg">
              <span>{t.currentPass}:</span>
              <span className="font-mono font-bold tracking-wider text-amber-500">
                {passReveal ? adminPasswordCurrent : '••••••••'}
              </span>
              <button
                type="button"
                onClick={() => setPassReveal(!passReveal)}
                className="text-[10px] text-primary-500 underline"
              >
                {passReveal ? 'Gizle' : 'Göster'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-400 font-bold block mb-1">{t.newPass}</label>
                <input
                  type="password"
                  value={newPass1}
                  onChange={e => { setNewPass1(e.target.value); setPassError(''); setPassSuccess(''); }}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 font-bold block mb-1">{t.repeatPass}</label>
                <input
                  type="password"
                  value={newPass2}
                  onChange={e => { setNewPass2(e.target.value); setPassError(''); setPassSuccess(''); }}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {passError && <span className="text-[10px] text-rose-500 font-semibold block">{passError}</span>}
            {passSuccess && <span className="text-[10px] text-emerald-500 font-semibold block">{passSuccess}</span>}

            <button
              type="submit"
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl text-xs font-black tracking-wide shadow active:scale-95 transition-all cursor-pointer uppercase text-center"
            >
              Şifre Güncelle / Save Pass
            </button>
          </form>
        </div>

      </div>

      {/* 2. RIGHT PANEL (Selected User edit module, user generations database catalog) */}
      <div className="lg:col-span-7 space-y-6">
        
        {selectedUser ? (
          <>
            {/* Core User profile modification block */}
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
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
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
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${userEditProvider === prov ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm font-bold' : 'text-zinc-500'}`}
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

            {/* Selected User Generations edit and listing */}
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
                        {/* Thumbnails Container */}
                        <div className="flex gap-2 shrink-0 self-start md:self-center">
                          {/* 1. Uploaded/Source Image (if any) */}
                          {(record.editImage || (record.referenceImages && record.referenceImages.length > 0)) && (
                            <div 
                              onClick={() => {
                                const url = record.editImage || record.referenceImages?.[0] || '';
                                if (url) {
                                  setLightboxUrl(url);
                                  setLightboxTitle(isTr ? `Yüklenen Kaynak Görsel - ${record.originalPrompt}` : `Uploaded Source Reference - ${record.originalPrompt}`);
                                }
                              }}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-950 shrink-0 relative border-2 border-zinc-200 dark:border-zinc-850 cursor-pointer group hover:border-primary-500 hover:scale-105 transition-all shadow-sm"
                              title={isTr ? 'Yüklenen Görseli Büyüt' : 'Enlarge Uploaded Image'}
                            >
                              <img 
                                src={record.editImage || record.referenceImages?.[0]} 
                                alt="source-thumb" 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer" 
                              />
                              <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[8px] text-white text-center py-0.5 uppercase tracking-wide font-black">
                                {isTr ? 'Yüklenen' : 'Uploaded'}
                              </div>
                            </div>
                          )}

                          {/* 2. Generated Image */}
                          <div 
                            onClick={() => {
                              setLightboxUrl(record.imageUrl);
                              setLightboxTitle(isTr ? `Üretilen Görsel - ${record.originalPrompt}` : `Generated Artwork - ${record.originalPrompt}`);
                            }}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-950 shrink-0 relative border-2 border-zinc-200 dark:border-zinc-850 cursor-pointer group hover:border-primary-500 hover:scale-105 transition-all shadow-sm"
                            title={isTr ? 'Üretilen Görseli Büyüt' : 'Enlarge Generated Artwork'}
                          >
                            <img 
                              src={record.imageUrl} 
                              alt="result-thumb" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer" 
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-primary-900/80 text-[8px] text-white text-center py-0.5 uppercase tracking-wide font-black">
                              {isTr ? 'Sonuç' : 'Result'}
                            </div>
                          </div>
                        </div>

                        {/* Mid detailed contents */}
                        <div className="flex-1 space-y-2">
                          {isGenEditing ? (
                            <div className="space-y-2">
                              <textarea
                                value={genEditPrompt}
                                onChange={e => setGenEditPrompt(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-xs"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                {['Nano Banana Pro', 'Nano Banana 2', 'Fallback AI'].map(m => (
                                  <button
                                    key={m}
                                    type="button"
                                    onClick={() => setGenEditEngine(m as any)}
                                    className={`px-2 py-1 text-[10px] rounded border font-semibold ${genEditEngine === m ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-transparent border-zinc-200 text-zinc-500'}`}
                                  >
                                    {m}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-xs text-zinc-800 dark:text-zinc-200 font-semibold leading-relaxed">
                                {record.originalPrompt}
                              </p>
                              
                              <div className="flex flex-wrap gap-2 text-[10px] items-center">
                                <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded font-mono font-bold uppercase flex items-center gap-1.5">
                                  <Cpu size={10} />
                                  {record.modelUsed}
                                </span>
                                
                                {record.referenceImages && record.referenceImages.length > 0 && (
                                  <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded font-mono">
                                    {record.referenceImages.length} Referans
                                  </span>
                                )}

                                {record.editImage && (
                                  <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded font-mono">
                                    Düzenlenecek Görsel
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Row Actions */}
                        <div className="flex md:flex-col justify-end gap-1.5 shrink-0 self-center">
                          {isGenEditing ? (
                            <button
                              onClick={handleSaveGenEdit}
                              className="p-1 px-2.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                            >
                              <Check size={12} />
                              Kaydet
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartEditGen(record)}
                              className="p-1.5 hover:bg-zinc-100 rounded text-zinc-500 text-xs font-semibold flex items-center justify-center gap-1.5"
                              title="Tasarımı Düzenle"
                            >
                              <Edit size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteGen(record.id)}
                            className="p-1.5 hover:bg-rose-50 rounded text-rose-500 text-xs font-semibold flex items-center justify-center gap-1.5"
                            title="Kayıt Sil"
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

      {/* 3. CONFIRMATION DELETION DIALOG MODAL (custom UI representing instructions) */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="w-10 h-10 bg-rose-50 dark:bg-rose-950/40 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider">Kritik Silme Onayı</h4>
            </div>

            <p className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold mb-6 leading-relaxed">
              {t.confirmText}
            </p>

            <div className="flex gap-3">
              <button
                onClick={confirmDeleteAction}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow cursor-pointer text-center"
              >
                {t.yes}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer text-center border border-zinc-200 dark:border-zinc-800"
              >
                {t.no}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox modal with genuine download button at top right */}
      {lightboxUrl && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
          {/* Top Banner controls */}
          <div className="absolute top-4 right-4 flex items-center gap-3 z-50">
            <button
              onClick={async () => {
                try {
                  const response = await fetch(lightboxUrl);
                  const blob = await response.blob();
                  const blobUrl = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = blobUrl;
                  a.download = isTr ? 'tasarim_indirilen.png' : 'downloaded_artwork.png';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(blobUrl);
                } catch (err) {
                  // Fallback
                  const a = document.createElement('a');
                  a.href = lightboxUrl;
                  a.target = '_blank';
                  a.download = 'artwork.png';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }
              }}
              className="px-3 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all"
              title={isTr ? 'Görseli İndir' : 'Download Image'}
            >
              <Download size={14} />
              {isTr ? 'İndir' : 'Download'}
            </button>
            <button
              onClick={() => {
                setLightboxUrl(null);
                setLightboxTitle('');
              }}
              className="p-2 bg-white/10 hover:bg-white/20 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-full transition-all cursor-pointer shadow-md hover:scale-110"
              title={isTr ? 'Kapat' : 'Close'}
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center justify-center gap-4 animate-in zoom-in-95 duration-200">
            <img 
              src={lightboxUrl} 
              alt="preview" 
              className="max-w-full max-h-[75vh] rounded-2xl object-contain shadow-2xl border border-white/10 select-none"
              referrerPolicy="no-referrer"
            />
            {lightboxTitle && (
              <p className="text-zinc-300 text-xs text-center max-w-xl bg-black/70 px-4 py-2.5 rounded-2xl backdrop-blur-md tracking-wider leading-relaxed font-mono">
                {lightboxTitle}
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
