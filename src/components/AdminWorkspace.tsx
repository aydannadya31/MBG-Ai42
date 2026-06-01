import React, { useState } from 'react';
import { 
  Users, 
  Trash2, 
  Edit, 
  Plus, 
  Save, 
  Key, 
  Check, 
  Settings, 
  X,
  FileImage,
  AlertTriangle,
  Lightbulb,
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  Copy,
  CheckCircle
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

  // State management
  const [adminTab, setAdminTab] = useState<'dashboard' | 'users' | 'prompts' | 'credentials' | 'logs'>('dashboard');
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string>('');
  
  // User editing
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editPass, setEditPass] = useState('');
  const [editProvider, setEditProvider] = useState<'email' | 'google' | 'apple'>('email');
  const [showPassword, setShowPassword] = useState<string | null>(null);
  
  // Password change
  const [newPass1, setNewPass1] = useState('');
  const [newPass2, setNewPass2] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  
  // Prompts
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [newPromptText, setNewPromptText] = useState('');
  const [newPromptTag, setNewPromptTag] = useState('');
  
  // Lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState<string | null>(null);

  const t = {
    dashboard: isTr ? 'Gösterge Paneli' : 'Dashboard',
    users: isTr ? 'Kullanıcılar' : 'Users',
    prompts: isTr ? 'Promptlar' : 'Prompts',
    credentials: isTr ? 'Kimlik Bilgileri' : 'Credentials',
    logs: isTr ? 'Giriş Kayıtları' : 'Login Logs',
    onlineUsers: isTr ? 'Aktif Kullanıcılar' : 'Active Users',
    totalUsers: isTr ? 'Toplam Kullanıcı' : 'Total Users',
    totalGenerations: isTr ? 'Toplam Üretim' : 'Total Generations',
    totalLogins: isTr ? 'Toplam Giriş' : 'Total Logins',
    allUsers: isTr ? 'Tüm Kullanıcılar' : 'All Users',
    email: isTr ? 'E-Posta' : 'Email',
    password: isTr ? 'Şifre' : 'Password',
    provider: isTr ? 'Yöntem' : 'Provider',
    joined: isTr ? 'Katılma' : 'Joined',
    actions: isTr ? 'İşlemler' : 'Actions',
    edit: isTr ? 'Düzenle' : 'Edit',
    delete: isTr ? 'Sil' : 'Delete',
    show: isTr ? 'Göster' : 'Show',
    hide: isTr ? 'Gizle' : 'Hide',
    copy: isTr ? 'Kopyala' : 'Copy',
    change: isTr ? 'Değiştir' : 'Change',
    deleteUser: isTr ? 'Kullanıcı Sil' : 'Delete User',
    deleteConfirm: isTr ? 'Bu kullanıcıyı ve tüm verilerini silmek istediğinizden emin misiniz?' : 'Are you sure you want to delete this user and all their data?',
    yes: isTr ? 'Evet' : 'Yes',
    cancel: isTr ? 'İptal' : 'Cancel',
    save: isTr ? 'Kaydet' : 'Save',
    newPrompt: isTr ? 'Yeni Prompt' : 'New Prompt',
    adminPass: isTr ? 'Yönetici Şifresi' : 'Admin Password',
    currentPass: isTr ? 'Aktif Şifre' : 'Current Password',
    newPassLabel: isTr ? 'Yeni Şifre' : 'New Password',
    repeatPass: isTr ? 'Şifreyi Tekrarla' : 'Repeat Password',
    updatePass: isTr ? 'Şifreyi Güncelle' : 'Update Password',
    loginLogs: isTr ? 'Giriş ve Çıkış Kayıtları' : 'Login/Logout Records',
    user: isTr ? 'Kullanıcı' : 'User',
    action: isTr ? 'İşlem' : 'Action',
    time: isTr ? 'Zaman' : 'Time',
    noData: isTr ? 'Veri yok' : 'No data',
    copied: isTr ? 'Kopyalandı!' : 'Copied!',
    passMismatch: isTr ? 'Şifreler uyuşmuyor!' : 'Passwords do not match!',
    passShort: isTr ? 'Şifre en az 4 karakter olmalıdır!' : 'Password must be at least 4 characters!',
    passUpdated: isTr ? 'Şifre başarıyla güncellendi!' : 'Password updated successfully!',
    userCredentials: isTr ? 'Kullanıcı Giriş Bilgileri' : 'User Credentials',
    generationsCount: isTr ? 'Üretim Sayısı' : 'Generations Count',
  };

  const selectedUser = users.find(u => u.id === selectedUserId);
  const userGenerations = generations.filter(g => g.userId === selectedUserId);

  // Dashboard stats
  const activeUsers = users.length;
  const totalGenerations = generations.length;
  const totalLogins = loginLogs.length;

  const handleDeleteUser = (userId: string) => {
    setDeleteUserId(userId);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = () => {
    const updatedUsers = users.filter(u => u.id !== deleteUserId);
    const updatedGenerations = generations.filter(g => g.userId !== deleteUserId);
    onUpdateUsers(updatedUsers);
    onUpdateGenerations(updatedGenerations);
    setShowDeleteModal(false);
    if (selectedUserId === deleteUserId) {
      setSelectedUserId(updatedUsers[0]?.id || '');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUserId(user.id);
    setEditEmail(user.email);
    setEditPass(user.password || '');
    setEditProvider(user.provider);
  };

  const handleSaveUserEdit = () => {
    if (!editingUserId) return;
    const updatedUsers = users.map(u => 
      u.id === editingUserId 
        ? { ...u, email: editEmail, password: editPass, provider: editProvider }
        : u
    );
    onUpdateUsers(updatedUsers);
    setEditingUserId(null);
  };

  const handleAddPrompt = () => {
    if (!newPromptText.trim()) return;
    const newPrompt: PromptItem = {
      id: 'alt_' + Math.random().toString(36).substr(2, 9),
      text: newPromptText.trim(),
      isSystem: true,
      category: 'Admin-Added',
      tag: newPromptTag.trim() || undefined
    };
    onUpdateDefaultPrompts([...defaultPrompts, newPrompt]);
    setNewPromptText('');
    setNewPromptTag('');
  };

  const handleDeletePrompt = (id: string) => {
    onUpdateDefaultPrompts(defaultPrompts.filter(p => p.id !== id));
  };

  const handleChangeAdminPassword = () => {
    setPassError('');
    setPassSuccess('');

    if (!newPass1 || !newPass2) {
      setPassError(isTr ? 'Lütfen şifre alanlarını doldurun!' : 'Please fill password fields!');
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
    setPassSuccess(t.passUpdated);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPassword(id);
    setTimeout(() => setCopiedPassword(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 bg-zinc-100 dark:bg-zinc-900/80 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        {(['dashboard', 'users', 'prompts', 'credentials', 'logs'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setAdminTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              adminTab === tab 
                ? 'bg-primary-600 text-white shadow-md' 
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            {t[tab]}
          </button>
        ))}
      </div>

      {/* DASHBOARD TAB */}
      {adminTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-6">
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">{t.onlineUsers}</div>
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{activeUsers}</div>
            <div className="text-xs text-blue-500/70 mt-2">{isTr ? 'Kayıtlı kullanıcı' : 'Registered users'}</div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-6">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-2">{t.totalGenerations}</div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{totalGenerations}</div>
            <div className="text-xs text-emerald-500/70 mt-2">{isTr ? 'Görsel üretildi' : 'Images generated'}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-200 dark:border-purple-900/30 rounded-2xl p-6">
            <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase mb-2">{t.totalLogins}</div>
            <div className="text-3xl font-black text-purple-600 dark:text-purple-400">{totalLogins}</div>
            <div className="text-xs text-purple-500/70 mt-2">{isTr ? 'Giriş/çıkış' : 'Logins/logouts'}</div>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-6">
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase mb-2">{isTr ? 'Son 24h' : 'Last 24h'}</div>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
              {loginLogs.filter(l => {
                const date = new Date(l.timestamp);
                const now = new Date();
                return (now.getTime() - date.getTime()) < 24 * 60 * 60 * 1000;
              }).length}
            </div>
            <div className="text-xs text-amber-500/70 mt-2">{isTr ? 'Giriş kaydı' : 'Login records'}</div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black flex items-center gap-2">
                <Users size={16} className="text-primary-500" />
                {t.allUsers} ({users.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="text-left py-3 px-4 font-bold text-zinc-600 dark:text-zinc-400">{t.email}</th>
                    <th className="text-left py-3 px-4 font-bold text-zinc-600 dark:text-zinc-400">{t.password}</th>
                    <th className="text-left py-3 px-4 font-bold text-zinc-600 dark:text-zinc-400">{t.provider}</th>
                    <th className="text-left py-3 px-4 font-bold text-zinc-600 dark:text-zinc-400">{t.generationsCount}</th>
                    <th className="text-left py-3 px-4 font-bold text-zinc-600 dark:text-zinc-400">{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">{user.email}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-zinc-600 dark:text-zinc-400">
                            {showPassword === user.id ? user.password : '••••••••'}
                          </span>
                          <button
                            onClick={() => setShowPassword(showPassword === user.id ? null : user.id)}
                            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-500"
                            title={showPassword === user.id ? t.hide : t.show}
                          >
                            {showPassword === user.id ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(user.password || '', user.id)}
                            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-500"
                            title={t.copy}
                          >
                            {copiedPassword === user.id ? <CheckCircle size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded text-[10px] font-bold capitalize">
                          {user.provider}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">
                        {generations.filter(g => g.userId === user.id).length}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400"
                            title={t.edit}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded text-rose-600 dark:text-rose-400"
                            title={t.delete}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edit User Modal */}
            {editingUserId && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black">{t.edit}</h3>
                    <button onClick={() => setEditingUserId(null)} className="p-1">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">{t.email}</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">{t.password}</label>
                      <input
                        type="text"
                        value={editPass}
                        onChange={e => setEditPass(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">{t.provider}</label>
                      <select
                        value={editProvider}
                        onChange={e => setEditProvider(e.target.value as 'email' | 'google' | 'apple')}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs"
                      >
                        <option value="email">Email</option>
                        <option value="google">Google</option>
                        <option value="apple">Apple</option>
                      </select>
                    </div>

                    <button
                      onClick={handleSaveUserEdit}
                      className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-black mt-4"
                    >
                      {t.save}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROMPTS TAB */}
      {adminTab === 'prompts' && (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm font-black flex items-center gap-2 mb-6">
            <Lightbulb size={16} className="text-primary-500" />
            {t.prompts}
          </h3>

          <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
            {defaultPrompts.map(prompt => (
              <div key={prompt.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-white">{prompt.text}</p>
                  {prompt.tag && <p className="text-[10px] text-zinc-500 mt-1">#{prompt.tag}</p>}
                </div>
                <button
                  onClick={() => handleDeletePrompt(prompt.id)}
                  className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded text-rose-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <textarea
              value={newPromptText}
              onChange={e => setNewPromptText(e.target.value)}
              placeholder={isTr ? 'Yeni prompt yazın...' : 'Write new prompt...'}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs resize-none"
              rows={2}
            />
            <input
              type="text"
              value={newPromptTag}
              onChange={e => setNewPromptTag(e.target.value)}
              placeholder={isTr ? 'Etiket (opsiyonel)...' : 'Tag (optional)...'}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs"
            />
            <button
              onClick={handleAddPrompt}
              className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-black flex items-center justify-center gap-1"
            >
              <Plus size={14} />
              {t.newPrompt}
            </button>
          </div>
        </div>
      )}

      {/* CREDENTIALS TAB */}
      {adminTab === 'credentials' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Admin Password */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <h3 className="text-sm font-black flex items-center gap-2 mb-6">
              <Key size={16} className="text-primary-500" />
              {t.adminPass}
            </h3>

            <div className="space-y-3">
              <div className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded-lg flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300">{adminPasswordCurrent}</span>
                <button
                  onClick={() => copyToClipboard(adminPasswordCurrent, 'admin')}
                  className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded"
                >
                  {copiedPassword === 'admin' ? <CheckCircle size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">{t.newPassLabel}</label>
                <input
                  type="password"
                  value={newPass1}
                  onChange={e => setNewPass1(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">{t.repeatPass}</label>
                <input
                  type="password"
                  value={newPass2}
                  onChange={e => setNewPass2(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs"
                  placeholder="••••••••"
                />
              </div>

              {passError && <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{passError}</div>}
              {passSuccess && <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{passSuccess}</div>}

              <button
                onClick={handleChangeAdminPassword}
                className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-black"
              >
                {t.updatePass}
              </button>
            </div>
          </div>

          {/* User Credentials */}
          {selectedUser && (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
              <h3 className="text-sm font-black flex items-center gap-2 mb-6">
                <Settings size={16} className="text-primary-500" />
                {t.userCredentials}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">{isTr ? 'Kullanıcı Adı' : 'Username'}</label>
                  <input type="text" value={selectedUser.name} disabled className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs opacity-50" />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">{t.email}</label>
                  <input type="text" value={selectedUser.email} disabled className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs opacity-50" />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">{t.password}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type={showPassword === 'selected' ? 'text' : 'password'}
                      value={selectedUser.password || ''}
                      disabled
                      className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs opacity-50"
                    />
                    <button
                      onClick={() => setShowPassword(showPassword === 'selected' ? null : 'selected')}
                      className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded"
                    >
                      {showPassword === 'selected' ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(selectedUser.password || '', 'selected')}
                      className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded"
                    >
                      {copiedPassword === 'selected' ? <CheckCircle size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">{t.provider}</label>
                  <input type="text" value={selectedUser.provider} disabled className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs opacity-50" />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black flex items-center justify-center gap-1"
                >
                  <Trash2 size={14} />
                  {t.deleteUser}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LOGS TAB */}
      {adminTab === 'logs' && (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm font-black flex items-center gap-2 mb-6">
            <LogIn size={16} className="text-primary-500" />
            {t.loginLogs} ({loginLogs.length})
          </h3>

          {loginLogs.length === 0 ? (
            <div className="text-center py-10 text-zinc-400 text-xs">{t.noData}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="text-left py-3 px-4 font-bold text-zinc-600 dark:text-zinc-400">{t.user}</th>
                    <th className="text-left py-3 px-4 font-bold text-zinc-600 dark:text-zinc-400">{t.action}</th>
                    <th className="text-left py-3 px-4 font-bold text-zinc-600 dark:text-zinc-400">{t.provider}</th>
                    <th className="text-left py-3 px-4 font-bold text-zinc-600 dark:text-zinc-400">{t.time}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...loginLogs].reverse().map(log => (
                    <tr key={log.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">
                        {log.userName} <span className="text-zinc-500">({log.userEmail})</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-white text-[10px] font-bold flex w-fit gap-1 items-center ${log.action === 'login' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                          {log.action === 'login' ? <LogIn size={11} /> : <LogOut size={11} />}
                          {log.action === 'login' ? isTr ? 'Giriş' : 'Login' : isTr ? 'Çıkış' : 'Logout'}
                        </span>
                      </td>
                      <td className="py-3 px-4 capitalize text-zinc-600 dark:text-zinc-400">{log.provider}</td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <AlertTriangle size={20} />
              <h3 className="font-black text-sm">{t.deleteUser}</h3>
            </div>

            <p className="text-xs text-zinc-700 dark:text-zinc-300 mb-6">{t.deleteConfirm}</p>

            <div className="flex gap-3">
              <button
                onClick={confirmDeleteUser}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black"
              >
                {t.yes}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg text-xs font-black"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
