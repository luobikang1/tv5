import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { PasswordModal } from './components/PasswordModal';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { PlayerPage } from './pages/PlayerPage';
import { DownloadPage } from './pages/DownloadPage';
import { HistoryPage } from './pages/HistoryPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedLayout: React.FC = () => {
  const { isUnlocked, customBgColor, customBgImage } = useApp();

  const containerStyle: React.CSSProperties = {
    backgroundColor: customBgColor || undefined,
    backgroundImage: customBgImage ? `url(${customBgImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };

  return (
    <div
      style={containerStyle}
      className={`min-h-screen flex flex-col ${
        !customBgColor && !customBgImage ? 'bg-slate-50 dark:bg-slate-950' : ''
      } text-slate-900 dark:text-slate-100 transition-colors duration-200`}
    >
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {isUnlocked ? (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/player/:sourceId/:vodId" element={<PlayerPage />} />
            <Route path="/download" element={<DownloadPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl my-8 border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">白狐5 已锁定</h2>
            <p className="text-slate-500 text-sm mt-2">请在下方弹窗中输入访问密码或登入账号解锁</p>
          </div>
        )}
      </main>
      <PasswordModal />
      <footer className="py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <p>© 2026 白狐5 (WhiteFox 5) 极速影视聚合平台 · 仅供学习交流使用</p>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ProtectedLayout />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
