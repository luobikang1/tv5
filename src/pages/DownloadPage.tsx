import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HlsPlayer } from '../components/HlsPlayer';
import { VideoItem, parsePlayUrls, PlaySource, Episode } from '../services/cmsApi';
import { Download, Play, Copy, Check, Link as LinkIcon, Info, ArrowLeft, Layers, Film, Tv } from 'lucide-react';

interface TvChannel {
  id: string;
  name: string;
  category: 'CCTV' | '卫视';
  url: string;
}

const SATELLITE_TV_CHANNELS: TvChannel[] = [
  { id: 'tv-1', name: 'CCTV-1 综合高清', category: 'CCTV', url: 'https://cctvtzy.cntv.kcdnvip.com/live/cctv1_2/index.m3u8' },
  { id: 'tv-2', name: 'CCTV-13 新闻高清', category: 'CCTV', url: 'https://cctvtzy.cntv.kcdnvip.com/live/cctv13_2/index.m3u8' },
  { id: 'tv-3', name: '湖南卫视 高清直播', category: '卫视', url: 'https://live.mgtv.com/live/hunantv/index.m3u8' },
  { id: 'tv-4', name: '浙江卫视 高清直播', category: '卫视', url: 'https://cztv.live.miguvideo.com/live/cztv/index.m3u8' },
  { id: 'tv-5', name: '东方卫视 高清直播', category: '卫视', url: 'https://live.smg.cn/dfws/index.m3u8' },
  { id: 'tv-6', name: '江苏卫视 高清直播', category: '卫视', url: 'https://live.jstv.com/jstv/index.m3u8' },
  { id: 'tv-7', name: '北京卫视 高清直播', category: '卫视', url: 'https://live.btv.com.cn/btv1/index.m3u8' },
  { id: 'tv-8', name: '广东卫视 高清直播', category: '卫视', url: 'https://live.gdtv.cn/gdtv/index.m3u8' },
  { id: 'tv-9', name: '深圳卫视 高清直播', category: '卫视', url: 'https://live.sztv.com.cn/sztv/index.m3u8' },
];

export const DownloadPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const passedVideo = (location.state as { video?: VideoItem })?.video || null;

  const [downloadUrl, setDownloadUrl] = useState('');
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [playSources, setPlaySources] = useState<PlaySource[]>([]);
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [activeEpisodeIndex, setActiveEpisodeIndex] = useState(0);

  useEffect(() => {
    if (passedVideo) {
      const parsed = parsePlayUrls(passedVideo.vod_play_from, passedVideo.vod_play_url);
      setPlaySources(parsed);
      if (parsed.length > 0 && parsed[0].episodes.length > 0) {
        const firstEp = parsed[0].episodes[0];
        setDownloadUrl(firstEp.url);
        setPlayingUrl(firstEp.url);
      }
    }
  }, [passedVideo]);

  const currentSource = playSources[activeSourceIndex];

  const handleSelectEpisode = (epIndex: number) => {
    setActiveEpisodeIndex(epIndex);
    const ep = currentSource?.episodes[epIndex];
    if (ep) {
      setDownloadUrl(ep.url);
      setPlayingUrl(ep.url);
    }
  };

  const handlePlayInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (downloadUrl.trim()) {
      setPlayingUrl(downloadUrl.trim());
    }
  };

  const handleCopy = () => {
    if (downloadUrl.trim()) {
      navigator.clipboard.writeText(downloadUrl.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectSatelliteTv = (ch: TvChannel) => {
    setDownloadUrl(ch.url);
    setPlayingUrl(ch.url);
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/');
            }
          }}
          className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm flex items-center space-x-2 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回海报 / 上一页</span>
        </button>

        {passedVideo && (
          <button
            onClick={() => navigate(`/player/${passedVideo.source_id}/${passedVideo.vod_id}`)}
            className="px-4 py-2 bg-fox-500 hover:bg-fox-600 text-white rounded-xl text-sm font-medium flex items-center space-x-2 transition-colors shadow-sm"
          >
            <Film className="w-4 h-4" />
            <span>进入该片播放页</span>
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-4">
        <div className="flex items-center space-x-3 text-fox-500">
          <Download className="w-8 h-8" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {passedVideo ? `下载与解析 - ${passedVideo.vod_name}` : '下载中心、全国卫视直播与在线解析播放'}
          </h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          粘贴任何 M3U8 / MP4 视频链接或点击下方的全国央视/卫视直播频道，可直接在线流畅播放或一键复制链接使用 NDM / M3U8 Downloader 进行高速下载。
        </p>

        <form onSubmit={handlePlayInline} className="space-y-4 pt-2">
          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              placeholder="粘贴视频或卫视 M3U8 直链地址 (例如: https://.../index.m3u8)"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fox-500 text-sm sm:text-base"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="px-6 py-3 bg-fox-500 hover:bg-fox-600 text-white font-medium rounded-xl shadow-lg shadow-fox-500/25 flex items-center space-x-2 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>在线播放</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl flex items-center space-x-2 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '已复制链接' : '复制下载链接'}</span>
            </button>
          </div>
        </form>

        {playSources.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {playSources.length > 1 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Layers className="w-4 h-4 text-fox-500" />
                  <span>下载线路</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {playSources.map((src, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setActiveSourceIndex(index);
                        setActiveEpisodeIndex(0);
                        const first = src.episodes[0];
                        if (first) {
                          setDownloadUrl(first.url);
                          setPlayingUrl(first.url);
                        }
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        activeSourceIndex === index
                          ? 'bg-fox-500 text-white shadow'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {src.sourceName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">选集切换</h3>
                <span className="text-xs text-slate-400">共 {currentSource?.episodes.length || 0} 集</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-48 overflow-y-auto pr-1">
                {currentSource?.episodes.map((ep, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectEpisode(idx)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all truncate ${
                      activeEpisodeIndex === idx
                        ? 'bg-fox-500 text-white shadow'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {ep.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Satellite TV Live Channels Section */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-slate-100 text-lg">
          <Tv className="w-5 h-5 text-fox-500" />
          <h2>全国央视 & 卫视直播频道</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          点击下方卫视频道，可一键在线预览高清卫视直播流或获取直链。
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {SATELLITE_TV_CHANNELS.map((ch) => (
            <button
              key={ch.id}
              onClick={() => selectSatelliteTv(ch)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                downloadUrl === ch.url
                  ? 'bg-fox-500 border-fox-500 text-white shadow-lg'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-fox-500'
              }`}
            >
              <div className="text-[10px] font-bold opacity-80 uppercase">{ch.category}</div>
              <div className="text-xs font-bold truncate mt-0.5">{ch.name}</div>
            </button>
          ))}
        </div>
      </section>

      {playingUrl && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">在线预览播放 (默认 360P)</h2>
          </div>
          <HlsPlayer url={playingUrl} title="下载页预览" />
        </div>
      )}

      <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
          <Info className="w-4 h-4 text-fox-500" />
          <span>下载与直播说明</span>
        </div>
        <ul className="list-disc list-inside space-y-1 leading-relaxed">
          <li>M3U8 格式为切片视频流，建议使用 NDM、IDM、或 M3U8 Downloader 工具进行抓取合并下载。</li>
          <li>卫星电视台直播源为 HLS 流媒体，直接点击上方卫视卡片即可在下方播放窗口观看或复制下载直链。</li>
        </ul>
      </div>
    </div>
  );
};
