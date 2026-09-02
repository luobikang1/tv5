import React, { useState } from 'react';
import { useApp, VideoQuality } from '../context/AppContext';
import { CmsApiSource } from '../services/defaultApis';
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
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    currentPassword,
    setPassword,
    currentUser,
    logout,
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
  } = useApp();

  const [newPasswordInput, setNewPasswordInput] = useState(currentPassword);
  const [showPass, setShowPass] = useState(false);
  const [passSaved, setPassSaved] = useState(false);

  const [newApiName, setNewApiName] = useState('');
  const [newApiUrl, setNewApiUrl] = useState('');

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

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-fox-100 dark:bg-fox-900/40 text-fox-500 rounded-2xl">
            <Settings className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">系统控制与个性化设置</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              管理独立访问密码、默认清晰度、视频接口与同步设置
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

      {/* Access Password Settings */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-bold text-lg">
          <Lock className="w-5 h-5 text-fox-500" />
          <h2>白狐5 访问密码保护</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          设置密码后，访问网站时需先输入密码解锁才能进入界面。留空保存即取消密码保护。
        </p>

        <form onSubmit={handleSavePassword} className="space-y-4 max-w-md">
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
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-bold text-lg">
          <Radio className="w-5 h-5 text-fox-500" />
          <h2>默认播放清晰度 (低至 360P)</h2>
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

      {/* Cloudflare D1 Synchronization */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-bold text-lg">
            <Database className="w-5 h-5 text-fox-500" />
            <h2>Cloudflare D1 数据库同步</h2>
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
          部署在 Cloudflare Pages 绑定 D1 数据库后，可开启注册用户名/密码以及多端历史进度同步。
        </p>
      </section>

      {/* Adult Section Toggle */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
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

      {/* API Source List & Custom Manager */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            内置与自定义 API 接口管理 ({apiList.length} 个)
          </h2>
          <button
            onClick={resetDefaultApis}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置为默认 20 条 API</span>
          </button>
        </div>

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

      {/* Global Restore Defaults */}
      <section className="bg-red-500/5 dark:bg-red-950/10 border border-red-500/20 rounded-3xl p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-red-500">恢复出厂设置</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          清除本地所有浏览历史、访问密码、自定 API 接口配置，并恢复出厂默认状态。
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
