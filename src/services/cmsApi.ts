import { CmsApiSource } from './defaultApis';

export interface VideoItem {
  vod_id: string | number;
  vod_name: string;
  type_id?: number;
  type_name?: string;
  vod_pic?: string;
  vod_remarks?: string;
  vod_year?: string;
  vod_area?: string;
  vod_actor?: string;
  vod_director?: string;
  vod_content?: string;
  vod_play_from?: string;
  vod_play_url?: string;
  source_id?: string;
  source_name?: string;
}

export interface Episode {
  name: string;
  url: string;
}

export interface PlaySource {
  sourceName: string;
  episodes: Episode[];
}

export interface CmsResponse {
  code: number;
  msg: string;
  page: number | string;
  pagecount: number;
  limit: number | string;
  total: number;
  list: VideoItem[];
}

/**
 * Fetch data with timeout and proxy support
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    // If direct fetch fails, try Cloudflare Pages API proxy if on web
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
    return fetch(proxyUrl, options);
  }
}

/**
 * Fetch video list from a CMS API
 */
export async function fetchVodList(
  api: CmsApiSource,
  params: { page?: number; cid?: number; keyword?: string } = {}
): Promise<{ list: VideoItem[]; pagecount: number }> {
  try {
    const searchParams = new URLSearchParams({ ac: 'detail' });
    if (params.page) searchParams.set('pg', params.page.toString());
    if (params.cid) searchParams.set('t', params.cid.toString());
    if (params.keyword) searchParams.set('wd', params.keyword);

    const fullUrl = `${api.url}${api.url.includes('?') ? '&' : '?'}${searchParams.toString()}`;
    const res = await fetchWithTimeout(fullUrl);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: CmsResponse = await res.json();

    const list = (data.list || []).map((item) => ({
      ...item,
      source_id: api.id,
      source_name: api.name,
    }));

    return {
      list,
      pagecount: Number(data.pagecount) || 1,
    };
  } catch (error) {
    console.warn(`Failed to fetch from ${api.name}:`, error);
    return { list: [], pagecount: 0 };
  }
}

/**
 * Perform aggregated search across all active APIs
 */
export async function searchAggregated(
  apis: CmsApiSource[],
  keyword: string
): Promise<VideoItem[]> {
  if (!keyword.trim()) return [];

  const promises = apis.map((api) => fetchVodList(api, { keyword, page: 1 }));
  const results = await Promise.allSettled(promises);

  const combined: VideoItem[] = [];
  results.forEach((res) => {
    if (res.status === 'fulfilled' && res.value.list) {
      combined.push(...res.value.list);
    }
  });

  return combined;
}

/**
 * Fetch video details by ID from a specific CMS source
 */
export async function fetchVodDetail(api: CmsApiSource, vodId: string | number): Promise<VideoItem | null> {
  try {
    const searchParams = new URLSearchParams({
      ac: 'detail',
      ids: vodId.toString(),
    });
    const fullUrl = `${api.url}${api.url.includes('?') ? '&' : '?'}${searchParams.toString()}`;
    const res = await fetchWithTimeout(fullUrl);
    if (!res.ok) return null;

    const data: CmsResponse = await res.json();
    if (data.list && data.list.length > 0) {
      return {
        ...data.list[0],
        source_id: api.id,
        source_name: api.name,
      };
    }
    return null;
  } catch (err) {
    console.error(`Failed to get detail from ${api.name}:`, err);
    return null;
  }
}

/**
 * Parse standard MacCMS play url format: "Episode 1$http://...m3u8#Episode 2$http://...m3u8"
 */
export function parsePlayUrls(vodPlayFrom?: string, vodPlayUrl?: string): PlaySource[] {
  if (!vodPlayUrl) return [];

  const sources = (vodPlayFrom || '默认源').split('$$$');
  const playUrlGroups = vodPlayUrl.split('$$$');

  return sources.map((sourceName, index) => {
    const rawEpisodes = playUrlGroups[index] ? playUrlGroups[index].split('#') : [];
    const episodes: Episode[] = rawEpisodes
      .map((item) => {
        const parts = item.split('$');
        if (parts.length >= 2) {
          return { name: parts[0], url: parts[1] };
        } else if (parts.length === 1 && parts[0].startsWith('http')) {
          return { name: '播放', url: parts[0] };
        }
        return null;
      })
      .filter((ep): ep is Episode => ep !== null && ep.url.length > 0);

    return {
      sourceName: sourceName.toUpperCase(),
      episodes,
    };
  });
}
