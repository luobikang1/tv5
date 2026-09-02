import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { VideoItem } from '../services/cmsApi';
import { DEFAULT_POSTER, getProxyPosterUrl } from '../services/posterProxy';
import { Play } from 'lucide-react';

interface VideoCardProps {
  video: VideoItem;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [imgSrc, setImgSrc] = useState<string>(() => getProxyPosterUrl(video.vod_pic));
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(DEFAULT_POSTER);
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

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-fox-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </div>

        {video.vod_remarks && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-medium">
            {video.vod_remarks}
          </span>
        )}

        {video.source_name && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-fox-500/90 text-white text-[10px] font-bold tracking-wide uppercase shadow">
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
