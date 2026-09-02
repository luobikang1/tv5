export interface CmsApiSource {
  id: string;
  name: string;
  url: string;
  type: 'video' | 'adult';
  isDefault?: boolean;
}

export const DEFAULT_VIDEO_APIS: CmsApiSource[] = [
  { id: 'bfzy', name: '暴风资源', url: 'https://bfzyapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'ikun', name: 'iKun资源', url: 'https://ikunzyapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'lzzy', name: '量子资源', url: 'https://cj.lziapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'ffzy', name: '非凡资源', url: 'https://cj.ffzyapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'hnzy', name: '红牛资源', url: 'https://www.hongniuzy2.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'kuaici', name: '快车资源', url: 'https://caiji.kuaici.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'snzy', name: '索尼资源', url: 'https://suoniapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'dbzy', name: '豆瓣资源', url: 'https://dbzy.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'wlzy', name: '卧龙资源', url: 'https://collect.wolongzyw.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'w2zy', name: '无尽资源', url: 'https://api.wujinapi.me/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'skzy', name: '鲨鱼资源', url: 'https://shayuapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'zy39', name: '39影视资源', url: 'https://www.39kan.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'subo', name: '速播资源', url: 'https://subocaiji.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'xkzy', name: '新浪资源', url: 'https://api.xinlangapi.com/xinlangapi.php/provide/vod', type: 'video', isDefault: true },
  { id: 'guangsu', name: '光速资源', url: 'https://api.guangsuapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'jszy', name: '极速资源', url: 'https://jszyapi.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'bdzy', name: '百度资源', url: 'https://api.apibdzy.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'yhzy', name: '樱花资源', url: 'https://m3u8.apiyhzy.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'kuaibo', name: '快播资源', url: 'https://www.kuaibozy.com/api.php/provide/vod', type: 'video', isDefault: true },
  { id: 'mozu', name: '魔都资源', url: 'https://m3u8.maccms.site/api.php/provide/vod', type: 'video', isDefault: true },
];

export const DEFAULT_ADULT_APIS: CmsApiSource[] = [
  { id: 'ad_sex8', name: '色88资源', url: 'https://cj.c26123.com/api.php/provide/vod', type: 'adult' },
  { id: 'ad_91zy', name: '91资源', url: 'https://91zy.com/api.php/provide/vod', type: 'adult' },
  { id: 'ad_ckzy', name: '采花资源', url: 'https://www.caihuazy.com/api.php/provide/vod', type: 'adult' },
  { id: 'ad_yellow', name: '黄瓜资源', url: 'https://huanggua.com/api.php/provide/vod', type: 'adult' },
];
