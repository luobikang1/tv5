import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { fetchVodList, VideoItem } from '../services/cmsApi';
import { VideoCard } from '../components/VideoCard';
import { Flame, Film, Tv, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { apiList, showAdultColumn } = useApp();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [adultVideos, setAdultVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeApiIndex, setActiveApiIndex] = useState(0);

  const loadData = async () => {
    setLoading(true);
    if (apiList.length === 0) {
      setLoading(false);
      return;
    }

    const currentApi = apiList[activeApiIndex] || apiList[0];
    const res = await fetchVodList(currentApi, { page: 1 });
    setVideos(res.list);

    if (showAdultColumn) {
      const adultApi = apiList.find((a) => a.type === 'adult');
      if (adultApi) {
        const adultRes = await fetchVodList(adultApi, { page: 1 });
        setAdultVideos(adultRes.list);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeApiIndex, showAdultColumn, apiList]);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-fox-600 via-fox-500 to-amber-600 p-8 sm:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>白狐5 极速流媒体引擎</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            高码率低延迟 · 畅享极速影视
          </h1>
          <p className="text-white/80 text-sm sm:text-base">
            内置 20+ 优质源站接口，多码率自适应切换（低至 360P），支持 Cloudflare / Vercel / Docker 多端一键部署。
          </p>
        </div>
      </section>

      {/* API Selector Tabs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-fox-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">源站选择</h2>
          </div>
          <button
            onClick={loadData}
            className="flex items-center space-x-1 text-xs font-medium text-slate-500 hover:text-fox-500 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>刷新接口</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {apiList
            .filter((a) => a.type !== 'adult')
            .map((api, idx) => (
              <button
                key={api.id}
                onClick={() => setActiveApiIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeApiIndex === idx
                    ? 'bg-fox-500 text-white shadow-lg shadow-fox-500/25 scale-105'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {api.name}
              </button>
            ))}
        </div>
      </section>

      {/* Video Grid Section */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2">
          <Film className="w-5 h-5 text-fox-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">最新推荐视频</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 animate-pulse">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-slate-200 dark:bg-slate-800 rounded-2xl aspect-[3/4]" />
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {videos.map((vid) => (
              <VideoCard key={`${vid.source_id}-${vid.vod_id}`} video={vid} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Tv className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">当前源站未返回数据，请尝试上方切换其他接口</p>
          </div>
        )}
      </section>

      {/* Adult Section Column */}
      {showAdultColumn && (
        <section className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-amber-500">成人影片专区</h2>
          </div>

          {adultVideos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {adultVideos.map((vid) => (
                <VideoCard key={`adult-${vid.source_id}-${vid.vod_id}`} video={vid} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">已开启成人专区，正在加载专属接口内容...</p>
          )}
        </section>
      )}
    </div>
  );
};
