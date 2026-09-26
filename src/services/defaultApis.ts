export interface CmsApiSource {
  id: string;
  name: string;
  url: string;
  type: 'video' | 'adult';
  isDefault?: boolean;
}

export const DEFAULT_VIDEO_APIS: CmsApiSource[] = [
  { id: 'bfzy', name: '暴风资源 (极速)', url: 'https://bfzyapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'ikun', name: 'iKun 资源 (超清)', url: 'https://ikunzyapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'lzzy', name: '量子资源 (全画质)', url: 'https://cj.lziapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'ffzy', name: '非凡资源 (无阻)', url: 'https://cj.ffzyapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'hnzy', name: '红牛资源 (秒播)', url: 'https://www.hongniuzy2.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'hk_tvb', name: '香港翡翠台 API 专线', url: 'https://cj.ffzyapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'tw_gtv', name: '台湾八大 TV API 专线', url: 'https://bfzyapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'snzy', name: '索尼资源', url: 'https://suoniapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'subo', name: '速播资源', url: 'https://subocaiji.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'jszy', name: '极速资源', url: 'https://jszyapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'skzy', name: '鲨鱼资源', url: 'https://shayuapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'kuaici', name: '快车云加速 API', url: 'https://bfzyapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'dbzy', name: '豆瓣云资源', url: 'https://cj.ffzyapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'wlzy', name: '卧龙高画质', url: 'https://cj.lziapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'w2zy', name: '无尽蓝光 API', url: 'https://ikunzyapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'zy39', name: '39 影视秒播', url: 'https://bfzyapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'xkzy', name: '新浪高清资源', url: 'https://cj.ffzyapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'guangsu', name: '光速极速切片', url: 'https://cj.lziapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'bdzy', name: '百度秒播资源', url: 'https://ikunzyapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'yhzy', name: '樱花动漫资源', url: 'https://cj.ffzyapi.com/api.php/provide/vod', type: 'video', isDefault: true },
];

export const DEFAULT_ADULT_APIS: CmsApiSource[] = [
  { id: 'ad_ff', name: '非凡成人专线', url: 'https://cj.ffzyapi.com/api.php/provide/vod', type: 'adult' },
  { id: 'ad_bf', name: '暴风成人专线', url: 'https://bfzyapi.com/api.php/provide/vod', type: 'adult' },
  { id: 'ad_lz', name: '量子成人专线', url: 'https://cj.lziapi.com/api.php/provide/vod', type: 'adult' },
  { id: 'ad_ikun', name: 'iKun 成人专线', url: 'https://ikunzyapi.com/api.php/provide/vod', type: 'adult' },
];
