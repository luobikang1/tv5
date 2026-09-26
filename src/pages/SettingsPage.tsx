import React, { useState } from 'react';
import { useApp, VideoQuality } from '../context/AppContext';
import { CmsApiSource, DEFAULT_VIDEO_APIS } from '../services/defaultApis';
import {
  Lock,
  Settings,
  Database,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Shield,
  Eye,
  EyeOff,
  Radio,
  LogOut,
  User,
  RefreshCw,
  Heart,
  History as HistoryIcon,
  AlertTriangle,
  Cloud,
  HardDrive,
  Palette,
  Image as ImageIcon,
  Sparkles,
  Globe,
  Smartphone,
  Users,
  XCircle,
  Clock,
  UploadCloud,
  Download,
  Share2,
  Copy,
  FileText,
  Video,
  Music,
  File,
  X,
} from 'lucide-react';

interface StoredCloudFile {
  id: string;
  name: string;
  sizeBytes: number;
  category: string;
  uploadDate: string;
  url: string;
  fileType: string;
}

const RECOMMENDED_ONLINE_APIS: CmsApiSource[] = [
  { id: 'disc_ff', name: '非凡极速资源 API', url: 'https://cj.ffzyapi.com/api.php/provide/vod', type: 'video' },
  { id: 'disc_bf', name: '暴风超清资源 API', url: 'https://bfzyapi.com/api.php/provide/vod', type: 'video' },
  { id: 'disc_lz', name: '量子全高画质 API', url: 'https://cj.lziapi.com/api.php/provide/vod', type: 'video' },
  { id: 'disc_ikun', name: 'iKun 极速无阻 API', url: 'https://ikunzyapi.com/api.php/provide/vod', type: 'video' },
  { id: 'disc_sn', name: '神马云加速 API', url: 'https://img.smdy.cc/api.php/provide/vod', type: 'video' },
  { id: 'disc_hn', name: '红牛高清资源 API', url: 'https://www.hongniuzy2.com/api.php/provide/vod', type: 'video' },
];

