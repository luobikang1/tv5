import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { fetchVodList, VideoItem } from '../services/cmsApi';
import { VideoCard } from '../components/VideoCard';
import { HlsPlayer } from '../components/HlsPlayer';
import { Flame, Film, Tv, Sparkles, AlertTriangle, RefreshCw, Compass, ExternalLink, ChevronDown, ChevronUp, Lock } from 'lucide-react';

interface NavSiteItem {
  name: string;
  desc: string;
  url: string;
  iconLetter: string;
}

interface NavCategory {
  title: string;
  count: number;
  sites: NavSiteItem[];
  isR18?: boolean;
}

const SITE_NAVIGATION_DATA: NavCategory[] = [
  {
    title: '搜索引擎',
    count: 12,
    sites: [
      { name: 'Google', desc: '搜索整个互联网与全球最大搜索引擎', url: 'https://www.google.com', iconLetter: 'D' },
      { name: 'DuckDuckGo', desc: '隐私优先搜索引擎', url: 'https://duckduckgo.com', iconLetter: 'E' },
      { name: 'Ecosia', desc: '种树搜索引擎', url: 'https://www.ecosia.org', iconLetter: 'G' },
      { name: 'Google 学术', desc: '学术文献搜索', url: 'https://scholar.google.com', iconLetter: 'B' },
      { name: 'Bing', desc: '微软搜索引擎', url: 'https://www.bing.com', iconLetter: 'B' },
      { name: 'Brave Search', desc: '独立隐私搜索', url: 'https://search.brave.com', iconLetter: 'S' },
      { name: 'Startpage', desc: '主打隐私的搜索服务', url: 'https://www.startpage.com', iconLetter: 'W' },
      { name: 'WolframAlpha', desc: '计算型知识引擎', url: 'https://www.wolframalpha.com', iconLetter: 'Y' },
      { name: 'Yahoo', desc: '综合搜索门户', url: 'https://www.yahoo.com', iconLetter: 'Y' },
      { name: 'Yandex', desc: '俄罗斯主流搜索引擎', url: 'https://yandex.com', iconLetter: 'K' },
      { name: 'Kagi', desc: '无广告的付费搜索引擎', url: 'https://kagi.com', iconLetter: 'S' },
      { name: 'Semantic Scholar', desc: '学术论文搜索与发现', url: 'https://www.semanticscholar.org', iconLetter: 'S' },
    ],
  },
  {
    title: 'AI 工具',
    count: 14,
    sites: [
      { name: 'ChatGPT', desc: 'OpenAI 对话 AI 助手', url: 'https://chatgpt.com', iconLetter: 'C' },
      { name: 'Gemini', desc: 'Google AI 助手', url: 'https://gemini.google.com', iconLetter: 'G' },
      { name: 'Claude', desc: 'Anthropic AI 助手', url: 'https://claude.ai', iconLetter: 'C' },
      { name: 'Midjourney', desc: 'AI 绘画生成与设计', url: 'https://www.midjourney.com', iconLetter: 'M' },
      { name: 'Perplexity', desc: 'AI 搜索引擎', url: 'https://www.perplexity.ai', iconLetter: 'P' },
      { name: 'Copilot', desc: '微软 AI 助手', url: 'https://copilot.microsoft.com', iconLetter: 'C' },
      { name: 'Poe', desc: '多模型 AI 对话平台', url: 'https://poe.com', iconLetter: 'P' },
      { name: 'Hugging Face', desc: '开源 AI 模型社区', url: 'https://huggingface.co', iconLetter: 'H' },
      { name: 'Runway', desc: 'AI 视频与创意工具', url: 'https://runwayml.com', iconLetter: 'R' },
      { name: 'Leonardo AI', desc: 'AI 图像生成平台', url: 'https://leonardo.ai', iconLetter: 'L' },
      { name: 'DeepSeek', desc: 'AI 对话与推理助手', url: 'https://www.deepseek.com', iconLetter: 'D' },
      { name: 'Qwen', desc: '通义千问 AI 助手', url: 'https://qwenlm.ai', iconLetter: 'Q' },
      { name: 'Kimi', desc: 'AI 对话、写作与编程', url: 'https://kimi.moonshot.cn', iconLetter: 'K' },
      { name: 'Suno', desc: 'AI 歌曲与音乐创作', url: 'https://suno.com', iconLetter: 'S' },
    ],
  },
  {
    title: '社交平台',
    count: 12,
    sites: [
      { name: 'X (Twitter)', desc: '全球社交与资讯', url: 'https://x.com', iconLetter: 'X' },
      { name: 'Facebook', desc: '全球社交网络', url: 'https://www.facebook.com', iconLetter: 'F' },
      { name: 'Instagram', desc: '图片与短视频社交', url: 'https://www.instagram.com', iconLetter: 'I' },
      { name: 'Reddit', desc: '全球论坛社区', url: 'https://www.reddit.com', iconLetter: 'R' },
      { name: 'Telegram', desc: '加密即时通讯', url: 'https://telegram.org', iconLetter: 'T' },
      { name: 'Discord', desc: '语音与社区平台', url: 'https://discord.com', iconLetter: 'D' },
      { name: 'WhatsApp', desc: '全球即时通讯', url: 'https://www.whatsapp.com', iconLetter: 'W' },
      { name: 'LINE', desc: '日韩热门通讯', url: 'https://line.me', iconLetter: 'L' },
      { name: 'LinkedIn', desc: '职业社交平台', url: 'https://www.linkedin.com', iconLetter: 'L' },
      { name: 'Threads', desc: 'Meta 文字社交平台', url: 'https://www.threads.net', iconLetter: 'T' },
      { name: 'Snapchat', desc: '年轻用户短内容社交', url: 'https://www.snapchat.com', iconLetter: 'S' },
      { name: 'Mastodon', desc: '去中心化社交网络', url: 'https://joinmastodon.org', iconLetter: 'M' },
    ],
  },
  {
    title: '视频影视',
    count: 12,
    sites: [
      { name: 'YouTube', desc: '全球最大视频平台', url: 'https://www.youtube.com', iconLetter: 'Y' },
      { name: 'Netflix', desc: '流媒体影视巨头', url: 'https://www.netflix.com', iconLetter: 'N' },
      { name: 'Disney+', desc: '迪士尼流媒体', url: 'https://www.disneyplus.com', iconLetter: 'D' },
      { name: 'Max (HBO)', desc: '精品美剧平台', url: 'https://www.max.com', iconLetter: 'M' },
      { name: 'Prime Video', desc: '亚马逊视频', url: 'https://www.primevideo.com', iconLetter: 'P' },
      { name: 'Twitch', desc: '全球游戏直播', url: 'https://www.twitch.tv', iconLetter: 'T' },
      { name: 'Vimeo', desc: '高品质视频社区', url: 'https://vimeo.com', iconLetter: 'V' },
      { name: 'Crunchyroll', desc: '正版日本动漫', url: 'https://www.crunchyroll.com', iconLetter: 'C' },
      { name: 'TikTok', desc: '全球短视频平台', url: 'https://www.tiktok.com', iconLetter: 'T' },
      { name: 'Bilibili', desc: '视频与二次元社区', url: 'https://www.bilibili.com', iconLetter: 'B' },
      { name: 'Hulu', desc: '美剧与综艺流媒体', url: 'https://www.hulu.com', iconLetter: 'H' },
      { name: 'Dailymotion', desc: '国际视频分享平台', url: 'https://www.dailymotion.com', iconLetter: 'D' },
    ],
  },
  {
    title: '音乐播客',
    count: 12,
    sites: [
      { name: 'Spotify', desc: '全球音乐流媒体', url: 'https://open.spotify.com', iconLetter: 'S' },
      { name: 'Apple Music', desc: '苹果音乐服务', url: 'https://music.apple.com', iconLetter: 'A' },
      { name: 'SoundCloud', desc: '独立音乐平台', url: 'https://soundcloud.com', iconLetter: 'S' },
      { name: 'Apple Podcasts', desc: '播客收听平台', url: 'https://podcasts.apple.com', iconLetter: 'A' },
      { name: 'YouTube Music', desc: 'YouTube 音乐服务', url: 'https://music.youtube.com', iconLetter: 'Y' },
      { name: 'Pocket Casts', desc: '热门播客应用', url: 'https://play.pocketcasts.com', iconLetter: 'P' },
      { name: 'Deezer', desc: '国际音乐流媒体', url: 'https://www.deezer.com', iconLetter: 'D' },
      { name: 'Tidal', desc: '高音质音乐平台', url: 'https://tidal.com', iconLetter: 'T' },
      { name: 'Audible', desc: '有声书与音频内容', url: 'https://www.audible.com', iconLetter: 'A' },
      { name: 'Overcast', desc: '播客播放器服务', url: 'https://overcast.fm', iconLetter: 'O' },
      { name: 'Bandcamp', desc: '独立音乐发现与购买', url: 'https://bandcamp.com', iconLetter: 'B' },
      { name: 'TuneIn', desc: '在线电台与播客收听', url: 'https://tunein.com', iconLetter: 'T' },
    ],
  },
  {
    title: '新闻资讯',
    count: 12,
    sites: [
      { name: 'Google News', desc: '全球新闻聚合', url: 'https://news.google.com', iconLetter: 'G' },
      { name: 'BBC', desc: '英国广播公司新闻', url: 'https://www.bbc.com/news', iconLetter: 'B' },
      { name: '纽约时报', desc: 'The New York Times', url: 'https://www.nytimes.com', iconLetter: '纽' },
      { name: '路透社', desc: 'Reuters 全球通讯', url: 'https://www.reuters.com', iconLetter: '路' },
      { name: '华尔街日报', desc: '财经深度报道', url: 'https://www.wsj.com', iconLetter: '华' },
      { name: '卫报', desc: 'The Guardian', url: 'https://www.theguardian.com', iconLetter: '卫' },
      { name: 'Financial Times', desc: '国际财经媒体', url: 'https://www.ft.com', iconLetter: 'F' },
      { name: 'CNN', desc: '全球电视新闻网络', url: 'https://www.cnn.com', iconLetter: 'C' },
      { name: 'Bloomberg', desc: '财经与市场资讯', url: 'https://www.bloomberg.com', iconLetter: 'B' },
      { name: 'Associated Press', desc: '国际通讯社新闻', url: 'https://apnews.com', iconLetter: 'A' },
      { name: 'Hacker News', desc: '科技与创业资讯社区', url: 'https://news.ycombinator.com', iconLetter: 'H' },
      { name: 'Ars Technica', desc: '科技新闻评测与深度报道', url: 'https://arstechnica.com', iconLetter: 'A' },
    ],
  },
  {
    title: '开发者',
    count: 15,
    sites: [
      { name: 'IPSee', desc: 'IP 查询、IPv6 检测与网络诊断', url: 'https://ipsee.com', iconLetter: 'I' },
      { name: 'GitHub', desc: '代码托管平台', url: 'https://github.com', iconLetter: 'G' },
      { name: 'Stack Overflow', desc: '程序员问答社区', url: 'https://stackoverflow.com', iconLetter: 'S' },
      { name: 'npm', desc: 'Node.js 包管理', url: 'https://www.npmjs.com', iconLetter: 'n' },
      { name: 'Vercel', desc: '前端部署平台', url: 'https://vercel.com', iconLetter: 'V' },
      { name: 'CodePen', desc: '在线代码演示', url: 'https://codepen.io', iconLetter: 'C' },
      { name: 'Docker Hub', desc: '容器镜像仓库', url: 'https://hub.docker.com', iconLetter: 'D' },
      { name: 'GitLab', desc: '代码托管与 CI/CD', url: 'https://gitlab.com', iconLetter: 'G' },
      { name: 'MDN Web Docs', desc: '权威 Web 开发文档', url: 'https://developer.mozilla.org', iconLetter: 'M' },
      { name: 'Postman', desc: 'API 调试与协作', url: 'https://www.postman.com', iconLetter: 'P' },
      { name: 'Cloudflare', desc: '网络安全与加速服务', url: 'https://www.cloudflare.com', iconLetter: 'C' },
      { name: 'regex101', desc: '正则表达式测试与调试', url: 'https://regex101.com', iconLetter: 'r' },
      { name: 'Can I use', desc: '浏览器兼容性查询', url: 'https://caniuse.com', iconLetter: 'C' },
      { name: 'DevDocs', desc: '多语言 API 文档查询', url: 'https://devdocs.io', iconLetter: 'D' },
      { name: 'TypeScript', desc: 'TypeScript 文档与在线试验场', url: 'https://www.typescriptlang.org', iconLetter: 'T' },
    ],
  },
  {
    title: '云服务 & 设计',
    count: 16,
    sites: [
      { name: 'Google Drive', desc: '云端存储协作', url: 'https://drive.google.com', iconLetter: 'G' },
      { name: 'Dropbox', desc: '文件云同步', url: 'https://www.dropbox.com', iconLetter: 'D' },
      { name: 'Notion', desc: '全能笔记协作', url: 'https://www.notion.so', iconLetter: 'N' },
      { name: 'Trello', desc: '看板项目管理', url: 'https://trello.com', iconLetter: 'T' },
      { name: 'Figma', desc: '在线设计协作', url: 'https://www.figma.com', iconLetter: 'F' },
      { name: 'Canva', desc: '在线平面设计', url: 'https://www.canva.com', iconLetter: 'C' },
      { name: 'Slack', desc: '团队沟通协作', url: 'https://slack.com', iconLetter: 'S' },
      { name: 'Miro', desc: '在线白板协作', url: 'https://miro.com', iconLetter: 'M' },
      { name: 'Asana', desc: '团队任务管理', url: 'https://asana.com', iconLetter: 'A' },
      { name: 'Adobe Express', desc: '快速在线设计工具', url: 'https://express.adobe.com', iconLetter: 'A' },
      { name: 'DeepL', desc: '文本与文档翻译', url: 'https://www.deepl.com', iconLetter: 'D' },
      { name: 'Photopea', desc: '在线图像编辑与 PSD 处理', url: 'https://www.photopea.com', iconLetter: 'P' },
      { name: 'Squoosh', desc: '浏览器内图片压缩与格式转换', url: 'https://squoosh.app', iconLetter: 'S' },
      { name: 'Excalidraw', desc: '手绘风格白板与流程图', url: 'https://excalidraw.com', iconLetter: 'E' },
      { name: 'Unsplash', desc: '摄影图片与视觉素材', url: 'https://unsplash.com', iconLetter: 'U' },
      { name: 'Pexels', desc: '照片与视频素材', url: 'https://www.pexels.com', iconLetter: 'P' },
    ],
  },
  {
    title: '学习知识',
    count: 14,
    sites: [
      { name: 'Wikipedia', desc: '自由百科全书', url: 'https://www.wikipedia.org', iconLetter: 'W' },
      { name: 'Coursera', desc: '名校在线课程', url: 'https://www.coursera.org', iconLetter: 'C' },
      { name: 'Udemy', desc: '技能学习平台', url: 'https://www.udemy.com', iconLetter: 'U' },
      { name: 'Khan Academy', desc: '免费公益教育', url: 'https://www.khanacademy.org', iconLetter: 'K' },
      { name: 'Medium', desc: '优质博客平台', url: 'https://medium.com', iconLetter: 'M' },
      { name: 'Quora', desc: '全球知识问答', url: 'https://www.quora.com', iconLetter: 'Q' },
      { name: 'edX', desc: '大学在线课程平台', url: 'https://www.edx.org', iconLetter: 'e' },
      { name: 'MIT OpenCourseWare', desc: 'MIT 开放课程', url: 'https://ocw.mit.edu', iconLetter: 'M' },
      { name: 'TED', desc: '全球演讲与思想分享', url: 'https://www.ted.com', iconLetter: 'T' },
      { name: 'Codecademy', desc: '交互式编程学习', url: 'https://www.codecademy.com', iconLetter: 'C' },
      { name: 'freeCodeCamp', desc: '编程课程与项目实践', url: 'https://www.freecodecamp.org', iconLetter: 'f' },
      { name: 'The Odin Project', desc: '全栈 Web 开发学习路线', url: 'https://www.theodinproject.com', iconLetter: 'T' },
      { name: 'Duolingo', desc: '语言学习与日常练习', url: 'https://www.duolingo.com', iconLetter: 'D' },
      { name: 'arXiv', desc: '科研论文与预印本', url: 'https://arxiv.org', iconLetter: 'a' },
    ],
  },
  {
    title: '购物电商',
    count: 10,
    sites: [
      { name: 'Amazon', desc: '全球电商巨头', url: 'https://www.amazon.com', iconLetter: 'A' },
      { name: 'eBay', desc: '全球拍卖购物', url: 'https://www.ebay.com', iconLetter: 'e' },
      { name: 'Etsy', desc: '手工创意市集', url: 'https://www.etsy.com', iconLetter: 'E' },
      { name: 'PayPal', desc: '国际在线支付', url: 'https://www.paypal.com', iconLetter: 'P' },
      { name: 'AliExpress', desc: '跨境电商平台', url: 'https://www.aliexpress.com', iconLetter: 'A' },
      { name: 'Rakuten', desc: '日本综合电商', url: 'https://www.rakuten.co.jp', iconLetter: 'R' },
      { name: 'Temu', desc: '全球低价购物平台', url: 'https://www.temu.com', iconLetter: 'T' },
      { name: 'Best Buy', desc: '消费电子零售', url: 'https://www.bestbuy.com', iconLetter: 'B' },
      { name: 'Newegg', desc: '数码与电脑配件商城', url: 'https://www.newegg.com', iconLetter: 'N' },
      { name: 'Shopify', desc: '独立站与电商建站', url: 'https://www.shopify.com', iconLetter: 'S' },
    ],
  },
  {
    title: 'R18',
    count: 18,
    isR18: true,
    sites: [
      { name: 'Pornhub', desc: '全球最大成人视频网站', url: 'https://www.pornhub.com', iconLetter: 'P' },
      { name: 'OnlyFans', desc: '创作者订阅平台，成人内容丰富', url: 'https://onlyfans.com', iconLetter: 'O' },
      { name: 'XVideos', desc: '免费成人视频网站', url: 'https://www.xvideos.com', iconLetter: 'X' },
      { name: 'XNXX', desc: '热门免费视频站', url: 'https://www.xnxx.com', iconLetter: 'X' },
      { name: 'xHamster', desc: '成人视频与直播平台', url: 'https://xhamster.com', iconLetter: 'x' },
      { name: 'SpankBang', desc: '高清成人视频平台', url: 'https://spankbang.com', iconLetter: 'S' },
      { name: 'MissAV', desc: '亚洲用户常用AV网站', url: 'https://missav.ws', iconLetter: 'M' },
      { name: 'Jable', desc: '热门日本AV资源站', url: 'https://jable.tv', iconLetter: 'J' },
      { name: 'ThisVid', desc: '成人视频社区', url: 'https://thisvid.com', iconLetter: 'T' },
      { name: '91Porn', desc: '中文成人视频网站', url: 'https://91porn.com', iconLetter: '9' },
      { name: 'TokyoMotion', desc: '日本成人视频分享站', url: 'https://www.tokyomotion.net', iconLetter: 'T' },
      { name: 'Hanime', desc: '动漫成人视频网站', url: 'https://hanime.tv', iconLetter: 'H' },
      { name: 'Rule34Video', desc: '二次元成人视频站', url: 'https://rule34video.com', iconLetter: 'R' },
      { name: 'Eporner', desc: '免费高清视频平台', url: 'https://www.eporner.com', iconLetter: 'E' },
      { name: 'Tube8', desc: '经典成人视频网站', url: 'https://www.tube8.com', iconLetter: 'T' },
      { name: 'RedTube', desc: '免费成人视频平台', url: 'https://www.redtube.com', iconLetter: 'R' },
      { name: 'YouPorn', desc: '知名成人视频平台', url: 'https://www.youporn.com', iconLetter: 'Y' },
      { name: 'HQPorner', desc: '超清成人视频资源站', url: 'https://hqporner.com', iconLetter: 'H' },
    ],
  },
];

