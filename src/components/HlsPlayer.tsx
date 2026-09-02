import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, AlertCircle, RefreshCw } from 'lucide-react';
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
  const [levels, setLevels] = useState<{ id: number; name: string; height: number }[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [useProxyFallback, setUseProxyFallback] = useState(false);

  const getPlayableUrl = (rawUrl: string, useProxy: boolean) => {
    let cleanUrl = rawUrl.trim();
    // Auto-detect mixed content (HTTP url on HTTPS page)
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

    // If stream URL is an HTML page / iframe player rather than direct video/hls media
    const isDirectMedia = cleanUrl.includes('.m3u8') || cleanUrl.includes('.mp4') || cleanUrl.includes('.webm') || cleanUrl.includes('.flv');

    if (!isDirectMedia && (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) && !useProxyFallback) {
      // Direct html/iframe embed URL
      if (cleanUrl.includes('share') || cleanUrl.includes('embed') || cleanUrl.includes('parse') || cleanUrl.includes('html')) {
        // Will render in iframe fallback mode if user or system requests
      }
    }

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
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
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

        if (defaultResolution !== 'auto' && availableLevels.length > 0) {
          const targetHeight = parseInt(defaultResolution, 10);
          const foundIndex = availableLevels.findIndex((l) => Math.abs(l.height - targetHeight) < 100);
          if (foundIndex !== -1) {
            hls.currentLevel = foundIndex;
            setCurrentLevel(foundIndex);
          }
        }

        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (!useProxyFallback) {
                console.log('Network error detected, enabling proxy fallback...');
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

  const changeQuality = (levelId: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelId;
      setCurrentLevel(levelId);
      setShowQualityMenu(false);
    }
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
        className="w-full h-full object-contain"
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

          <div className="relative">
            <button
              onClick={() => setShowQualityMenu(!showQualityMenu)}
              className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>
                {currentLevel === -1
                  ? `自适应 (${defaultResolution}P)`
                  : levels.find((l) => l.id === currentLevel)?.name || '画质'}
              </span>
            </button>

            {showQualityMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-32 bg-slate-900/95 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-20 py-1 text-xs">
                <button
                  onClick={() => changeQuality(-1)}
                  className={`w-full px-3 py-2 text-left hover:bg-fox-500 hover:text-white transition-colors ${
                    currentLevel === -1 ? 'text-fox-400 font-bold' : 'text-slate-300'
                  }`}
                >
                  自动 (默认{defaultResolution}P)
                </button>
                {levels.map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => changeQuality(lvl.id)}
                    className={`w-full px-3 py-2 text-left hover:bg-fox-500 hover:text-white transition-colors ${
                      currentLevel === lvl.id ? 'text-fox-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    {lvl.name}
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