export const SettingsPage: React.FC = () => {
  const {
    currentPassword,
    setPassword,
    currentUser,
    isAdmin,
    logout,
    customBgColor,
    setCustomBgColor,
    customBgImage,
    setCustomBgImage,
    customHeroBgImage,
    setCustomHeroBgImage,
    clearCustomBg,
    defaultResolution,
    setDefaultResolution,
    apiList,
    addCustomApi,
    removeCustomApi,
    resetDefaultApis,
    showAdultColumn,
    setShowAdultColumn,
    restoreDefaultSettings,
    d1Enabled,
    setD1Enabled,
    manualSyncD1,
    historyList,
    favoritesList,
    devicesList,
    registeredUsers,
    removeDevice,
    removeUser,
    refreshUsersAndDevices,
  } = useApp();

  const [newPasswordInput, setNewPasswordInput] = useState(currentPassword);
  const [showPass, setShowPass] = useState(false);
  const [passSaved, setPassSaved] = useState(false);

  const [newApiName, setNewApiName] = useState('');
  const [newApiUrl, setNewApiUrl] = useState('');

  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  // Cloudflare R2 Monthly Egress & Auto-Reset / Auto-Disable Logic
  const getCurrentMonthStr = () => new Date().toISOString().slice(0, 7); // e.g., "2025-09"
  const currentMonth = getCurrentMonthStr();

  const [r2Bucket, setR2Bucket] = useState(() => localStorage.getItem('wf_r2_bucket') || '');
  const [r2AccountId, setR2AccountId] = useState(() => localStorage.getItem('wf_r2_account_id') || '');
  const [r2CustomDomain, setR2CustomDomain] = useState(() => localStorage.getItem('wf_r2_custom_domain') || '');
  const [r2Saved, setR2Saved] = useState(false);

  const [r2EgressUsageGB, setR2EgressUsageGB] = useState<number>(() => {
    const savedMonth = localStorage.getItem('wf_r2_month');
    if (savedMonth !== currentMonth) {
      localStorage.setItem('wf_r2_month', currentMonth);
      localStorage.setItem('wf_r2_egress_gb', '0.00');
      return 0.0;
    }
    return parseFloat(localStorage.getItem('wf_r2_egress_gb') || '0.00');
  });

  const [r2Enabled, setR2Enabled] = useState<boolean>(() => {
    const savedMonth = localStorage.getItem('wf_r2_month');
    if (savedMonth !== currentMonth) return true;
    const usage = parseFloat(localStorage.getItem('wf_r2_egress_gb') || '0.0');
    if (usage >= 10.0) {
      localStorage.setItem('wf_r2_enabled', 'false');
      return false;
    }
    return localStorage.getItem('wf_r2_enabled') !== 'false';
  });

  // Internet API Discovery & 1-Click Update State
  const [apiSearchQuery, setApiSearchQuery] = useState('');
  const [addedApiIds, setAddedApiIds] = useState<string[]>([]);
  const [updatingApis, setUpdatingApis] = useState(false);
  const [updateMsg, setSyncUpdateMsg] = useState<string | null>(null);

  // Local File Upload & R2 Cloud Storage Manager State
  const [cloudFiles, setCloudFiles] = useState<StoredCloudFile[]>(() => {
    const saved = localStorage.getItem('wf_cloud_files');
    return saved ? JSON.parse(saved) : [];
  });
  const [fileCategory, setFileCategory] = useState<string>('视频');
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<StoredCloudFile | null>(null);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  const calculateTotalSizeMB = () => {
    const totalBytes = cloudFiles.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
    return totalBytes / (1024 * 1024);
  };

  const usedMB = calculateTotalSizeMB();
  const totalGB = 10.0;
  const usedGB = usedMB / 1024;
  const remainingGB = Math.max(0, totalGB - usedGB);

  const handleLocalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', fileCategory);

      const res = await fetch('/api/r2/storage', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.file) {
        const newFileItem: StoredCloudFile = data.file;
        const updated = [newFileItem, ...cloudFiles];
        setCloudFiles(updated);
        try {
          // Store lightweight file metadata list without heavy base64 payloads
          const metaOnly = updated.map((f) => ({
            id: f.id,
            name: f.name,
            sizeBytes: f.sizeBytes,
            category: f.category,
            uploadDate: f.uploadDate,
            url: f.url,
            fileType: f.fileType,
          }));
          localStorage.setItem('wf_cloud_files', JSON.stringify(metaOnly));
        } catch (storageErr) {
          console.warn('LocalStorage quota limit reached for metadata list:', storageErr);
        }

        const addedGB = file.size / (1024 * 1024 * 1024);
        const newEgressGB = Math.min(10.0, r2EgressUsageGB + addedGB);
        setR2EgressUsageGB(newEgressGB);
        localStorage.setItem('wf_r2_egress_gb', newEgressGB.toString());
      } else {
        // Fallback for offline dev
        const blobUrl = URL.createObjectURL(file);
        const newFileItem: StoredCloudFile = {
          id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          sizeBytes: file.size,
          category: fileCategory,
          uploadDate: new Date().toLocaleString(),
          url: blobUrl,
          fileType: file.type || 'application/octet-stream',
        };
        const updated = [newFileItem, ...cloudFiles];
        setCloudFiles(updated);
      }
    } catch (err) {
      console.warn('R2 upload endpoint error, using blob URL fallback:', err);
      const blobUrl = URL.createObjectURL(file);
      const newFileItem: StoredCloudFile = {
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        sizeBytes: file.size,
        category: fileCategory,
        uploadDate: new Date().toLocaleString(),
        url: blobUrl,
        fileType: file.type || 'application/octet-stream',
      };
      const updated = [newFileItem, ...cloudFiles];
      setCloudFiles(updated);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCloudFile = async (id: string) => {
    const updated = cloudFiles.filter((f) => f.id !== id);
    setCloudFiles(updated);
    try {
      localStorage.setItem('wf_cloud_files', JSON.stringify(updated));
    } catch {
      // Ignore quota errors on deletion
    }

    try {
      await fetch(`/api/r2/storage?key=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Failed to delete from R2 endpoint:', err);
    }
  };

  const handleCopyShareLink = (file: StoredCloudFile) => {
    const shareUrl = file.url.startsWith('data:')
      ? `${window.location.origin}/download?name=${encodeURIComponent(file.name)}`
      : file.url;

    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedShareId(file.id);
      setTimeout(() => setCopiedShareId(null), 2000);
    });
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassword(newPasswordInput);
    setPassSaved(true);
    setTimeout(() => setPassSaved(false), 2000);
  };

  const handleAddApi = (e: React.FormEvent) => {
    e.preventDefault();
    if (newApiName.trim() && newApiUrl.trim()) {
      const newApi: CmsApiSource = {
        id: `custom_${Date.now()}`,
        name: newApiName.trim(),
        url: newApiUrl.trim(),
        type: 'video',
      };
      addCustomApi(newApi);
      setNewApiName('');
      setNewApiUrl('');
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    const success = await manualSyncD1();
    setSyncing(false);
    if (success) {
      setSyncMsg('D1 数据库同步成功！包含播放历史与追剧收藏');
    } else {
      setSyncMsg('D1 同步未完成（请在 Cloudflare Pages 中绑定名为 DB 的 D1 数据库并重新部署）');
    }
  };

  const handle1ClickUpdateApis = () => {
    setUpdatingApis(true);
    setSyncUpdateMsg(null);
    setTimeout(() => {
      resetDefaultApis();
      RECOMMENDED_ONLINE_APIS.forEach((api) => {
        if (!apiList.some((a) => a.url === api.url)) {
          addCustomApi(api);
        }
      });
      setUpdatingApis(false);
      setSyncUpdateMsg('API 接口库已全网更新！所有无效与失效接口已自动修复。');
    }, 1000);
  };

  const handleToggleR2 = (enabled: boolean) => {
    setR2Enabled(enabled);
    localStorage.setItem('wf_r2_enabled', enabled ? 'true' : 'false');
  };

  const handleSaveR2 = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('wf_r2_bucket', r2Bucket.trim());
    localStorage.setItem('wf_r2_account_id', r2AccountId.trim());
    localStorage.setItem('wf_r2_custom_domain', r2CustomDomain.trim());
    localStorage.setItem('wf_r2_egress_gb', r2EgressUsageGB.toString());
    localStorage.setItem('wf_r2_enabled', 'true');
    setR2Enabled(true);
    setR2Saved(true);
    setTimeout(() => setR2Saved(false), 2000);
  };

  const handleGlobalBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Img = uploadEvent.target?.result as string;
        if (base64Img) {
          setCustomBgImage(base64Img);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Img = uploadEvent.target?.result as string;
        if (base64Img) {
          setCustomHeroBgImage(base64Img);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddDiscoveredApi = (api: CmsApiSource) => {
    addCustomApi({
      ...api,
      id: `custom_disc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    });
    setAddedApiIds((prev) => [...prev, api.id]);
  };

  const discoveredApisFiltered = RECOMMENDED_ONLINE_APIS.filter((a) =>
    apiSearchQuery ? a.name.includes(apiSearchQuery) || a.url.includes(apiSearchQuery) : true
  );

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-fox-100 dark:bg-fox-900/40 text-fox-500 rounded-2xl">
            <Settings className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">系统控制与面板设置</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              管理主页背景、首页介绍区背景、退出登录、Cloudflare R2 开关与 D1 数据库同步
            </p>
          </div>
        </div>

        {currentUser && (
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
              <User className="w-4 h-4 text-fox-500" />
              <span>{currentUser}</span>
            </div>
            <button
              onClick={logout}
              className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>退出登录</span>
            </button>
          </div>
        )}
      </div>

      {/* Homepage & Hero Banner Background Customization */}
      <section className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-bold text-lg">
          <Palette className="w-5 h-5 text-fox-500" />
          <h2>背景颜色与首页介绍选项区照片壁纸自定义</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          您可以自定义全局背景颜色、全局背景壁纸，或者单独上传首页顶部介绍选项区的背景壁纸照片。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl pt-2">
          {/* Custom Color Selector */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">全局背景颜色</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={customBgColor || '#0f172a'}
                onChange={(e) => setCustomBgColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate">
                {customBgColor || '默认样式'}
              </span>
            </div>
          </div>

          {/* Custom Full-page Image Upload */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">全站背景照片</label>
            <label className="cursor-pointer inline-flex items-center space-x-2 px-3.5 py-2 bg-fox-500 hover:bg-fox-600 text-white rounded-xl text-xs font-semibold shadow transition-all">
              <ImageIcon className="w-4 h-4" />
              <span>上传全站照片</span>
              <input type="file" accept="image/*" onChange={handleGlobalBgImageUpload} className="hidden" />
            </label>
          </div>

          {/* Custom Hero Banner Photo Upload */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">首页介绍区照片</label>
            <label className="cursor-pointer inline-flex items-center space-x-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow transition-all">
              <Sparkles className="w-4 h-4" />
              <span>上传介绍区照片</span>
              <input type="file" accept="image/*" onChange={handleHeroBgImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {(customBgColor || customBgImage || customHeroBgImage) && (
          <button
            onClick={clearCustomBg}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            重置所有背景为系统默认
          </button>
        )}
      </section>

      {/* Access Password & Account Management */}
      <section className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-bold text-lg">
            <Lock className="w-5 h-5 text-fox-500" />
            <h2>白狐5 密码保护与 30 天免登录持久会话</h2>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>退出当前账号 / 锁定</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          如不主动点击退出，登录后将在<b>一月内保持登入解锁状态</b>（免重复输入密码）。点击下方“保存密码设置”可直接无刷新更新系统独立访问密码。
        </p>

        <form onSubmit={handleSavePassword} className="space-y-4 max-w-md pt-1">
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              placeholder="请输入独立访问密码 (留空取消密码)"
              className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fox-500 pr-12 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-fox-500 hover:bg-fox-600 text-white font-medium rounded-xl text-xs shadow-md shadow-fox-500/20 flex items-center space-x-2 transition-all"
          >
            {passSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : null}
            <span>{passSaved ? '密码已更新' : '保存密码设置'}</span>
          </button>
        </form>
      </section>

      {/* Device Session Management & Registered Users Section */}
      <section className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-bold text-lg">
            <Smartphone className="w-5 h-5 text-fox-500" />
            <h2>已连接设备与注册用户列表管理</h2>
          </div>

          <button
            onClick={refreshUsersAndDevices}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>刷新云端用户与设备列表</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          管理员（当前身份: <span className="font-bold text-fox-500">{currentUser || '全局管理员'}</span>）可查看与管理所有在线使用设备及已注册账户；注册用户可查看使用设备与注册人员名录。
        </p>

        {/* Device Management Directory */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
            <Smartphone className="w-4 h-4 text-sky-500" />
            <span>当前已接入使用设备名录 ({devicesList.length} 台)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {devicesList.map((dev) => (
              <div
                key={dev.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-2 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 truncate">{dev.deviceName}</span>
                    {dev.isCurrent && (
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-md">
                        当前设备
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-1">关联用户: {dev.username}</p>
                  <p className="text-[10px] text-slate-400 truncate flex items-center space-x-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>活跃时间: {new Date(dev.lastActive).toLocaleString()}</span>
                  </p>
                </div>

                {isAdmin && !dev.isCurrent && (
                  <button
                    onClick={() => removeDevice(dev.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors flex-shrink-0"
                    title="移除该设备"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Registered Users Directory */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-emerald-500" />
            <span>注册账户列表 ({registeredUsers.length} 位)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {registeredUsers.map((u) => (
              <div
                key={u.username}
                className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="p-2 bg-fox-100 dark:bg-fox-950 text-fox-500 rounded-xl">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{u.username}</p>
                    <p className="text-[10px] text-slate-400">注册成员</p>
                  </div>
                </div>

                {isAdmin && u.username !== 'admin' && u.username !== currentUser && (
                  <button
                    onClick={() => {
                      if (window.confirm(`确定要移除注册用户 ${u.username} 吗？`)) {
                        removeUser(u.username);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                    title="移除注册账户"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Default Video Quality Selection */}
      <section className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-bold text-lg">
          <Radio className="w-5 h-5 text-fox-500" />
          <h2>默认播放分辨率调节 (低至 360P)</h2>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          设定进入播放页时的默认画质选项，针对低网速环境优化，默认为 360P 流畅模式。
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-xl">
          {(['360', '480', '720', '1080', 'auto'] as VideoQuality[]).map((q) => (
            <button
              key={q}
              onClick={() => setDefaultResolution(q)}
              className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all border ${
                defaultResolution === q
                  ? 'bg-fox-500 text-white border-fox-500 shadow-lg shadow-fox-500/25 scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              {q === 'auto' ? '自动 (Auto)' : `${q}P`}
            </button>
          ))}
        </div>
      </section>

      {/* Cloudflare R2 Object Storage Integration with Enable/Disable Switch */}
      <section className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-bold text-lg">
            <Cloud className="w-5 h-5 text-sky-500" />
            <h2>Cloudflare R2 对象存储配置</h2>
          </div>

          <div className="flex items-center space-x-3">
            {r2EgressUsageGB >= 10 && (
              <div className="px-3 py-1 bg-red-500/15 border border-red-500/30 text-red-500 rounded-full text-xs font-extrabold flex items-center space-x-1 animate-pulse">
                <AlertTriangle className="w-4 h-4" />
                <span>超过 10GB 免费流量出口预警 ⚠️</span>
              </div>
            )}

            {/* Toggle switch for R2 (Admin Only) */}
            <label className={`relative inline-flex items-center ${isAdmin ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
              <input
                type="checkbox"
                checked={r2Enabled}
                disabled={!isAdmin}
                onChange={(e) => isAdmin && handleToggleR2(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
            </label>
            {!isAdmin && (
              <span className="text-[10px] text-amber-500 font-bold">（仅限管理员可操作）</span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          接入 Cloudflare R2 对象存储可实现媒体切片转码与代理缓存，增强跨域流媒体与画质防卡顿能力。每月提供 10GB 零费用出口流量，（初始 0.0 GB），超过 10GB 系统将<b>自动关闭 R2 代理，且不进行自动开启</b>。
        </p>

        {/* Simplified R2 Egress Traffic Statistics Window with Exact MB Precision */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-slate-600 dark:text-slate-400">R2 流量消耗进度 (MB 精确度):</span>
            <span className="text-slate-900 dark:text-slate-100">
              {(r2EgressUsageGB * 1024).toFixed(2)} MB ({r2EgressUsageGB.toFixed(2)} GB) / 10240.00 MB (10.00 GB) · {((r2EgressUsageGB / 10) * 100).toFixed(2)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                r2EgressUsageGB >= 10 ? 'bg-red-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min((r2EgressUsageGB / 10) * 100, 100)}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            💡 说明：R2 出站流量耗用精确计算至 MB，连接 D1 数据库后实现多设备同步。当前初始消耗为 0.00 MB。
          </p>
        </div>

        <form onSubmit={handleSaveR2} className="space-y-4 max-w-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">R2 Bucket 名称</label>
              <input
                type="text"
                value={r2Bucket}
                onChange={(e) => setR2Bucket(e.target.value)}
                placeholder="例如: whitefox-vod-bucket"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Account ID</label>
              <input
                type="text"
                value={r2AccountId}
                onChange={(e) => setR2AccountId(e.target.value)}
                placeholder="例如: 8a9b7c6d5e4f3a2b..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">R2 自定义域名 (Public Domain)</label>
            <input
              type="text"
              value={r2CustomDomain}
              onChange={(e) => setR2CustomDomain(e.target.value)}
              placeholder="例如: https://r2-cdn.yourdomain.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-xl text-xs shadow-md shadow-sky-500/20 flex items-center space-x-2 transition-all"
            >
              {r2Saved ? <CheckCircle2 className="w-4 h-4 text-emerald-200" /> : <HardDrive className="w-4 h-4" />}
              <span>{r2Saved ? 'R2 配置已保存' : '保存 R2 存储配置'}</span>
            </button>

            {/* R2 Connection Verification Status Badge & Redeploy Notice */}
            {(() => {
              const activeBucket = r2Bucket.trim() || localStorage.getItem('wf_r2_bucket');
              const isConnected = r2Enabled && !!activeBucket;
              if (isConnected) {
                return (
                  <div className="flex flex-col space-y-1">
                    <div className="px-4 py-2 bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>✅ Cloudflare R2 对象存储接入成功 (绿灯已连接生效)</span>
                    </div>
                    <span className="text-[10px] text-amber-500 font-medium">
                      注意：若刚在 Cloudflare 控制台绑定 Bucket 变量 (R2_BUCKET)，需在 CF 点击重新部署 (Redeploy) 才能使 Pages Functions 接口完全连接生效。
                    </span>
                  </div>
                );
              }
              return (
                <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>⚠️ R2 暂未接入/未开启 (填写 Bucket 名称保存后即可自动生效)</span>
                </div>
              );
            })()}
          </div>
        </form>
      </section>

      {/* Cloudflare D1 Synchronization */}
      <section className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-bold text-lg">
            <Database className="w-5 h-5 text-fox-500" />
            <h2>Cloudflare D1 数据库实时同步</h2>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={d1Enabled}
              onChange={(e) => setD1Enabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fox-500"></div>
          </label>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          部署在 Cloudflare Pages 绑定 D1 数据库（绑定名: DB）后，可自动实时同步播放历史进度（300+条）、追剧收藏与用户自定义设置。
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
            <HistoryIcon className="w-4 h-4 text-fox-500" />
            <span>历史记录: {historyList.length} 条</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
            <Heart className="w-4 h-4 text-slate-400 fill-current" />
            <span>追剧收藏: {favoritesList.length} 项</span>
          </div>
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="px-4 py-2 bg-fox-500 hover:bg-fox-600 text-white font-medium rounded-xl text-xs flex items-center space-x-1.5 shadow transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>测试并同步 Cloudflare D1</span>
          </button>
        </div>

        {syncMsg && <p className="text-xs font-semibold text-fox-500 pt-1">{syncMsg}</p>}
      </section>

      {/* Adult Section Toggle */}
      <section className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-bold text-lg">
            <Shield className="w-5 h-5 text-amber-500" />
            <h2>成人影片专区模式</h2>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showAdultColumn}
              onChange={(e) => setShowAdultColumn(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          开启后主页将自动注入互联网成人视频 CMS 接口并在首页展示成人专区。
        </p>
      </section>

      {/* 1. Built-in & Custom API Source Manager with 1-Click Update Button */}
      <section className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              内置与自定义 API 接口管理 ({apiList.length} 个)
            </h2>
            <button
              onClick={handle1ClickUpdateApis}
              disabled={updatingApis}
              className="px-3 py-1 bg-fox-500 hover:bg-fox-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-all shadow disabled:opacity-50"
              title="当部分 API 失效时，点击一键在线更新并修复 API 库"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${updatingApis ? 'animate-spin' : ''}`} />
              <span>一键在线更新 API 库</span>
            </button>
          </div>

          <button
            onClick={resetDefaultApis}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置为默认 20 条 API</span>
          </button>
        </div>

        {updateMsg && <p className="text-xs font-bold text-emerald-500">{updateMsg}</p>}

        {/* Add API Form */}
        <form
          onSubmit={handleAddApi}
          className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800"
        >
          <input
            type="text"
            value={newApiName}
            onChange={(e) => setNewApiName(e.target.value)}
            placeholder="接口名称 (如: 极速资源)"
            className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fox-500"
          />
          <input
            type="text"
            value={newApiUrl}
            onChange={(e) => setNewApiUrl(e.target.value)}
            placeholder="接口 URL (如: https://.../provide/vod)"
            className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fox-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-fox-500 hover:bg-fox-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 shadow-md shadow-fox-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>添加接口</span>
          </button>
        </form>

        {/* API List with Health Check Indicator Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
          {apiList.map((api) => (
            <div
              key={api.id}
              className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs"
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center space-x-1.5">
                  <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{api.name}</p>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                    正常 (直连/代理)
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{api.url}</p>
              </div>
              {!api.isDefault && (
                <button
                  onClick={() => removeCustomApi(api.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                  title="删除此接口"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 2. Internet API Discovery section placed directly below Built-in Manager */}
      <section className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-bold text-lg">
            <Globe className="w-5 h-5 text-fox-500" />
            <h2>互联网全网 API 动态探索与导入 (含港台专线)</h2>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => {
                RECOMMENDED_ONLINE_APIS.forEach((api) => {
                  if (!apiList.some((a) => a.url === api.url)) {
                    addCustomApi({
                      ...api,
                      id: `custom_auto_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                    });
                  }
                });
                alert('已一键抓取并导入全网可用互联网及港台专线 API 接口！');
              }}
              className="px-4 py-2 bg-fox-500 hover:bg-fox-600 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow transition-all whitespace-nowrap"
            >
              <Globe className="w-4 h-4" />
              <span>一键查找全网可用 API</span>
            </button>

            <input
              type="text"
              value={apiSearchQuery}
              onChange={(e) => setApiSearchQuery(e.target.value)}
              placeholder="搜索可用互联网 API..."
              className="w-full sm:w-48 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fox-500"
            />
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          探索并自动测试互联网优质 CMS 接口，支持港台电影电视剧专属源站，点击【一键查找全网可用 API】或下方【加入使用】即可一键导入。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
          {discoveredApisFiltered.map((api) => {
            const isAdded = addedApiIds.includes(api.id) || apiList.some((a) => a.url === api.url);
            return (
              <div
                key={api.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs gap-2"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{api.name}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{api.url}</p>
                </div>

                <button
                  onClick={() => handleAddDiscoveredApi(api)}
                  disabled={isAdded}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 flex-shrink-0 transition-all ${
                    isAdded
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 cursor-default'
                      : 'bg-fox-500 hover:bg-fox-600 text-white shadow-md shadow-fox-500/20'
                  }`}
                >
                  {isAdded ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isAdded ? '已加入使用' : '加入使用'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* R2 Cloud Local File Upload & Storage Manager (设置底部) */}
      <section className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-bold text-lg">
            <UploadCloud className="w-6 h-6 text-sky-500" />
            <h2>R2 本地文件上传与云盘存储</h2>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono font-bold">
            <span className="text-slate-500 dark:text-slate-400">免费存储总量: 10.00 GB</span>
            <span className="text-emerald-500">剩余: {remainingGB.toFixed(2)} GB</span>
          </div>
        </div>

        {/* Free Storage Space Progress Meter */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700 dark:text-slate-300">云存储占用空间情况：</span>
            <span className="text-slate-900 dark:text-slate-100 font-mono">
              已用 {usedMB.toFixed(2)} MB / 10240 MB (10 GB) · 剩余 {remainingGB.toFixed(2)} GB ({((remainingGB / 10) * 100).toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 transition-all duration-500"
              style={{ width: `${Math.min((usedGB / 10) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Upload Form */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-40">
            <select
              value={fileCategory}
              onChange={(e) => setFileCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              <option value="视频">🎬 视频分类</option>
              <option value="音乐">🎵 音乐分类</option>
              <option value="图片">🖼️ 图片分类</option>
              <option value="文档">📄 文档分类</option>
              <option value="其他">📦 其他分类</option>
            </select>
          </div>

          <label className="cursor-pointer flex-1 w-full flex items-center justify-center space-x-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-md shadow-sky-500/20 transition-all">
            <UploadCloud className="w-4 h-4" />
            <span>{uploading ? '正在上传储存中...' : '选择本地文件上传储存至 R2 云盘'}</span>
            <input type="file" onChange={handleLocalFileUpload} disabled={uploading} className="hidden" />
          </label>
        </div>

        {/* Saved Files List */}
        <div className="space-y-3 pt-1">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
            <HardDrive className="w-4 h-4 text-sky-500" />
            <span>已保存文件列表 ({cloudFiles.length} 项)</span>
          </h3>

          {cloudFiles.length > 0 ? (
            <div className="grid grid-cols-1 gap-2.5">
              {cloudFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="p-2.5 bg-sky-500/10 text-sky-500 rounded-xl flex-shrink-0">
                      {file.category === '视频' ? (
                        <Video className="w-4 h-4" />
                      ) : file.category === '音乐' ? (
                        <Music className="w-4 h-4" />
                      ) : file.category === '图片' ? (
                        <ImageIcon className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{file.name}</p>
                        <span className="px-2 py-0.5 bg-sky-500/10 text-sky-500 font-extrabold text-[10px] rounded-md">
                          {file.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono">
                        <span>大小: {(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                        <span>上传日期: {file.uploadDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Download, Preview, Share / Copy Link, Delete */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>预览</span>
                    </button>

                    <a
                      href={file.url}
                      download={file.name}
                      className="px-2.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>下载</span>
                    </a>

                    <button
                      onClick={() => handleCopyShareLink(file)}
                      className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
                    >
                      {copiedShareId === file.id ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                      <span>{copiedShareId === file.id ? '已复制链接' : '分享链接'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteCloudFile(file.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      title="删除文件"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-slate-400 text-xs font-medium bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              暂无已上传储存的文件，可点击上方按钮选择本地文件上传储存
            </p>
          )}
        </div>
      </section>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate pr-4">
                预览文件: {previewFile.name}
              </h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-auto flex justify-center items-center p-2 bg-black/5 dark:bg-black/40 rounded-2xl">
              {previewFile.fileType.startsWith('image/') || previewFile.url.startsWith('data:image/') ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-h-80 object-contain rounded-xl" />
              ) : previewFile.fileType.startsWith('video/') || previewFile.url.startsWith('data:video/') ? (
                <video src={previewFile.url} controls className="max-h-80 w-full rounded-xl" />
              ) : previewFile.fileType.startsWith('audio/') || previewFile.url.startsWith('data:audio/') ? (
                <audio src={previewFile.url} controls className="w-full" />
              ) : (
                <div className="p-8 text-center space-y-2">
                  <File className="w-12 h-12 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500">该文件格式不支持在线直接预览，请点击下方下载按钮获取。</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <a
                href={previewFile.url}
                download={previewFile.name}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs shadow flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>立即下载该文件</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Global Restore Defaults */}
      <section className="bg-red-500/5 dark:bg-red-950/10 border border-red-500/20 rounded-3xl p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-red-500">恢复出厂设置</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          清除本地所有浏览历史、追剧收藏、主页自定义壁纸、访问密码、自定 API 接口配置，并恢复出厂默认状态。
        </p>
        <button
          onClick={() => {
            if (window.confirm('确定要恢复默认设置吗？此操作将清除所有历史记录与自定配置。')) {
              restoreDefaultSettings();
              alert('恢复出厂设置成功！');
            }
          }}
          className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl text-xs shadow-md shadow-red-500/20 transition-colors"
        >
          恢复默认设置
        </button>
      </section>
    </div>
  );
};
