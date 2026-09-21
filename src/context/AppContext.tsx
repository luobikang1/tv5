import React, { createContext, useContext, useState, useEffect } from 'react';
import { CmsApiSource, DEFAULT_VIDEO_APIS, DEFAULT_ADULT_APIS } from '../services/defaultApis';
import { syncToD1, fetchFromD1 } from '../services/d1Sync';

export interface WatchHistoryItem {
  id: string | number;
  vod_name: string;
  vod_pic?: string;
  source_id: string;
  source_name: string;
  episode_name?: string;
  episode_url?: string;
  progress?: number;
  updated_at: number;
}

export interface FavoriteItem {
  id: string | number;
  vod_name: string;
  vod_pic?: string;
  source_id: string;
  source_name: string;
  type_name?: string;
  vod_year?: string;
  vod_remarks?: string;
  created_at: number;
}

export type VideoQuality = '360' | '480' | '720' | '1080' | 'auto';

interface AppContextType {
  // Password & Security
  isUnlocked: boolean;
  verifyPassword: (password: string) => boolean;
  setPassword: (newPass: string) => void;
  currentPassword: string;

  // Account User Auth
  currentUser: string | null;
  loginUser: (username: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  registerUser: (username: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Resolution
  defaultResolution: VideoQuality;
  setDefaultResolution: (quality: VideoQuality) => void;

  // APIs Management
  apiList: CmsApiSource[];
  addCustomApi: (api: CmsApiSource) => void;
  removeCustomApi: (id: string) => void;
  resetDefaultApis: () => void;

  // Adult Section
  showAdultColumn: boolean;
  setShowAdultColumn: (show: boolean) => void;

  // History Management (Supports 300+ entries)
  historyList: WatchHistoryItem[];
  addHistory: (item: Omit<WatchHistoryItem, 'updated_at'>) => void;
  removeHistoryItem: (id: string | number) => void;
  clearHistory: () => void;

  // Favorites Management
  favoritesList: FavoriteItem[];
  addFavorite: (item: Omit<FavoriteItem, 'created_at'>) => void;
  removeFavorite: (id: string | number) => void;
  isFavorite: (id: string | number) => boolean;
  clearFavorites: () => void;

  // Global Reset
  restoreDefaultSettings: () => void;

  // D1 DB
  d1Enabled: boolean;
  setD1Enabled: (enabled: boolean) => void;
  manualSyncD1: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PASSWORD: 'wf_password',
  USER: 'wf_logged_user',
  THEME: 'wf_theme',
  RESOLUTION: 'wf_resolution',
  APIS: 'wf_custom_apis',
  ADULT: 'wf_show_adult',
  HISTORY: 'wf_watch_history',
  FAVORITES: 'wf_favorites',
  D1_ENABLED: 'wf_d1_enabled',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Password State
  const [currentPassword, setCurrentPassword] = useState<string>(() => {
    const envPass = (import.meta.env.VITE_PASSWORD as string) || '';
    return localStorage.getItem(STORAGE_KEYS.PASSWORD) || envPass;
  });

  // Logged-in User Account State
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.USER) || null;
  });

  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    const envPass = (import.meta.env.VITE_PASSWORD as string) || '';
    const savedPass = localStorage.getItem(STORAGE_KEYS.PASSWORD) || envPass;
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    return !!savedUser || !savedPass || sessionStorage.getItem('wf_unlocked') === 'true';
  });

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved ? saved === 'dark' : true;
  });

  // Resolution State (Default 360p)
  const [defaultResolution, setDefaultResolutionState] = useState<VideoQuality>(() => {
    return (localStorage.getItem(STORAGE_KEYS.RESOLUTION) as VideoQuality) || '360';
  });

  // APIs State
  const [apiList, setApiList] = useState<CmsApiSource[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APIS);
    return saved ? JSON.parse(saved) : DEFAULT_VIDEO_APIS;
  });

  // Adult Section State
  const [showAdultColumn, setShowAdultColumnState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.ADULT) === 'true';
  });

  // Watch History State (Supports 300+ items)
  const [historyList, setHistoryList] = useState<WatchHistoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return saved ? JSON.parse(saved) : [];
  });

  // Favorites State
  const [favoritesList, setFavoritesList] = useState<FavoriteItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return saved ? JSON.parse(saved) : [];
  });

  // D1 Database State
  const [d1Enabled, setD1EnabledState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.D1_ENABLED) === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
  }, [isDarkMode]);

  // Pull data from D1 if enabled or when user logs in
  useEffect(() => {
    if (d1Enabled) {
      const syncKey = currentUser ? `wf_user_${currentUser}` : 'wf_user_settings';
      fetchFromD1(syncKey).then((data) => {
        if (data) {
          if (Array.isArray(data.history)) {
            setHistoryList(data.history);
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
          }
          if (Array.isArray(data.favorites)) {
            setFavoritesList(data.favorites);
            localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(data.favorites));
          }
          if (data.resolution) {
            setDefaultResolutionState(data.resolution);
            localStorage.setItem(STORAGE_KEYS.RESOLUTION, data.resolution);
          }
        }
      });
    }
  }, [d1Enabled, currentUser]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const verifyPassword = (inputPass: string): boolean => {
    if (!currentPassword || inputPass === currentPassword) {
      setIsUnlocked(true);
      sessionStorage.setItem('wf_unlocked', 'true');
      return true;
    }
    return false;
  };

  const loginUser = async (username: string, pass: string) => {
    try {
      const res = await fetch('/api/d1/sync?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(username);
        localStorage.setItem(STORAGE_KEYS.USER, username);
        setIsUnlocked(true);
        sessionStorage.setItem('wf_unlocked', 'true');

        // Fetch D1 user data
        if (d1Enabled) {
          const userD1Data = await fetchFromD1(`wf_user_${username}`);
          if (userD1Data) {
            if (Array.isArray(userD1Data.history)) setHistoryList(userD1Data.history);
            if (Array.isArray(userD1Data.favorites)) setFavoritesList(userD1Data.favorites);
          }
        }
        return { success: true };
      }
      return { success: false, message: data.message || '登录失败，密码错误' };
    } catch {
      if (username && pass) {
        setCurrentUser(username);
        localStorage.setItem(STORAGE_KEYS.USER, username);
        setIsUnlocked(true);
        sessionStorage.setItem('wf_unlocked', 'true');
        return { success: true };
      }
      return { success: false, message: '登录失败' };
    }
  };

  const registerUser = async (username: string, pass: string) => {
    try {
      const res = await fetch('/api/d1/sync?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass }),
      });
      const data = await res.json();
      if (data.success) {
        return { success: true };
      }
      return { success: false, message: data.message || '注册失败' };
    } catch {
      return { success: false, message: '无法连接数据库进行注册，请检查 D1 绑定' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    sessionStorage.removeItem('wf_unlocked');
    setIsUnlocked(!currentPassword);
  };

  const setPassword = (newPass: string) => {
    setCurrentPassword(newPass);
    if (newPass) {
      localStorage.setItem(STORAGE_KEYS.PASSWORD, newPass);
      sessionStorage.setItem('wf_unlocked', 'true');
      setIsUnlocked(true);
    } else {
      localStorage.removeItem(STORAGE_KEYS.PASSWORD);
      sessionStorage.removeItem('wf_unlocked');
      setIsUnlocked(true);
    }
  };

  const setDefaultResolution = (quality: VideoQuality) => {
    setDefaultResolutionState(quality);
    localStorage.setItem(STORAGE_KEYS.RESOLUTION, quality);
  };

  const addCustomApi = (api: CmsApiSource) => {
    const updated = [api, ...apiList];
    setApiList(updated);
    localStorage.setItem(STORAGE_KEYS.APIS, JSON.stringify(updated));
  };

  const removeCustomApi = (id: string) => {
    const updated = apiList.filter((item) => item.id !== id);
    setApiList(updated);
    localStorage.setItem(STORAGE_KEYS.APIS, JSON.stringify(updated));
  };

  const resetDefaultApis = () => {
    setApiList(DEFAULT_VIDEO_APIS);
    localStorage.setItem(STORAGE_KEYS.APIS, JSON.stringify(DEFAULT_VIDEO_APIS));
  };

  const setShowAdultColumn = (show: boolean) => {
    setShowAdultColumnState(show);
    localStorage.setItem(STORAGE_KEYS.ADULT, show ? 'true' : 'false');
    if (show) {
      const hasAdult = apiList.some((item) => item.type === 'adult');
      if (!hasAdult) {
        setApiList([...DEFAULT_ADULT_APIS, ...apiList]);
      }
    } else {
      setApiList(apiList.filter((item) => item.type !== 'adult'));
    }
  };

  // Add History - Capacity expanded to 350 items to safely support 200+
  const addHistory = (item: Omit<WatchHistoryItem, 'updated_at'>) => {
    setHistoryList((prev) => {
      const filtered = prev.filter((h) => h.id !== item.id);
      const updated = [{ ...item, updated_at: Date.now() }, ...filtered].slice(0, 350);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));

      if (d1Enabled) {
        const syncKey = currentUser ? `wf_user_${currentUser}` : 'wf_user_settings';
        syncToD1(syncKey, { history: updated, favorites: favoritesList, resolution: defaultResolution });
      }

      return updated;
    });
  };

  const removeHistoryItem = (id: string | number) => {
    setHistoryList((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      if (d1Enabled) {
        const syncKey = currentUser ? `wf_user_${currentUser}` : 'wf_user_settings';
        syncToD1(syncKey, { history: updated, favorites: favoritesList, resolution: defaultResolution });
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistoryList([]);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    if (d1Enabled) {
      const syncKey = currentUser ? `wf_user_${currentUser}` : 'wf_user_settings';
      syncToD1(syncKey, { history: [], favorites: favoritesList, resolution: defaultResolution });
    }
  };

  // Favorites logic
  const addFavorite = (item: Omit<FavoriteItem, 'created_at'>) => {
    setFavoritesList((prev) => {
      if (prev.some((f) => f.id === item.id)) return prev;
      const updated = [{ ...item, created_at: Date.now() }, ...prev];
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));

      if (d1Enabled) {
        const syncKey = currentUser ? `wf_user_${currentUser}` : 'wf_user_settings';
        syncToD1(syncKey, { history: historyList, favorites: updated, resolution: defaultResolution });
      }

      return updated;
    });
  };

  const removeFavorite = (id: string | number) => {
    setFavoritesList((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));

      if (d1Enabled) {
        const syncKey = currentUser ? `wf_user_${currentUser}` : 'wf_user_settings';
        syncToD1(syncKey, { history: historyList, favorites: updated, resolution: defaultResolution });
      }

      return updated;
    });
  };

  const isFavorite = (id: string | number) => {
    return favoritesList.some((f) => f.id === id);
  };

  const clearFavorites = () => {
    setFavoritesList([]);
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    if (d1Enabled) {
      const syncKey = currentUser ? `wf_user_${currentUser}` : 'wf_user_settings';
      syncToD1(syncKey, { history: historyList, favorites: [], resolution: defaultResolution });
    }
  };

  const setD1Enabled = (enabled: boolean) => {
    setD1EnabledState(enabled);
    localStorage.setItem(STORAGE_KEYS.D1_ENABLED, enabled ? 'true' : 'false');
  };

  const manualSyncD1 = async (): Promise<boolean> => {
    const syncKey = currentUser ? `wf_user_${currentUser}` : 'wf_user_settings';
    return await syncToD1(syncKey, {
      history: historyList,
      favorites: favoritesList,
      resolution: defaultResolution,
    });
  };

  const restoreDefaultSettings = () => {
    localStorage.clear();
    sessionStorage.clear();
    setCurrentPassword('');
    setCurrentUser(null);
    setIsUnlocked(true);
    setIsDarkMode(true);
    setDefaultResolutionState('360');
    setApiList(DEFAULT_VIDEO_APIS);
    setShowAdultColumnState(false);
    setHistoryList([]);
    setFavoritesList([]);
    setD1EnabledState(false);
  };

  return (
    <AppContext.Provider
      value={{
        isUnlocked,
        verifyPassword,
        setPassword,
        currentPassword,
        currentUser,
        loginUser,
        registerUser,
        logout,
        isDarkMode,
        toggleDarkMode,
        defaultResolution,
        setDefaultResolution,
        apiList,
        addCustomApi,
        removeCustomApi,
        resetDefaultApis,
        showAdultColumn,
        setShowAdultColumn,
        historyList,
        addHistory,
        removeHistoryItem,
        clearHistory,
        favoritesList,
        addFavorite,
        removeFavorite,
        isFavorite,
        clearFavorites,
        restoreDefaultSettings,
        d1Enabled,
        setD1Enabled,
        manualSyncD1,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
