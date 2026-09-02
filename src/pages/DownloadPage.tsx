import React, { useState } from 'react';
import { HlsPlayer } from '../components/HlsPlayer';
import { Download, Play, Copy, Check, Link as LinkIcon, Info } from 'lucide-react';

export const DownloadPage: React.FC = () => {
  const [downloadUrl, setDownloadUrl] = useState('');
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-4">
        <div className="flex items-center space-x-3 text-fox-500">
          <Download className="w-8 h-8" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            下载中心与在线解析播放
          </h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          粘贴任何 M3U8 / MP4 视频链接，可直接在线流畅播放或一键复制链接使用 NDM / M3U8 Downloader 进行高速下载。
        </p>

        <form onSubmit={handlePlayInline} className="space-y-4 pt-2">
          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              placeholder="粘贴视频 M3U8 / MP4 直链地址 (例如: https://.../index.m3u8)"
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
      </div>

      {playingUrl && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">在线测试/预览播放</h2>
          <HlsPlayer url={playingUrl} title="自定直链播放" />
        </div>
      )}

      <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
          <Info className="w-4 h-4 text-fox-500" />
          <span>下载建议说明</span>
        </div>
        <ul className="list-disc list-inside space-y-1 leading-relaxed">
          <li>M3U8 格式为切片视频流，建议使用 NDM、IDM、或 M3U8 Downloader 工具进行抓取合并下载。</li>
          <li>部分源站开启了防盗链，若在线播放卡顿或无法下载，可尝试在设置中切换代理或使用桌面端下载软件。</li>
        </ul>
      </div>
    </div>
  );
};
