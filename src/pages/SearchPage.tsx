import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { searchAggregated, VideoItem } from '../services/cmsApi';
import { VideoCard } from '../components/VideoCard';
import { HlsPlayer } from '../components/HlsPlayer';
import {
  Search,
  Loader2,
  Film,
  Upload,
  Play,
  Filter,
  Tv,
  Smile,
  Sparkles,
  FileVideo,
  X,
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { id: 'all', name: '全部分类' },
  { id: 'movie', name: '电影' },
  { id: 'tv', name: '连续剧' },
  { id: 'anime', name: '动漫' },
  { id: 'variety', name: '综艺' },
  { id: 'documentary', name: '纪录片' },
  { id: 'adult', name: '成人专区' },
];

export const SearchPage: React.FC = () => {
  const { apiList, showAdultColumn } = useApp();
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [results, setResults] = useState<VideoItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Local Video File State
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [localVideoName, setLocalVideoName] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    let targetApis = apiList;
    if (selectedCategory === 'adult') {
      targetApis = apiList.filter((a) => a.type === 'adult');
    } else {
      targetApis = apiList.filter((a) => a.type !== 'adult');
    }

    if (targetApis.length === 0) {
      targetApis = apiList;
    }

    const searchResults = await searchAggregated(targetApis, keyword);
    setResults(searchResults);
    setIsSearching(false);
  };

  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setLocalVideoUrl(objectUrl);
      setLocalVideoName(file.name);
    }
  };

  const clearLocalVideo = () => {
    if (localVideoUrl) {
      URL.revokeObjectURL(localVideoUrl);
    }
    setLocalVideoUrl(null);
    setLocalVideoName(null);
  };

  // Filter local results by category selection
  const filteredResults = results.filter((item) => {
    if (selectedCategory === 'all') return true;
    const typeName = (item.type_name || '').toLowerCase();
    if (selectedCategory === 'movie') return typeName.includes('影') || typeName.includes('片');
    if (selectedCategory === 'tv') return typeName.includes('剧') || typeName.includes('集');
    if (selectedCategory === 'anime') return typeName.includes('漫') || typeName.includes('动');
    if (selectedCategory === 'variety') return typeName.includes('综艺') || typeName.includes('秀');
    if (selectedCategory === 'documentary') return typeName.includes('纪录') || typeName.includes('纪实');
    if (selectedCategory === 'adult') return item.source_id?.includes('adult') || typeName.includes('伦理') || typeName.includes('成人');
    return true;
  });

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Header Search Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
            全站集合搜索 & 本地视频播放
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            并发请求全网源站接口，支持多分类搜索筛选与本地视频导入秒播
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-4 h-4 text-fox-500 flex-shrink-0" />
          {CATEGORY_OPTIONS.map((cat) => {
            if (cat.id === 'adult' && !showAdultColumn) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-fox-500 text-white shadow-md shadow-fox-500/20 scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Form and Local File Upload */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
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

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="submit"
              disabled={isSearching}
              className="flex-1 sm:flex-initial px-6 py-3.5 bg-fox-500 hover:bg-fox-600 active:bg-fox-700 text-white font-semibold rounded-2xl shadow-lg shadow-fox-500/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 text-sm"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              <span>聚合搜索</span>
            </button>

            {/* Local Video Upload Option */}
            <label className="cursor-pointer px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>本地视频</span>
              <input
                type="file"
                accept="video/*,.m3u8,.mp4,.webm,.mkv,.flv"
                onChange={handleLocalFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </form>
      </div>

      {/* Local Video Player Modal/Section */}
      {localVideoUrl && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-fox-500 font-bold text-base">
              <FileVideo className="w-5 h-5" />
              <span className="text-slate-900 dark:text-slate-100 truncate">本地视频播放: {localVideoName}</span>
            </div>
            <button
              onClick={clearLocalVideo}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
              title="关闭本地视频"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <HlsPlayer url={localVideoUrl} title={localVideoName || '本地视频'} />
        </div>
      )}

      {/* Search Results */}
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
              <span>
                搜索结果 ({filteredResults.length} 项 / 分类: {CATEGORY_OPTIONS.find((c) => c.id === selectedCategory)?.name})
              </span>
            </h2>
          </div>

          {filteredResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {filteredResults.map((vid, i) => (
                <VideoCard key={`${vid.source_id}-${vid.vod_id}-${i}`} video={vid} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400 font-medium">该分类下未找到相关影片，请更换分类或关键字重试</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
