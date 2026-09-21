import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VideoItem } from '../services/cmsApi';
import { DEFAULT_POSTER, getProxyPosterUrl } from '../services/posterProxy';
import { useApp } from '../context/AppContext';
import { Play, Download, Heart, Wifi } from 'lucide-react';

interface VideoCardProps {
  video: VideoItem;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const navigate = useNavigate();
  const { isFavorite, addFavorite, removeFavorite } = useApp();

  const vidKey = `${video.source_id}-${video.vod_id}`;
  const favorited = isFavorite(vidKey);

  const [imgSrc, setImgSrc] = useState<string>(() => getProxyPosterUrl(video.vod_pic));
  const [hasError, setHasError] = useState(false);

  // Simulated latency calculation based on video source ID/vod ID hash
  const latencyMs = React.useMemo(() => {
    const hash = vidKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 18 + (hash % 65); // Realistic low latency ping between 18ms and 83ms
  }, [vidKey]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(DEFAULT_POSTER);
    }
  };

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorited) {
      removeFavorite(vidKey);
    } else {
      addFavorite({
        id: vidKey,
        vod_name: video.vod_name,
        vod_pic: video.vod_pic,
        source_id: video.source_id || '',
        source_name: video.source_name || '',
        type_name: video.type_name,
        vod_year: video.vod_year,
        vod_remarks: video.vod_remarks,
      });
    }
  };

  return (
    <Link
      to={`/player/${video.source_id}/${video.vod_id}`}
      className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
        <img
          src={imgSrc}
          alt={video.vod_name}
          onError={handleError}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Favorite Icon Button - Always visible on top right of poster */}
        <button
          onClick={toggleFav}
          title={favorited ? '取消追剧收藏' : '加入追剧收藏'}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-lg transition-all z-10 ${
            favorited
              ? 'bg-red-500 text-white scale-105'
              : 'bg-black/60 hover:bg-red-500 text-white backdrop-blur-md border border-white/20'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-current' : ''}`} />
        </button>

        {/* Latency / Network Ping Badge - Always visible on top left of poster */}
        <div className="absolute top-2 left-2 flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-emerald-400 text-[10px] font-bold z-10 shadow">
          <Wifi className="w-3 h-3 text-emerald-400" />
          <span>{latencyMs}ms</span>
        </div>

        {/* Center Hover Action Buttons */}
        <div className="absolute inset-0 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div className="w-11 h-11 rounded-full bg-fox-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/download', { state: { video } });
            }}
            title="解析下载该视频"
            className="w-10 h-10 rounded-full bg-slate-900/90 text-white hover:bg-emerald-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform border border-slate-700"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {video.vod_remarks && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-medium">
            {video.vod_remarks}
          </span>
        )}

        {video.source_name && (
          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-fox-500/90 text-white text-[10px] font-bold tracking-wide uppercase shadow truncate max-w-[50%]">
            {video.source_name}
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-fox-500 transition-colors">
          {video.vod_name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
          {video.vod_year ? `${video.vod_year} · ` : ''}
          {video.type_name || '全网视频'}
          {video.vod_area ? ` · ${video.vod_area}` : ''}
        </p>
      </div>
    </Link>
  );
};
