import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sun, Moon, Search, History, Download, Settings, Lock } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isDarkMode, toggleDarkMode, currentPassword } = useApp();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLock = () => {
    sessionStorage.removeItem('wf_unlocked');
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fox-600 to-fox-400 flex items-center justify-center text-white shadow-lg shadow-fox-500/30 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-xl">狐</span>
            </div>
            <div>
              <span className="text-xl font-black bg-gradient-to-r from-fox-600 via-fox-500 to-amber-500 bg-clip-text text-transparent">
                白狐5
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-fox-100 dark:bg-fox-950 text-fox-600 dark:text-fox-400">
                极速版
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-fox-500 text-white font-semibold shadow-md shadow-fox-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              首页
            </Link>
            <Link
              to="/search"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/search')
                  ? 'bg-fox-500 text-white font-semibold shadow-md shadow-fox-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>聚合搜索</span>
            </Link>
            <Link
              to="/history"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/history')
                  ? 'bg-fox-500 text-white font-semibold shadow-md shadow-fox-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>历史记录</span>
            </Link>
            <Link
              to="/download"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/download')
                  ? 'bg-fox-500 text-white font-semibold shadow-md shadow-fox-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>下载/播放</span>
            </Link>
            <Link
              to="/settings"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/settings')
                  ? 'bg-fox-500 text-white font-semibold shadow-md shadow-fox-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>系统设置</span>
            </Link>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? '切换日间模式' : '切换夜间模式'}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {currentPassword && (
              <button
                onClick={handleLock}
                className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="锁定平台"
              >
                <Lock className="w-5 h-5 text-fox-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex items-center justify-around shadow-2xl">
        <Link
          to="/"
          className={`flex flex-col items-center p-1.5 ${
            isActive('/') ? 'text-fox-500 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <span className="text-xs mt-1">首页</span>
        </Link>
        <Link
          to="/search"
          className={`flex flex-col items-center p-1.5 ${
            isActive('/search') ? 'text-fox-500 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-xs mt-1">聚合搜索</span>
        </Link>
        <Link
          to="/history"
          className={`flex flex-col items-center p-1.5 ${
            isActive('/history') ? 'text-fox-500 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-xs mt-1">历史</span>
        </Link>
        <Link
          to="/download"
          className={`flex flex-col items-center p-1.5 ${
            isActive('/download') ? 'text-fox-500 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Download className="w-5 h-5" />
          <span className="text-xs mt-1">下载</span>
        </Link>
        <Link
          to="/settings"
          className={`flex flex-col items-center p-1.5 ${
            isActive('/settings') ? 'text-fox-500 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-xs mt-1">设置</span>
        </Link>
      </div>
    </header>
  );
};
