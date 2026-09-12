import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, AlertCircle, RefreshCw, Sun, Volume1 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HlsPlayerProps {
  url: string;
  title?: string;
  onEnded?: () => void;
  externalBrightness?: number;
  externalVolume?: number;
  onBrightnessChange?: (val: number) => void;
  onVolumeChange?: (val: number) => void;
}

export const HlsPlayer: React.FC<HlsPlayerProps> = ({
  url,
  title,
  onEnded,
  externalBrightness,
  externalVolume,
  onBrightnessChange,
  onVolumeChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const { defaultResolution } = useApp();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [levels, setLevels] = useState<{ id: number; name: string; height: number }[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);
  const [selectedQualityText, setSelectedQualityText] = useState<string>('360P 省流');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [useProxyFallback, setUseProxyFallback] = useState(false);

  // Brightness (50% ~ 150%) & Volume (0 ~ 100%)
  const [brightness, setBrightnessState] = useState<number>(externalBrightness ?? 100);
  const [volume, setVolumeState] = useState<number>(externalVolume ?? 100);

  useEffect(() => {
    if (typeof externalBrightness === 'number') {
      setBrightnessState(externalBrightness);
    }
  }, [externalBrightness]);

  useEffect(() => {
    if (typeof externalVolume === 'number') {
      setVolumeState(externalVolume);
    }
  }, [externalVolume]);

  const handleBrightness = (val: number) => {
    setBrightnessState(val);
    if (onBrightnessChange) onBrightnessChange(val);
  };

  const handleVolume = (val: number) => {
    setVolumeState(val);
    if (onVolumeChange) onVolumeChange(val);
    if (videoRef.current) {
      videoRef.current.volume = val / 100;
      if (val === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
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
    video.preload = 'metadata';

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
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
        highBufferWatchdogPeriod: 2,
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
        const availableLevels = data.levels.map((lvl, index) => ({
          id: index,
          name: lvl.height ? `${lvl.height}P` : `画质 ${index + 1}`,
          height: lvl.height || 0,
        }));
        setLevels(availableLevels);

        // Apply default resolution setting (360P / 480P / 720P / 1080P)
        const targetQuality = defaultResolution || '360';
        if (targetQuality !== 'auto' && availableLevels.length > 0) {
          const targetHeight = parseInt(targetQuality, 10);
          let bestMatch = 0;
          let minDiff = Infinity;
          availableLevels.forEach((lvl, idx) => {
            const diff = Math.abs(lvl.height - targetHeight);
            if (diff < minDiff) {
              minDiff = diff;
              bestMatch = idx;
            }
          });
          hls.currentLevel = bestMatch;
          setCurrentLevel(bestMatch);
          setSelectedQualityText(availableLevels[bestMatch]?.name || `${targetQuality}P`);
        } else {
          setCurrentLevel(-1);
          setSelectedQualityText('自动码率');
        }

        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (!useProxyFallback) {
                setUseProxyFallback(true);
              } else {
                hls.startLoad();
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              if (!useProxyFallback) {
                setUseProxyFallback(true);
              } else {
                setErrorText('视频源响应缓慢或存在跨域阻断，请尝试点击下方“开启代理/重试”');
              }
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

  const selectResolutionByP = (pVal: string) => {
    if (pVal === 'auto') {
      if (hlsRef.current) hlsRef.current.currentLevel = -1;
      setCurrentLevel(-1);
      setSelectedQualityText('自动 (Auto)');
      setShowQualityMenu(false);
      return;
    }

    const targetHeight = parseInt(pVal, 10);
    if (hlsRef.current && levels.length > 0) {
      let bestIndex = 0;
      let minDiff = Infinity;
      levels.forEach((lvl, index) => {
        const diff = Math.abs(lvl.height - targetHeight);
        if (diff < minDiff) {
          minDiff = diff;
          bestIndex = index;
        }
      });
      hlsRef.current.currentLevel = bestIndex;
      setCurrentLevel(bestIndex);
      setSelectedQualityText(pVal === '240' ? '240P 超省流' : pVal === '360' ? '360P 省流' : `${pVal}P`);
    } else {
      setSelectedQualityText(pVal === '240' ? '240P 超省流' : pVal === '360' ? '360P 省流' : `${pVal}P`);
    }
    setShowQualityMenu(false);
  };

  return (
    <div className="relative group w-full bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video border border-slate-800">
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
        className="w-full h-full object-contain transition-all duration-150"
        style={{ filter: `brightness(${brightness}%)` }}
        playsInline
      />

      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between text-white z-10">
        <div className="flex items-center space-x-4">
          <button onClick={togglePlay} className="hover:text-fox-400 transition-colors">
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button onClick={toggleMute} className="hover:text-fox-400 transition-colors">
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>

        <div className="flex items-center space-x-4 relative">
          <button
            onClick={() => {
              setUseProxyFallback(!useProxyFallback);
            }}
            className={`text-xs font-semibold px-2.5 py-1 rounded border transition-colors ${
              useProxyFallback
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {useProxyFallback ? '代理反查已开启' : '启用极速代理'}
          </button>

          {/* Resolution Selector Menu */}
          <div className="relative">
            <button
              onClick={() => setShowQualityMenu(!showQualityMenu)}
              className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{selectedQualityText}</span>
            </button>

            {showQualityMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-36 bg-slate-900/95 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-20 py-1 text-xs">
                <div className="px-3 py-1 text-[10px] text-slate-400 font-bold uppercase border-b border-slate-800">
                  分辨率省流调节
                </div>
                {[
                  { label: '240P (超省流)', val: '240' },
                  { label: '360P (省流模式)', val: '360' },
                  { label: '480P (标清)', val: '480' },
                  { label: '720P (高清)', val: '720' },
                  { label: '1080P (超清)', val: '1080' },
                  { label: '自动 (Auto)', val: 'auto' },
                ].map((q) => (
                  <button
                    key={q.val}
                    onClick={() => selectResolutionByP(q.val)}
                    className="w-full px-3 py-2 text-left hover:bg-fox-500 hover:text-white transition-colors text-slate-300 flex items-center justify-between"
                  >
                    <span>{q.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={toggleFullscreen} className="hover:text-fox-400 transition-colors">
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
