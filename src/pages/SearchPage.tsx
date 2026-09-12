import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { searchAggregated, VideoItem } from '../services/cmsApi';
import { VideoCard } from '../components/VideoCard';
import { Search, Loader2, Film, Heart, Globe, Youtube, Play, TrendingUp, ShieldCheck, Sparkles } from 'lucide-react';

interface RecommendedVideo {
  id: string;
  title: string;
  category: string;
  cover: string;
  query: string;
  embedUrl?: string;
  youtubeId?: string;
}

const POPULAR_RECOMMENDATIONS: RecommendedVideo[] = [
  {
    id: 'pop-1',
    title: '热播华语连续剧 (全网聚合)',
    category: '国产剧集',
    cover: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=600&q=80',
    query: '繁花',
  },
  {
    id: 'pop-2',
    title: '院线高分爆款大片',
    category: '电影推荐',
    cover: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    query: '热辣滚烫',
  },
  {
    id: 'pop-3',
    title: '周杰伦 20年经典演唱会合集',
    category: '音乐现场',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    query: '周杰伦演唱会',
    youtubeId: 'videoseries?list=PLv4fX48U0S9kLz1U-eG0sV4b0k9Z4v220',
  },
  {
    id: 'pop-4',
    title: '4K 极清环球自然风光 (免代理解封)',
    category: '4K 风光',
    cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    query: '4K 演示风光',
    youtubeId: '1La4QzGeaaQ',
  },
  {
    id: 'pop-5',
    title: '热门网剧与精彩综艺',
    category: '综艺娱乐',
    cover: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=600&q=80',
    query: '狂飙',
  },
  {
    id: 'pop-6',
    title: 'TED 演讲：洞察未来的力量',
    category: '知识科普',
    cover: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80',
    query: 'TED 演讲',
    youtubeId: '_QdPW8JrYzQ',
  },
];

