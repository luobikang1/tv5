import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DEFAULT_POSTER } from '../services/posterProxy';
import { History as HistoryIcon, Trash2, Play, ArrowRight } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { historyList, removeHistoryItem, clearHistory } = useApp();

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-fox-100 dark:bg-fox-900/40 text-fox-500 rounded-2xl">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">观看历史记录</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">记录您最近播放过的影片与剧集进度</p>
          </div>
        </div>

        {historyList.length > 0 && (
          <button
            onClick={clearHistory}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>清空所有记录</span>
          </button>
        )}
      </div>

      {historyList.length > 0 ? (
        <div className="space-y-4">
          {historyList.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all gap-4"
            >
              <div className="flex items-center space-x-4 min-w-0">
                <img
                  src={item.vod_pic || DEFAULT_POSTER}
                  alt={item.vod_name}
                  className="w-16 h-20 object-cover rounded-xl bg-slate-200 dark:bg-slate-800 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_POSTER;
                  }}
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                    {item.vod_name}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                      {item.episode_name || '上次观看'}
                    </span>
                    <span>·</span>
                    <span>{item.source_name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    {new Date(item.updated_at).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <Link
                  to={`/player/${item.source_id}/${item.id.toString().replace(`${item.source_id}-`, '')}`}
                  className="p-2.5 bg-fox-500 hover:bg-fox-600 text-white rounded-xl shadow-md shadow-fox-500/20 flex items-center space-x-1 text-xs font-semibold"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span className="hidden sm:inline">继续播放</span>
                </Link>
                <button
                  onClick={() => removeHistoryItem(item.id)}
                  className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                  title="删除此记录"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <HistoryIcon className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">暂无观看历史记录</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-fox-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-fox-500/20"
          >
            <span>去首页浏览精彩影片</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};
