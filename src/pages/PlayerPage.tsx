import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { fetchVodDetail, parsePlayUrls, VideoItem, PlaySource, Episode } from '../services/cmsApi';
import { HlsPlayer } from '../components/HlsPlayer';
import { ArrowLeft, Home, Download, SkipBack, SkipForward, Layers, Check, Copy } from 'lucide-react';

export const PlayerPage: React.FC = () => {
  const { sourceId, vodId } = useParams<{ sourceId: string; vodId: string }>();
  const navigate = useNavigate();
  const { apiList, addHistory } = useApp();

  const [video, setVideo] = useState<VideoItem | null>(null);
  const [playSources, setPlaySources] = useState<PlaySource[]>([]);
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [activeEpisodeIndex, setActiveEpisodeIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadVideo = async () => {
      setLoading(true);
      if (!sourceId || !vodId) return;

      const api = apiList.find((a) => a.id === sourceId) || apiList[0];
      const data = await fetchVodDetail(api, vodId);

      if (data) {
        setVideo(data);
        const parsedSources = parsePlayUrls(data.vod_play_from, data.vod_play_url);
        setPlaySources(parsedSources);

        if (parsedSources.length > 0 && parsedSources[0].episodes.length > 0) {
          addHistory({
            id: `${sourceId}-${vodId}`,
            vod_name: data.vod_name,
            vod_pic: data.vod_pic,
            source_id: sourceId,
            source_name: api.name,
            episode_name: parsedSources[0].episodes[0].name,
            episode_url: parsedSources[0].episodes[0].url,
          });
        }
      }
      setLoading(false);
    };

    loadVideo();
  }, [sourceId, vodId, apiList]);

  const currentSource = playSources[activeSourceIndex];
  const currentEpisode: Episode | undefined = currentSource?.episodes[activeEpisodeIndex];

  const handleSelectEpisode = (epIndex: number) => {
    setActiveEpisodeIndex(epIndex);
    const ep = currentSource?.episodes[epIndex];
    if (video && ep) {
      addHistory({
        id: `${sourceId}-${vodId}`,
        vod_name: video.vod_name,
        vod_pic: video.vod_pic,
        source_id: sourceId || '',
        source_name: video.source_name || '',
        episode_name: ep.name,
        episode_url: ep.url,
      });
    }
  };

  const handlePrevEpisode = () => {
    if (activeEpisodeIndex > 0) {
      handleSelectEpisode(activeEpisodeIndex - 1);
    }
  };

  const handleNextEpisode = () => {
    if (currentSource && activeEpisodeIndex < currentSource.episodes.length - 1) {
      handleSelectEpisode(activeEpisodeIndex + 1);
    }
  };

  const copyDownloadUrl = () => {
    if (currentEpisode?.url) {
      navigator.clipboard.writeText(currentEpisode.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-fox-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!video || playSources.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-xl mx-auto space-y-4">
        <p className="text-slate-500 dark:text-slate-400 font-medium">未能获取到该视频的播放源数据</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-fox-500 text-white rounded-xl font-medium inline-flex items-center space-x-2"
        >
          <Home className="w-4 h-4" />
          <span>返回首页</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm flex items-center space-x-2 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回主界面</span>
        </button>

        <div className="flex items-center space-x-2">
          <Link
            to="/download"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium flex items-center space-x-2 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>下载中心</span>
          </Link>
        </div>
      </div>

      {currentEpisode ? (
        <HlsPlayer
          url={currentEpisode.url}
          title={`${video.vod_name} - ${currentEpisode.name}`}
          onEnded={handleNextEpisode}
        />
      ) : null}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrevEpisode}
            disabled={activeEpisodeIndex === 0}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <SkipBack className="w-4 h-4" />
            <span>上一集</span>
          </button>
          <button
            onClick={handleNextEpisode}
            disabled={!currentSource || activeEpisodeIndex === currentSource.episodes.length - 1}
            className="px-4 py-2 rounded-xl bg-fox-500 text-white disabled:opacity-40 hover:bg-fox-600 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-md shadow-fox-500/20"
          >
            <span>下一集</span>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={copyDownloadUrl}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-md shadow-emerald-600/20"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '已复制下载链接' : '复制集数直链'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
        {playSources.length > 1 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-800 dark:text-slate-200">
              <Layers className="w-4 h-4 text-fox-500" />
              <span>播放线路</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {playSources.map((src, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveSourceIndex(index);
                    setActiveEpisodeIndex(0);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">选集列表</h3>
            <span className="text-xs text-slate-400">共 {currentSource?.episodes.length || 0} 集</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
            {currentSource?.episodes.map((ep, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectEpisode(idx)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all truncate ${
                  activeEpisodeIndex === idx
                    ? 'bg-fox-500 text-white shadow-md shadow-fox-500/30 scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {ep.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-md">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{video.vod_name}</h2>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>{video.vod_year}</span>
          <span>·</span>
          <span>{video.type_name}</span>
          <span>·</span>
          <span>{video.vod_area}</span>
          <span>·</span>
          <span>源: {video.source_name}</span>
        </div>
        {video.vod_content && (
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
            {video.vod_content.replace(/<[^>]+>/g, '')}
          </p>
        )}
      </div>
    </div>
  );
};