export const HomePage: React.FC = () => {
  const { apiList, showAdultColumn, customHeroBgImage } = useApp();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [adultVideos, setAdultVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeApiIndex, setActiveApiIndex] = useState(0);

  // R18 Site Navigation Collapsed State
  const [isR18Expanded, setIsR18Expanded] = useState(false);

  const loadData = async () => {
    setLoading(true);
    if (apiList.length === 0) {
      setLoading(false);
      return;
    }

    const currentApi = apiList[activeApiIndex] || apiList[0];
    const res = await fetchVodList(currentApi, { page: 1 });
    setVideos(res.list);

    if (showAdultColumn) {
      const adultApi = apiList.find((a) => a.type === 'adult');
      if (adultApi) {
        const adultRes = await fetchVodList(adultApi, { page: 1 });
        setAdultVideos(adultRes.list);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeApiIndex, showAdultColumn, apiList]);

  const heroStyle: React.CSSProperties = customHeroBgImage
    ? {
        backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.4)), url(${customHeroBgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Intro Banner with Custom Photo Background support */}
      <section
        style={heroStyle}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-fox-600 via-fox-500 to-amber-600 p-8 sm:p-12 text-white shadow-2xl transition-all duration-300"
      >
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>白狐5 极速流媒体引擎</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            高码率低延迟 · 畅享极速影视
          </h1>
          <p className="text-white/80 text-sm sm:text-base">
            内置 20+ 优质源站接口，多码率自适应切换（低至 360P），支持 Cloudflare / Vercel / Docker 多端一键部署。
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-fox-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">源站选择</h2>
          </div>
          <button
            onClick={loadData}
            className="flex items-center space-x-1 text-xs font-medium text-slate-500 hover:text-fox-500 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>刷新接口</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {apiList
            .filter((a) => a.type !== 'adult')
            .map((api, idx) => (
              <button
                key={api.id}
                onClick={() => setActiveApiIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeApiIndex === idx
                    ? 'bg-fox-500 text-white shadow-lg shadow-fox-500/25 scale-105'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {api.name}
              </button>
            ))}
        </div>
      </section>

      {/* 最新推荐视频 (热门影视推荐区) */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2">
          <Film className="w-5 h-5 text-fox-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">最新推荐视频</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 animate-pulse">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-slate-200 dark:bg-slate-800 rounded-2xl aspect-[3/4]" />
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {videos.map((vid) => (
              <VideoCard key={`${vid.source_id}-${vid.vod_id}`} video={vid} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Tv className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">当前源站未返回数据，请尝试上方切换其他接口</p>
          </div>
        )}
      </section>

      {/* 网站查找专区 (直接位于热门影视推荐区下方) */}
      <section className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-fox-500/10 text-fox-500 rounded-2xl">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">网站查找专区</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                涵盖搜索引擎、AI 工具、视频影视、开发者等优质站点，点击卡片一键直达
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {SITE_NAVIGATION_DATA.map((category) => {
            if (category.isR18 && !showAdultColumn) return null;

            if (category.isR18) {
              return (
                <div key={category.title} className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-amber-500 font-bold">
                      <Lock className="w-5 h-5" />
                      <h3>R18 (18+ 仅限成年人访问)</h3>
                      <span className="text-xs px-2 py-0.5 bg-amber-500/10 rounded-full font-mono">{category.count}</span>
                    </div>

                    <button
                      onClick={() => setIsR18Expanded(!isR18Expanded)}
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
                    >
                      {isR18Expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      <span>{isR18Expanded ? '收起 R18' : '展开 R18'}</span>
                    </button>
                  </div>

                  {isR18Expanded && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                      {category.sites.map((site, i) => (
                        <a
                          key={`${site.name}-${i}`}
                          href={site.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-amber-500/5 hover:bg-amber-500/15 border border-amber-500/20 rounded-2xl flex flex-col justify-between group transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs font-mono">
                              {site.iconLetter}
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors truncate">
                              {site.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{site.desc}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={category.title} className="space-y-3">
                <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
                  <span className="w-1.5 h-4 bg-fox-500 rounded-full"></span>
                  <h3>{category.title}</h3>
                  <span className="text-xs font-mono text-slate-400 font-normal">({category.count})</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {category.sites.map((site, i) => (
                    <a
                      key={`${site.name}-${i}`}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-fox-500 hover:text-white border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between group transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-7 h-7 rounded-xl bg-fox-100 dark:bg-fox-950 text-fox-500 group-hover:bg-white/20 group-hover:text-white flex items-center justify-center font-bold text-xs font-mono transition-colors">
                          {site.iconLetter}
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-white transition-colors truncate">
                          {site.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 group-hover:text-white/80 truncate mt-0.5">
                          {site.desc}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {showAdultColumn && (
        <section className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-amber-500">成人影片专区</h2>
          </div>

          {adultVideos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {adultVideos.map((vid) => (
                <VideoCard key={`adult-${vid.source_id}-${vid.vod_id}`} video={vid} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">已开启成人专区，正在加载专属接口内容...</p>
          )}
        </section>
      )}
    </div>
  );
};
