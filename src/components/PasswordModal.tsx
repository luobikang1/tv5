import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, User, KeyRound, Eye, EyeOff, UserPlus, Image as ImageIcon, Check } from 'lucide-react';

export const PasswordModal: React.FC = () => {
  const {
    isUnlocked,
    verifyPassword,
    loginUser,
    registerUser,
    loginBgImage,
    setLoginBgImage,
    updateUserCredentials,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'password' | 'login' | 'register' | 'settings'>('password');

  // Input states
  const [passwordInput, setPasswordInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [accountPassInput, setAccountPassInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Background Customization
  const [bgInputUrl, setBgInputUrl] = useState(loginBgImage);

  // Status messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (isUnlocked) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = verifyPassword(passwordInput);
    if (!success) {
      setErrorMsg('访问密码错误，请重新输入');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!usernameInput || !accountPassInput) {
      setErrorMsg('请完整填写用户名与密码');
      return;
    }
    const res = await loginUser(usernameInput, accountPassInput);
    if (!res.success) {
      setErrorMsg(res.message || '登录失败');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!usernameInput || !accountPassInput) {
      setErrorMsg('请完整填写用户名与密码');
      return;
    }
    const res = await registerUser(usernameInput, accountPassInput);
    if (res.success) {
      setSuccessMsg('注册成功！请使用注册账号登录');
      setActiveTab('login');
    } else {
      setErrorMsg(res.message || '注册失败');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setBgInputUrl(base64);
          setLoginBgImage(base64);
          setSuccessMsg('自定义背景图片上传完成');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [currentPassVerify, setCurrentPassVerify] = useState('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // If changing password/credentials or saving settings on lock modal, verify current password first
    if (!verifyPassword(currentPassVerify)) {
      setErrorMsg('修改失败：原访问密码不正确');
      return;
    }

    if (bgInputUrl) {
      setLoginBgImage(bgInputUrl);
    }
    if (usernameInput || accountPassInput) {
      updateUserCredentials(usernameInput, accountPassInput);
    }
    setSuccessMsg('凭据与背景设定已成功修改');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cover bg-center transition-all duration-500"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url('${loginBgImage}')`,
      }}
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full">
        {/* Header Logo with WhiteFox Default Avatar */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-fox-500 text-white shadow-xl shadow-fox-500/30 mb-3 transform hover:scale-105 transition-transform">
            <span className="text-xl font-black tracking-widest">白狐</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">白狐5 极速控制面板</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">请输入系统部署密码、使用环境变量密码或登录账号</p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 mb-6 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('password');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              activeTab === 'password'
                ? 'bg-fox-500 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            密码解锁
          </button>
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              activeTab === 'login'
                ? 'bg-fox-500 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            账号登录
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              activeTab === 'register'
                ? 'bg-fox-500 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            注册
          </button>
          <button
            onClick={() => {
              setActiveTab('settings');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              activeTab === 'settings'
                ? 'bg-fox-500 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            修改设定
          </button>
        </div>

        {/* Messages */}
        {errorMsg && <p className="text-red-500 text-xs text-center mb-4 font-medium">{errorMsg}</p>}
        {successMsg && <p className="text-emerald-500 text-xs text-center mb-4 font-medium">{successMsg}</p>}

        {/* Form 1: Password Unlock */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                系统全局访问密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="请输入访问密码..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fox-500 transition-all pr-12 text-sm"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-fox-500 hover:bg-fox-600 text-white font-medium rounded-xl shadow-lg shadow-fox-500/25 transition-all"
            >
              解锁面板
            </button>
          </form>
        )}

        {/* Form 2: User Login */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">用户名</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="请输入注册用户名..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fox-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">密码</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={accountPassInput}
                  onChange={(e) => setAccountPassInput(e.target.value)}
                  placeholder="请输入账号密码..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fox-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-fox-500 hover:bg-fox-600 text-white font-medium rounded-xl shadow-lg shadow-fox-500/25 transition-all"
            >
              登入账号
            </button>
          </form>
        )}

        {/* Form 3: User Register */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">设定用户名</label>
              <div className="relative">
                <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="请输入新用户名..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fox-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">设定密码</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={accountPassInput}
                  onChange={(e) => setAccountPassInput(e.target.value)}
                  placeholder="请输入密码..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fox-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-fox-500 hover:bg-fox-600 text-white font-medium rounded-xl shadow-lg shadow-fox-500/25 transition-all"
            >
              注册新用户
            </button>
          </form>
        )}

        {/* Form 4: Login Settings & Custom Background Upload */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                当前访问密码验证 (必须)
              </label>
              <input
                type="password"
                value={currentPassVerify}
                onChange={(e) => setCurrentPassVerify(e.target.value)}
                placeholder="请输入当前原访问密码以授权修改..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fox-500 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                设置新用户名 / 密码
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="新用户名（留空不修改）"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fox-500 text-xs"
                />
                <input
                  type="password"
                  value={accountPassInput}
                  onChange={(e) => setAccountPassInput(e.target.value)}
                  placeholder="新访问密码（留空不修改）"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fox-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                登录界面背景图片 (支持上传 / URL)
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={bgInputUrl}
                  onChange={(e) => setBgInputUrl(e.target.value)}
                  placeholder="输入自定义背景图片 URL 链接..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fox-500 text-xs"
                />
                <label className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer text-xs font-semibold transition-colors">
                  <ImageIcon className="w-4 h-4 text-fox-500" />
                  <span>本地上传背景图片...</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-fox-500 hover:bg-fox-600 text-white font-medium rounded-xl shadow-lg shadow-fox-500/25 transition-all flex items-center justify-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>保存修改设定</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
