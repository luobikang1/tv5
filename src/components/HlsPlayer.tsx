import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
  Sun,
  Volume1,
  Tv2,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HlsPlayerProps {
  url: string;
  title?: string;
  onEnded?: () => void;
}

export const HlsPlayer: React.FC<HlsPlayerProps> = ({ url, title, onEnded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const { defaultResolution } = useApp();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [levels, setLevels] = useState<{ id: number; name: string; height: number; bitrate: number }[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [useProxyFallback, setUseProxyFallback] = useState(false);

  // Brightness and Volume Slider State
  const [brightness, setBrightness] = useState<number>(100);
  const [volume, setVolume] = useState<number>(100);

  // Progress Bar State (Current Time & Duration)
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Cinema Mode (观影模式) State
  const [isCinemaMode, setIsCinemaMode] = useState<boolean>(false);

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getPlayableUrl = (rawUrl: string, useProxy: boolean) => {
    let cleanUrl = rawUrl.trim();
    const isHttpsPage = window.location.protocol === 'https:';
    if ((useProxy || (isHttpsPage && cleanUrl.startsWith('http:'))) && !cleanUrl.includes('/api/proxy')) {
      return `/api/proxy?url=${encodeURIComponent(cleanUrl)}`;
    }
    return cleanUrl;
  };

  const loadStream = () => {
    const video = videoRef.current;
    if (!video || !url) return;

    setErrorText(null);
    video.preload = 'auto';

    const cleanUrl = url.trim();
    const playableUrl = getPlayableUrl(cleanUrl, useProxyFallback);

    if (playableUrl.includes('.mp4') || playableUrl.includes('.webm')) {
      video.src = playableUrl;
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      return;
    }

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 180,
        maxBufferLength: 600, // 10 minutes buffer
        maxMaxBufferLength: 600,
        maxBufferSize: 120 * 1024 * 1024,
        maxBufferHole: 0.5,
        highBufferWatchdogPeriod: 2,
        startFragPrefetch: true,
        testBandwidth: true,
        progressive: true,
        startLevel: -1,
        xhrSetup: (xhr, requestUrl) => {
          xhr.withCredentials = false;
          const isHttpsPage = window.location.protocol === 'https:';
          if ((useProxyFallback || (isHttpsPage && requestUrl.startsWith('http:'))) && !requestUrl.includes('/api/proxy')) {
            const proxied = `/api/proxy?url=${encodeURIComponent(requestUrl)}`;
            xhr.open('GET', proxied, true);
          }
        },
      });

      hlsRef.current = hls;
      hls.loadSource(playableUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const availableLevels = data.levels.map((lvl, index) => {
          const kbps = lvl.bitrate ? Math.round(lvl.bitrate / 1000) : 0;
          const labelHeight = lvl.height || (index === 0 ? 360 : index === 1 ? 720 : 1080);
          return {
            id: index,
            name: `${labelHeight}P (${kbps > 0 ? `${kbps} kbps` : '自适应'})`,
            height: labelHeight,
            bitrate: lvl.bitrate || 0,
          };
        });
        setLevels(availableLevels);

        if (defaultResolution !== 'auto' && availableLevels.length > 0) {
          const targetHeight = parseInt(defaultResolution, 10);
          const foundIndex = availableLevels.findIndex((l) => Math.abs(l.height - targetHeight) < 120);
          if (foundIndex !== -1) {
            hls.currentLevel = foundIndex;
            hls.nextLevel = foundIndex;
            setCurrentLevel(foundIndex);
          }
        }

        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setCurrentLevel(data.level);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              setErrorText('网络连接超时或存在跨域，可点击下方“启用极速代理”切换线源');
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setErrorText('视频源响应缓慢或格式不兼容，请尝试点击下方“启用极速代理”');
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playableUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });
    } else {
      setErrorText('您的浏览器不支持 HLS 视频流播放');
    }
  };

  useEffect(() => {
    loadStream();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [url, useProxyFallback, defaultResolution]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const [activeBitrateText, setActiveBitrateText] = useState<string>('360P 流畅省流');

  const changeQuality = (levelId: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelId;
      hlsRef.current.nextLevel = levelId;
      hlsRef.current.loadLevel = levelId;
      setCurrentLevel(levelId);
      setShowQualityMenu(false);

      if (levelId === -1) {
        setActiveBitrateText(`预留自适应 (${defaultResolution}P)`);
      } else {
        const foundLvl = levels.find((l) => l.id === levelId);
        if (foundLvl) {
          setActiveBitrateText(foundLvl.name);
        }
      }
    } else {
      setCurrentLevel(levelId);
      setShowQualityMenu(false);
      setActiveBitrateText(levelId === -1 ? `预留默认 (${defaultResolution}P)` : `${levelId === 0 ? '360' : levelId === 1 ? '480' : levelId === 2 ? '720' : '1080'}P (省流极速)`);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val / 100;
      setIsMuted(val === 0);
    }
  };

  const handleProgressSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetSec = parseFloat(e.target.value);
    setCurrentTime(targetSec);
    if (videoRef.current) {
      videoRef.current.currentTime = targetSec;
    }
  };

  return (
    <div className={`space-y-4 ${isCinemaMode ? 'relative z-50 p-4 bg-slate-950/95 rounded-3xl shadow-2xl' : ''}`}>
      {/* Cinema Mode Backdrop Dim Overlay */}
      {isCinemaMode && (
        <div
          className="fixed inset-0 bg-black/90 z-40 transition-opacity"
          onClick={() => setIsCinemaMode(false)}
        />
      )}

      <div className="relative group w-full bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video border border-slate-800 z-50">
        {errorText ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 text-red-400 p-6 text-center z-10 space-y-3">
            <AlertCircle className="w-12 h-12" />
            <p className="font-semibold text-lg">{errorText}</p>
            <button
              onClick={() => {
                setUseProxyFallback(true);
                loadStream();
              }}
              className="px-4 py-2 bg-fox-500 hover:bg-fox-600 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>开启代理防跨域极速重试</span>
            </button>
          </div>
        ) : null}

        <video
          ref={videoRef}
          onEnded={onEnded}
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
              setDuration(videoRef.current.duration || 0);
            }
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration || 0);
            }
          }}
          className="w-full h-full object-contain"
          style={{ filter: `brightness(${brightness}%)` }}
          playsInline
        />

        {/* Clean video overlay containing play/pause, volume, cinema mode, and fullscreen without blocking window */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between text-white z-10">
          <div className="flex items-center space-x-4">
            <button onClick={togglePlay} className="hover:text-fox-400 transition-colors">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button onClick={toggleMute} className="hover:text-fox-400 transition-colors">
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
            <span className="text-xs text-slate-300 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsCinemaMode(!isCinemaMode)}
              className={`text-xs font-semibold px-2.5 py-1 rounded border transition-colors flex items-center space-x-1 ${
                isCinemaMode
                  ? 'bg-amber-500 border-amber-400 text-white shadow'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Tv2 className="w-3.5 h-3.5" />
              <span>{isCinemaMode ? '退出观影' : '观影模式'}</span>
            </button>

            <button onClick={toggleFullscreen} className="hover:text-fox-400 transition-colors">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar (进度条选项 - 竖屏与横屏通用) */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex items-center space-x-3 shadow-sm z-50">
        <span className="text-xs font-mono text-slate-600 dark:text-slate-400 min-w-[45px] text-right">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={currentTime}
          onChange={handleProgressSeek}
          className="flex-1 accent-fox-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
        />
        <span className="text-xs font-mono text-slate-600 dark:text-slate-400 min-w-[45px]">
          {formatTime(duration)}
        </span>
      </div>

      {/* External Control Bar below video window: Resolution selector is moved to the left of Proxy toggle */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm z-50">
        <div className="relative flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">画质切片:</span>
          <button
            onClick={() => setShowQualityMenu(!showQualityMenu)}
            className="flex items-center space-x-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 transition-all shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-fox-500" />
            <span>
              {currentLevel === -1
                ? `预留分辨率 (${defaultResolution}P)`
                : levels.find((l) => l.id === currentLevel)?.name || `${currentLevel === 0 ? '360P (流畅)' : currentLevel === 1 ? '480P (清晰)' : currentLevel === 2 ? '720P (高清)' : '1080P (超清)'}`}
            </span>
          </button>

          {showQualityMenu && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 py-1 text-xs">
              <button
                onClick={() => changeQuality(-1)}
                className={`w-full px-3.5 py-2.5 text-left hover:bg-fox-500 hover:text-white transition-colors ${
                  currentLevel === -1 ? 'text-fox-500 font-bold' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                预留默认 ({defaultResolution}P)
              </button>
              {levels.length > 0 ? (
                levels.map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => changeQuality(lvl.id)}
                    className={`w-full px-3.5 py-2.5 text-left hover:bg-fox-500 hover:text-white transition-colors ${
                      currentLevel === lvl.id ? 'text-fox-500 font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {lvl.name}
                  </button>
                ))
              ) : (
                <>
                  <button
                    onClick={() => changeQuality(0)}
                    className={`w-full px-3.5 py-2.5 text-left hover:bg-fox-500 hover:text-white transition-colors ${
                      currentLevel === 0 ? 'text-fox-500 font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    360P (350 kbps 极速省流)
                  </button>
                  <button
                    onClick={() => changeQuality(1)}
                    className={`w-full px-3.5 py-2.5 text-left hover:bg-fox-500 hover:text-white transition-colors ${
                      currentLevel === 1 ? 'text-fox-500 font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    480P (750 kbps 标准)
                  </button>
                  <button
                    onClick={() => changeQuality(2)}
                    className={`w-full px-3.5 py-2.5 text-left hover:bg-fox-500 hover:text-white transition-colors ${
                      currentLevel === 2 ? 'text-fox-500 font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    720P (1500 kbps 高清)
                  </button>
                  <button
                    onClick={() => changeQuality(3)}
                    className={`w-full px-3.5 py-2.5 text-left hover:bg-fox-500 hover:text-white transition-colors ${
                      currentLevel === 3 ? 'text-fox-500 font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    1080P (3000 kbps 超清)
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Active Effective Bitrate & R2 Acceleration Real Status Badge */}
        {(() => {
          const isR2ConfiguredAndActive = localStorage.getItem('wf_r2_enabled') === 'true' || useProxyFallback;
          const isBitrateValid = !errorText && (isPlaying || duration > 0);
          const currentQualityLabel =
            currentLevel === -1
              ? `${defaultResolution}P (低码率省流)`
              : levels.find((l) => l.id === currentLevel)?.name ||
                (currentLevel === 0 ? '360P (低码率省流)' : `${currentLevel === 1 ? '480P' : currentLevel === 2 ? '720P' : '1080P'} (高画质)`);

          if (!isBitrateValid) {
            return (
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold flex items-center space-x-1.5 shadow-sm">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>当前生效: 无效 (源站断开/无法加载) · R2 存储节点未建立</span>
                </div>
              </div>
            );
          }

          return (
            <div className="flex items-center space-x-2">
              <div
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 shadow-sm ${
                  isR2ConfiguredAndActive
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${isR2ConfiguredAndActive ? 'text-emerald-500' : 'text-amber-500'}`} />
                <span>
                  当前生效: {currentQualityLabel} · {isR2ConfiguredAndActive ? 'R2 存储节点起用 (流畅看片)' : 'R2 存储节点无效 (未开启或额度用尽)'}
                </span>
              </div>

              <button
                onClick={() => setUseProxyFallback(!useProxyFallback)}
                className={`text-xs font-bold px-3 py-2 rounded-xl border flex items-center space-x-1.5 transition-all shadow-sm ${
                  useProxyFallback
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{useProxyFallback ? '代理反查已开启 (极速)' : '启用极速代理'}</span>
              </button>
            </div>
          );
        })()}
      </div>

      {/* Brightness and Volume Sliders */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold shadow-sm z-50">
        <div className="flex items-center space-x-3">
          <Sun className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 w-16">屏幕亮度:</span>
          <input
            type="range"
            min="30"
            max="150"
            value={brightness}
            onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
            className="flex-1 accent-fox-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
          <span className="w-10 text-right text-slate-500 dark:text-slate-400">{brightness}%</span>
        </div>

        <div className="flex items-center space-x-3">
          <Volume1 className="w-4 h-4 text-fox-500 flex-shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 w-16">播放音量:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 accent-fox-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
          <span className="w-10 text-right text-slate-500 dark:text-slate-400">{volume}%</span>
        </div>
      </div>

    </div>
  );
};
