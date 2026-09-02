import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { searchAggregated, VideoItem } from '../services/cmsApi';
import { VideoCard } from '../components/VideoCard';
import { Search, Loader2, Film } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const { apiList } = useApp();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<VideoItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    const activeApis = apiList.filter((a) => a.type !== 'adult');
    const searchResults = await searchAggregated(activeApis, keyword);
    setResults(searchResults);
    setIsSearching(false);
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-4">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
          全站集合搜索
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          同时并发请求 20+ 内置视频 API 接口，一键全网搜索热门影片、电视剧、动漫与综艺
        </p>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex items-center gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="输入影片名称、演员或导演关键词..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fox-500 transition-all text-sm sm:text-base"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-3.5 bg-fox-500 hover:bg-fox-600 active:bg-fox-700 text-white font-medium rounded-2xl shadow-lg shadow-fox-500/30 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            <span className="hidden sm:inline">聚合搜索</span>
          </button>
        </form>
      </div>

      {isSearching ? (
        <div className="text-center py-16 space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-fox-500 mx-auto" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">正在并发抓取全网源站接口中...</p>
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
    </div>
  );
};
