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

export type VideoQuality = '360' | '480' | '720' | '1080' | 'auto';

interface AppContextType {
  // Password & Security
  isUnlocked: boolean;
  verifyPassword: (password: string) => boolean;
  setPassword: (newPass: string) => void;
  currentPassword: string;

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

  // History Management
  historyList: WatchHistoryItem[];
  addHistory: (item: Omit<WatchHistoryItem, 'updated_at'>) => void;
  removeHistoryItem: (id: string | number) => void;
  clearHistory: () => void;

  // Global Reset
  restoreDefaultSettings: () => void;

  // D1 DB
  d1Enabled: boolean;
  setD1Enabled: (enabled: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PASSWORD: 'wf_password',
  THEME: 'wf_theme',
  RESOLUTION: 'wf_resolution',
  APIS: 'wf_custom_apis',
  ADULT: 'wf_show_adult',
  HISTORY: 'wf_watch_history',
  D1_ENABLED: 'wf_d1_enabled',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Password State
  const [currentPassword, setCurrentPassword] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.PASSWORD) || '';
  });
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PASSWORD);
    // If no password set, unlock by default. If password set, require session verification.
    return !saved || sessionStorage.getItem('wf_unlocked') === 'true';
  });

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved ? saved === 'dark' : true; // Default dark/night mode for video streaming
  });

  // Resolution State (Default 360p as requested)
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

  // Watch History State
  const [historyList, setHistoryList] = useState<WatchHistoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return saved ? JSON.parse(saved) : [];
  });

  // D1 Database State
  const [d1Enabled, setD1EnabledState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.D1_ENABLED) === 'true';
  });

  // Sync theme class to document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
  }, [isDarkMode]);

  // Handle D1 initial load if enabled
  useEffect(() => {
    if (d1Enabled) {
      fetchFromD1('wf_user_settings').then((data) => {
        if (data) {
          if (data.history) setHistoryList(data.history);
          if (data.resolution) setDefaultResolutionState(data.resolution);
        }
      });
    }
  }, [d1Enabled]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const verifyPassword = (inputPass: string): boolean => {
    if (!currentPassword || inputPass === currentPassword) {
      setIsUnlocked(true);
      sessionStorage.setItem('wf_unlocked', 'true');
      return true;
    }
    return false;
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
      // Include adult APIs into the active list if not present
      const hasAdult = apiList.some((item) => item.type === 'adult');
      if (!hasAdult) {
        setApiList([...DEFAULT_ADULT_APIS, ...apiList]);
      }
    } else {
      // Remove adult APIs
      setApiList(apiList.filter((item) => item.type !== 'adult'));
    }
  };

  const addHistory = (item: Omit<WatchHistoryItem, 'updated_at'>) => {
    setHistoryList((prev) => {
      const filtered = prev.filter((h) => h.id !== item.id);
      const updated = [{ ...item, updated_at: Date.now() }, ...filtered].slice(0, 100);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));

      if (d1Enabled) {
        syncToD1('wf_user_settings', { history: updated, resolution: defaultResolution });
      }

      return updated;
    });
  };

  const removeHistoryItem = (id: string | number) => {
    setHistoryList((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setHistoryList([]);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  };

  const setD1Enabled = (enabled: boolean) => {
    setD1EnabledState(enabled);
    localStorage.setItem(STORAGE_KEYS.D1_ENABLED, enabled ? 'true' : 'false');
  };

  const restoreDefaultSettings = () => {
    localStorage.clear();
    sessionStorage.clear();
    setCurrentPassword('');
    setIsUnlocked(true);
    setIsDarkMode(true);
    setDefaultResolutionState('360');
    setApiList(DEFAULT_VIDEO_APIS);
    setShowAdultColumnState(false);
    setHistoryList([]);
    setD1EnabledState(false);
  };

  return (
    <AppContext.Provider
      value={{
        isUnlocked,
        verifyPassword,
        setPassword,
        currentPassword,
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
        restoreDefaultSettings,
        d1Enabled,
        setD1Enabled,
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
