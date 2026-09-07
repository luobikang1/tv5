export interface CmsApiSource {
  id: string;
  name: string;
  url: string;
  type: 'video' | 'adult';
  isDefault?: boolean;
  language?: string;
  description?: string;
}

export const DEFAULT_VIDEO_APIS: CmsApiSource[] = [
  { id: 'bfzy', name: '暴风资源', url: 'https://bfzyapi.com/api.php/provide/vod', type: 'video', isDefault: true, language: '中文' },
  { id: 'ikun', name: 'iKun资源', url: 'https://ikunzyapi.com/api.php/provide/vod', type: 'video', isDefault: true, language: '中文' },
  { id: 'lzzy', name: '量子资源', url: 'https://cj.lziapi.com/api.php/provide/vod', type: 'video', isDefault: true, language: '中文' },
  { id: 'ffzy', name: '非凡资源', url: 'https://cj.ffzyapi.com/api.php/provide/vod', type: 'video', isDefault: true, language: '中文' },
  { id: 'hnzy', name: '红牛资源', url: 'https://www.hongniuzy2.com/api.php/provide/vod', type: 'video', isDefault: true, language: '中文' },
  { id: 'kuaici', name: '快车资源', url: 'https://caiji.kuaici.com/api.php/provide/vod', type: 'video', isDefault: true, language: '中文' },
  { id: 'snzy', name: '索尼资源', url: 'https://suoniapi.com/api.php/provide/vod', type: 'video', isDefault: true, language: '中文' },
  { id: 'dbzy', name: '豆瓣资源', url: 'https://dbzy.com/api.php/provide/vod', type: 'video', isDefault: true, language: '中文' },
  { id: 'wlzy', name: '卧龙资源', url: 'https://collect.wolongzyw.com/api.php/provide/vod', type: 'video', isDefault: true, language: '中文' },
  { id: 'w2zy', name: '无尽资源', url: 'https://api.wujinapi.me/api.php/provide/vod', type: 'video', isDefault: true, language: '中文' },
  { id: 'skzy', name: '鲨鱼资源', url: 'https://shayuapi.com/api.php/provide/vod', type: 'video', isDefault: true, language: '中文' },
  { id: 'zy39', name: '39影视资源', url: 'https://www.39kan.com/api.php/provide/vod', type: 'video', isDefault: true, language: '中文' },
  { id: 'subo', name: '速播资源', url: 'https://subocaiji.com/api.php/provide/vod', type: 'video', isDefault: true, language: '中文' },
  { id: 'xkzy', name: '新浪资源', url: 'https://api.xinlangapi.com/xinlangapi.php/provide/vod', type: 'video', isDefault: true, language: '中文' },
  { id: 'guangsu', name: '光速资源', url: 'https://api.guangsuapi.com/api.php/provide/vod', type: 'video', isDefault: true, language: '中文' },
  { id: 'jszy', name: '极速资源', url: 'https://jszyapi.com/api.php/provide/vod', type: 'video', isDefault: true, language: '中文' },
  { id: 'bdzy', name: '百度资源', url: 'https://api.apibdzy.com/api.php/provide/vod', type: 'video', isDefault: true, language: '中文' },
  { id: 'yhzy', name: '樱花资源', url: 'https://m3u8.apiyhzy.com/api.php/provide/vod', type: 'video', isDefault: true, language: '中文' },
  { id: 'kuaibo', name: '快播资源', url: 'https://www.kuaibozy.com/api.php/provide/vod', type: 'video', isDefault: true, language: '中文' },
  { id: 'mozu', name: '魔都资源', url: 'https://m3u8.maccms.site/api.php/provide/vod', type: 'video', isDefault: true, language: '中文' },
];

export const SEARCHABLE_INTERNET_APIS: CmsApiSource[] = [
  // Non-Chinese / International Video Sources
  { id: 'ext_vidsrc', name: 'Global Movies (VidSrc English)', url: 'https://vidsrc.me/api/provide/vod', type: 'video', language: 'English', description: '欧美及全球好莱坞英文原声电影电视剧接口' },
  { id: 'ext_anime_en', name: 'Global Anime Collection (English Sub)', url: 'https://anime-api.com/api.php/provide/vod', type: 'video', language: 'Japanese/English', description: '全球动漫与新番多语种音轨/字幕 API' },
  { id: 'ext_overseas_tv', name: 'US/EU Drama Stream (欧美剧源)', url: 'https://movie-api.net/api.php/provide/vod', type: 'video', language: 'English', description: '海外美剧、英剧、韩剧聚合 API 资源' },
  { id: 'ext_world_cinema', name: 'World Cinema API (国际影院)', url: 'https://api.worldcinema.org/api.php/provide/vod', type: 'video', language: 'Multi-language', description: '包含德法意日韩等全球多国高分电影资源' },

  // Chinese Internet Sources
  { id: 'ext_ffzy_m3u8', name: '非凡高清 M3U8 专线', url: 'https://cj.ffzyapi.com/api.php/provide/vod/at/xml/', type: 'video', language: '中文', description: '非凡高清影视切片极速专线' },
  { id: 'ext_lzzy_fast', name: '量子极速解析源', url: 'https://cj.lziapi.com/api.php/provide/vod/at/json/', type: 'video', language: '中文', description: '量子秒播高带宽资源' },
  { id: 'ext_snzy_hd', name: '索尼超清影视源', url: 'https://suoniapi.com/api.php/provide/vod/from/snm3u8/', type: 'video', language: '中文', description: '索尼资源网独立切片源' },
];

export const DEFAULT_ADULT_APIS: CmsApiSource[] = [
  { id: 'ad_sex8', name: '色88资源', url: 'https://cj.c26123.com/api.php/provide/vod', type: 'adult', language: '中文' },
  { id: 'ad_91zy', name: '91资源', url: 'https://91zy.com/api.php/provide/vod', type: 'adult', language: '中文' },
  { id: 'ad_ckzy', name: '采花资源', url: 'https://www.caihuazy.com/api.php/provide/vod', type: 'adult', language: '中文' },
  { id: 'ad_yellow', name: '黄瓜资源', url: 'https://huanggua.com/api.php/provide/vod', type: 'adult', language: '中文' },
];
