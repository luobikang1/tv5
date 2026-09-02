import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, User, KeyRound, Eye, EyeOff, UserPlus } from 'lucide-react';

export const PasswordModal: React.FC = () => {
  const { isUnlocked, verifyPassword, loginUser, registerUser } = useApp();
  const [activeTab, setActiveTab] = useState<'password' | 'login' | 'register'>('password');

  // Input states
  const [passwordInput, setPasswordInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [accountPassInput, setAccountPassInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full">
        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-fox-100 dark:bg-fox-900/40 text-fox-500 mb-3">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">白狐5 访问控制面板</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">防止部署流量浪费，请输入授权密码或账号登入</p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-6 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('password');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
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
            className={`flex-1 py-2 rounded-lg transition-all ${
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
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === 'register'
                ? 'bg-fox-500 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            新用户注册
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
      </div>
    </div>
  );
};