export const SearchPage: React.FC = () => {
  const { apiList, favoritesList, toggleFavorite } = useApp();
  const [searchMode, setSearchMode] = useState<'cms' | 'web'>('cms');
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<VideoItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Universal Web & YouTube embedded video player state
  const [activeWebEmbedUrl, setActiveWebEmbedUrl] = useState('');
  const [usingChinaProxy, setUsingChinaProxy] = useState(true);

  // Generate video embed URL (Standard YouTube embed or Invidious/Proxy Mirror for Mainland China without proxy)
  const formatYoutubeEmbed = (urlOrQuery: string, useProxyMirror = true): string => {
    let clean = urlOrQuery.trim();
    let videoId = '';

    if (clean.includes('youtube.com/watch?v=') || clean.includes('youtu.be/')) {
      videoId = clean.split('v=')[1]?.split('&')[0] || clean.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (clean.includes('youtube.com/embed/')) {
      videoId = clean.split('youtube.com/embed/')[1]?.split('?')[0] || '';
    }

    // Invidious / Piped proxy mirror hosts accessible in China without VPN/proxy
    const chinaProxyHost = 'https://yewtu.be';

    if (videoId) {
      return useProxyMirror
        ? `${chinaProxyHost}/embed/${videoId}?autoplay=1`
        : `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }

    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      return clean;
    }

    // Keyword search embed query
    return useProxyMirror
      ? `${chinaProxyHost}/embed?listType=search&list=${encodeURIComponent(clean)}`
      : `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(clean)}`;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    if (searchMode === 'web') {
      const embedUrl = formatYoutubeEmbed(keyword, usingChinaProxy);
      setActiveWebEmbedUrl(embedUrl);
      setHasSearched(true);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    const activeApis = apiList.filter((a) => a.type !== 'adult');
    const searchResults = await searchAggregated(activeApis, keyword);
    setResults(searchResults);
    setIsSearching(false);
  };

  const handleRecommendClick = (rec: RecommendedVideo) => {
    if (rec.youtubeId) {
      setSearchMode('web');
      setKeyword(rec.title);
      const embedUrl = formatYoutubeEmbed(rec.youtubeId, usingChinaProxy);
      setActiveWebEmbedUrl(embedUrl);
      setHasSearched(true);
    } else {
      setSearchMode('cms');
      setKeyword(rec.query);
      setIsSearching(true);
      setHasSearched(true);
      const activeApis = apiList.filter((a) => a.type !== 'adult');
      searchAggregated(activeApis, rec.query).then((res) => {
        setResults(res);
        setIsSearching(false);
      });
    }
  };

  return (
    <div className="space-y-10 pb-16 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-fox-100 dark:bg-fox-950 text-fox-600 dark:text-fox-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>白狐5 全网视频搜索引擎</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
            中国主流平台 & 全网视频聚合搜索
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-2">
            并发请求 20+ 内置源站接口，并支持 YouTube/全网视频免代理在线播放与流畅解析
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setSearchMode('cms');
              setActiveWebEmbedUrl('');
            }}
            className={`px-5 py-2.5 rounded-xl transition-all flex items-center space-x-2 ${
              searchMode === 'cms'
                ? 'bg-fox-500 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>中国主流影视源站聚合 (20+ 接口)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchMode('web');
            }}
            className={`px-5 py-2.5 rounded-xl transition-all flex items-center space-x-2 ${
              searchMode === 'web'
                ? 'bg-fox-500 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>互联网全网视频 / YouTube 播放</span>
          </button>
        </div>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={
                searchMode === 'cms'
                  ? '输入影视名称、演员或导演关键词 (如: 繁花, 狂飙)...'
                  : '输入 YouTube 关键字或全网视频 URL 链接...'
              }
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fox-500 transition-all text-sm sm:text-base"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-3.5 bg-fox-500 hover:bg-fox-600 active:bg-fox-700 text-white font-medium rounded-2xl shadow-lg shadow-fox-500/30 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
            <span className="hidden sm:inline">全网搜索</span>
          </button>
        </form>

        {/* Popular Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span>热门搜索标签:</span>
          {['热辣滚烫', '繁花', '狂飙', '4K 演示风光', '周杰伦 Live', 'TED 演讲'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setKeyword(tag);
                if (['4K 演示风光', '周杰伦 Live', 'TED 演讲'].includes(tag)) {
                  setSearchMode('web');
                  setActiveWebEmbedUrl(formatYoutubeEmbed(tag, usingChinaProxy));
                  setHasSearched(true);
                } else {
                  setSearchMode('cms');
                  setIsSearching(true);
                  setHasSearched(true);
                  const activeApis = apiList.filter((a) => a.type !== 'adult');
                  searchAggregated(activeApis, tag).then((res) => {
                    setResults(res);
                    setIsSearching(false);
                  });
                }
              }}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-fox-500 hover:text-white rounded-lg transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Embedded Web Video Player */}
      {searchMode === 'web' && activeWebEmbedUrl && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-slate-100">
              <Youtube className="w-5 h-5 text-red-500" />
              <span>全网在线视频播放窗口</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  const nextProxyState = !usingChinaProxy;
                  setUsingChinaProxy(nextProxyState);
                  setActiveWebEmbedUrl(formatYoutubeEmbed(keyword, nextProxyState));
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1 ${
                  usingChinaProxy
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{usingChinaProxy ? '国内免代理代理镜像已开启' : '启用 YouTube 直连模式'}</span>
              </button>
            </div>
          </div>

          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner">
            <iframe
              src={activeWebEmbedUrl}
              title="Universal Web Video"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Popular Video Recommendations Section */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-fox-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">热门视频推荐</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {POPULAR_RECOMMENDATIONS.map((rec) => (
            <div
              key={rec.id}
              onClick={() => handleRecommendClick(rec)}
              className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 aspect-[16/9] flex flex-col justify-end p-4 text-white"
            >
              <img
                src={rec.cover}
                alt={rec.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <div className="relative z-10 space-y-1">
                <span className="inline-block px-2 py-0.5 rounded-md bg-fox-500 text-[10px] font-bold uppercase tracking-wider">
                  {rec.category}
                </span>
                <h3 className="font-bold text-base line-clamp-1 group-hover:text-fox-400 transition-colors">
                  {rec.title}
                </h3>
              </div>

              <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-5 h-5 fill-current text-white ml-0.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CMS Search Results */}
      {searchMode === 'cms' && (
        <>
          {isSearching ? (
            <div className="text-center py-16 space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-fox-500 mx-auto" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">正在并发抓取中国主流影视源站中...</p>
            </div>
          ) : hasSearched ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <Film className="w-5 h-5 text-fox-500" />
                  <span>搜索结果 ({results.length} 项)</span>
                </h2>
              </div>

              {results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                  {results.map((vid, i) => (
                    <VideoCard key={`${vid.source_id}-${vid.vod_id}-${i}`} video={vid} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500 dark:text-slate-400 font-medium">未搜到相关影片，请更换关键字重试</p>
                </div>
              )}
            </div>
          ) : null}
        </>
      )}

      {/* Favorites Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xl font-extrabold text-slate-900 dark:text-slate-100">
            <div className="p-2 bg-red-500/10 text-red-500 rounded-xl">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <h2>我的影视收藏</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            共 {favoritesList.length} 部收藏影片
          </span>
        </div>

        {favoritesList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {favoritesList.map((fav) => (
              <VideoCard
                key={fav.id}
                video={{
                  vod_id: fav.vod_id,
                  vod_name: fav.vod_name,
                  vod_pic: fav.vod_pic,
                  source_id: fav.source_id,
                  source_name: fav.source_name,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <Heart className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">暂无收藏影片，点击海报右上角红心可一键收藏</p>
          </div>
        )}
      </div>
    </div>
  );
};
