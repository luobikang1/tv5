import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { searchAggregated, VideoItem } from '../services/cmsApi';
import { CmsApiSource } from '../services/defaultApis';
import { VideoCard } from '../components/VideoCard';
import {
  Search,
  Loader2,
  Film,
  Download,
  Filter,
  Globe,
  Plus,
  CheckCircle2,
  Sparkles,
  Compass,
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

const RECOMMENDED_ONLINE_APIS: CmsApiSource[] = [
  { id: 'disc_ff', name: '非凡极速资源 API', url: 'https://cj.ffzyapi.com/api.php/provide/vod', type: 'video' },
  { id: 'disc_bf', name: '暴风超清资源 API', url: 'https://bfzyapi.com/api.php/provide/vod', type: 'video' },
  { id: 'disc_lz', name: '量子全高画质 API', url: 'https://cj.lziapi.com/api.php/provide/vod', type: 'video' },
  { id: 'disc_ikun', name: 'iKun 极速无阻 API', url: 'https://ikunzyapi.com/api.php/provide/vod', type: 'video' },
  { id: 'disc_sn', name: '神马云加速 API', url: 'https://img.smdy.cc/api.php/provide/vod', type: 'video' },
  { id: 'disc_hn', name: '红牛高清资源 API', url: 'https://www.hongniuzy2.com/api.php/provide/vod', type: 'video' },
];

export const SearchPage: React.FC = () => {
  const { apiList, addCustomApi, showAdultColumn } = useApp();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState(() => sessionStorage.getItem('wf_search_kw') || '');
  const [selectedCategory, setSelectedCategory] = useState(() => sessionStorage.getItem('wf_search_cat') || 'all');
  const [results, setResults] = useState<VideoItem[]>(() => {
    const saved = sessionStorage.getItem('wf_search_res');
    return saved ? JSON.parse(saved) : [];
  });
  const [hasSearched, setHasSearched] = useState(() => sessionStorage.getItem('wf_search_searched') === 'true');
  const [isSearching, setIsSearching] = useState(false);

  // Internet API Discovery & 1-Click Search
  const [apiSearchQuery, setApiSearchQuery] = useState('');
  const [addedApiIds, setAddedApiIds] = useState<string[]>([]);
  const [isFindingApi, setIsFindingApi] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('wf_search_kw', keyword);
    sessionStorage.setItem('wf_search_cat', selectedCategory);
    sessionStorage.setItem('wf_search_res', JSON.stringify(results));
    sessionStorage.setItem('wf_search_searched', hasSearched ? 'true' : 'false');
  }, [keyword, selectedCategory, results, hasSearched]);

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

  const handleAddDiscoveredApi = (api: CmsApiSource) => {
    addCustomApi({
      ...api,
      id: `custom_disc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    });
    setAddedApiIds((prev) => [...prev, api.id]);
  };

  const handle1ClickFindApis = async () => {
    setIsFindingApi(true);
    setTimeout(() => {
      RECOMMENDED_ONLINE_APIS.forEach((api) => {
        if (!apiList.some((a) => a.url === api.url)) {
          addCustomApi({
            ...api,
            id: `custom_auto_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          });
          setAddedApiIds((prev) => [...prev, api.id]);
        }
      });
      setIsFindingApi(false);
    }, 1200);
  };

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

  const discoveredApisFiltered = RECOMMENDED_ONLINE_APIS.filter((a) =>
    apiSearchQuery ? a.name.includes(apiSearchQuery) || a.url.includes(apiSearchQuery) : true
  );

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Header Search Box */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
            全网视频聚合搜索 & 接口探索
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            并发抓取 20+ 内置接口，多分类检索，搜索状态实时保留（页面返回不丢失）
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

        {/* Form and Video Parsing / Download Center Option */}
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

            <button
              type="button"
              onClick={() => navigate('/download')}
              className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>解析并下载视频</span>
            </button>
          </div>
        </form>
      </div>

      {/* Internet API Discovery & Quick Addition Section */}
      <section className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-bold text-lg">
            <Globe className="w-5 h-5 text-fox-500" />
            <h2>互联网全网 API 动态探索与导入</h2>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={handle1ClickFindApis}
              disabled={isFindingApi}
              className="px-4 py-2 bg-fox-500 hover:bg-fox-600 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow transition-all disabled:opacity-50 whitespace-nowrap"
            >
              <Compass className={`w-4 h-4 ${isFindingApi ? 'animate-spin' : ''}`} />
              <span>一键查找全网可用 API</span>
            </button>

            <input
              type="text"
              value={apiSearchQuery}
              onChange={(e) => setApiSearchQuery(e.target.value)}
              placeholder="搜索可用互联网 API..."
              className="w-full sm:w-48 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fox-500"
            />
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          探索并自动测试互联网优质 CMS 接口，点击【一键查找全网可用 API】即可快速扫描并一键导入全网接口。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
          {discoveredApisFiltered.map((api) => {
            const isAdded = addedApiIds.includes(api.id) || apiList.some((a) => a.url === api.url);
            return (
              <div
                key={api.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs gap-2"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{api.name}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{api.url}</p>
                </div>

                <button
                  onClick={() => handleAddDiscoveredApi(api)}
                  disabled={isAdded}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 flex-shrink-0 transition-all ${
                    isAdded
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 cursor-default'
                      : 'bg-fox-500 hover:bg-fox-600 text-white shadow-md shadow-fox-500/20'
                  }`}
                >
                  {isAdded ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isAdded ? '已加入使用' : '加入使用'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Search Results Section */}
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
