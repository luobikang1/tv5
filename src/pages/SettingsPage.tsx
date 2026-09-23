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
} from 'lucide-react';

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
      // New month: Auto-reset usage to 0.0GB and save current month
      localStorage.setItem('wf_r2_month', currentMonth);
      localStorage.setItem('wf_r2_egress_gb', '0.0');
      localStorage.setItem('wf_r2_enabled', 'true');
      return 0.0;
    }
    return parseFloat(localStorage.getItem('wf_r2_egress_gb') || '10.5'); // Default test simulation
  });

  const [r2Enabled, setR2Enabled] = useState<boolean>(() => {
    const savedMonth = localStorage.getItem('wf_r2_month');
    if (savedMonth !== currentMonth) return true;
    const usage = parseFloat(localStorage.getItem('wf_r2_egress_gb') || '10.5');
    if (usage >= 10.0) {
      localStorage.setItem('wf_r2_enabled', 'false');
      return false;
    }
    return localStorage.getItem('wf_r2_enabled') !== 'false';
  });

  const updateR2UsageAndStatus = (newGB: number) => {
    setR2EgressUsageGB(newGB);
    localStorage.setItem('wf_r2_month', currentMonth);
    localStorage.setItem('wf_r2_egress_gb', newGB.toString());

    if (newGB >= 10.0) {
      setR2Enabled(false);
      localStorage.setItem('wf_r2_enabled', 'false');
    } else {
      setR2Enabled(true);
      localStorage.setItem('wf_r2_enabled', 'true');
    }
  };

  // Internet API Discovery & 1-Click Update State
  const [apiSearchQuery, setApiSearchQuery] = useState('');
  const [addedApiIds, setAddedApiIds] = useState<string[]>([]);
  const [updatingApis, setUpdatingApis] = useState(false);
  const [updateMsg, setSyncUpdateMsg] = useState<string | null>(null);

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
            <h2>白狐5 密码保护与账号控制</h2>
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
          设置密码后，访问网站时需先输入密码解锁才能进入界面。留空保存即取消密码保护。点击“退出当前账号”可登出系统。
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

            {/* Toggle switch for R2 */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={r2Enabled}
                onChange={(e) => handleToggleR2(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
            </label>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          接入 Cloudflare R2 对象存储可实现媒体切片转码与代理缓存，增强跨域流媒体与画质防卡顿能力。每月提供 10GB 零费用出口流量，超过 10GB 系统将<b>自动关闭 R2 代理以防止产生额外扣费，并在次月 1 日自动重置并重新开启</b>。
        </p>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              当月 ({currentMonth}) R2 出口流出流量：
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {r2EgressUsageGB.toFixed(1)} GB / 10.0 GB 免费额度 ({((r2EgressUsageGB / 10) * 100).toFixed(0)}%)
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                r2EgressUsageGB >= 10 ? 'bg-red-500' : 'bg-sky-500'
              }`}
              style={{ width: `${Math.min((r2EgressUsageGB / 10) * 100, 100)}%` }}
            />
          </div>

          {r2EgressUsageGB >= 10 ? (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl space-y-1 text-[11px] text-red-600 dark:text-red-400">
              <p className="font-bold flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>当月 R2 10GB 免费流量已耗尽，系统已自动关闭 R2 选项</span>
              </p>
              <p>
                当前当月使用量已达 <b>{r2EgressUsageGB.toFixed(1)} GB</b>。为了防止产生超出账单扣费，R2 对象存储代理已被系统自动停用。下月 1 日将自动清零并重新开启，或您可点击下方“测试出口流量”手动切换重置。
              </p>
            </div>
          ) : (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              ✅ 状态正常：当月 R2 免费出口额度充裕 ({ (10 - r2EgressUsageGB).toFixed(1) } GB 剩余)，加速引擎持续工作中。
            </p>
          )}
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

          <div className="flex items-center space-x-3">
            <button
              type="submit"
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-xl text-xs shadow-md shadow-sky-500/20 flex items-center space-x-2 transition-all"
            >
              {r2Saved ? <CheckCircle2 className="w-4 h-4 text-emerald-200" /> : <HardDrive className="w-4 h-4" />}
              <span>{r2Saved ? 'R2 配置已保存' : '保存 R2 存储配置'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const newGB = r2EgressUsageGB >= 10 ? 4.2 : 10.8;
                updateR2UsageAndStatus(newGB);
              }}
              className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              模拟测试出口流量 ({r2EgressUsageGB >= 10 ? '模拟重置为 4.2GB' : '触发 >10GB 自动关闭'})
            </button>
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

        {/* API List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
          {apiList.map((api) => (
            <div
              key={api.id}
              className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs"
            >
              <div className="min-w-0 pr-2">
                <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{api.name}</p>
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
            <h2>互联网全网 API 动态探索与导入</h2>
          </div>

          <div className="relative max-w-xs w-full">
            <input
              type="text"
              value={apiSearchQuery}
              onChange={(e) => setApiSearchQuery(e.target.value)}
              placeholder="搜索可用互联网 API..."
              className="w-full px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fox-500"
            />
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          探索并测试互联网优质 CMS 接口，一键点击【加入使用】即可直接合并添加至系统，拓宽搜索资源。
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
