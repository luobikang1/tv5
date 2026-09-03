# 🦊 白狐5 (WhiteFox 5) - 极速影视聚合平台

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

白狐5 是一款轻量、极速、高颜值的全网影视聚合播放平台。采用 **React 18 + Vite + TypeScript + Tailwind CSS** 开发，具备全网 20+ 优质源站接口聚合、低至 360P 多码率自适应切片播放、Cloudflare D1 数据库同步、流量访问密码保护与全平台一键部署能力。

---

## 🌟 核心特性与功能

- 🔒 **面板独立访问密码与账号保护**：
  - 访问必须输入**全局独立访问密码**或**账号登录**解锁，彻底解决云平台部署后遭未授权人员刷量消耗流量的问题。
  - 支持一键快捷锁定面板与注销登录。
- ⚡ **解决源站响应慢与播放卡顿三大技术**：
  1. **Nginx 代理缓存 / Cloudflare Worker / Vercel 代理**：有效解除 CORS 跨域限制与源站慢响应卡顿。
  2. **预加载 (Preload) + 预连接 (Preconnect)**：在 HTML Head 中插入 `preconnect` 与 `dns-prefetch`，提前解析并建立源站 TCP/TLS 握手。
  3. **多码率自适应切换 (默认 360P)**：默认采用 360P 超流畅清晰度， weak-network 弱网环境下自动选择最佳切片，秒播无卡顿。
- 🌐 **全站集合搜索与二十条内置 API**：
  - 默认自动配置 **20 条** 互联网优质 CMS 视频接口，并发搜索全网影片。
  - 支持在【系统设置】中自由自定义添加与删除 API，或一键恢复默认接口。
  - **成人视频专栏**：主页与设置中支持一键开启成人视频专栏，自动配置互联网成人影片 API。
- 🎨 **白天 / 夜间主题模式**：一键无缝切换深色 (Dark) 与浅色 (Light) 主题 UI。
- 🕒 **播放历史记录与删除**：自动记录播放位置与剧集，支持单条记录删除及一键清空历史。
- ⏬ **播放页下载选项与下载页播放**：播放页提供集数直链一键复制与下载中心，下载页可粘贴 M3U8/MP4 在线测试与预览播放。
- 🎬 **播放界面增强**：支持上下集一键切换、一键返回主界面按键。
- 🖼️ **省流海报图与防盗链解决**：使用轻量 SVG 占位图与图片代理 routing，彻底解决海报加载失败或图片破损。
- ⚙️ **恢复默认设置**：支持一键恢复出厂设置，快速清空本地配置与历史。
- ☁️ **Cloudflare D1 数据库同步**：支持一键开启 D1 数据库同步，跨终端实时同步用户注册登录、播放记录与个性化配置。

---

## 🔑 核心环境变量

> ⚠️ **注意事项**：在云平台（Vercel / Cloudflare Pages / Docker）环境变量面板中设置以下关键变量：

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 环境变量名称          │ 示例值 / 说明                                  │
├────────────────────────────────────────────────────────────────────────┤
│ PASSWORD              │ admin123 (系统全局访问密码，留空则不设限制)    │
├────────────────────────────────────────────────────────────────────────┤
│ CF_D1_BINDING         │ DB (Cloudflare Pages 绑定的 D1 数据库名称)    │
├────────────────────────────────────────────────────────────────────────┤
│ PORT                  │ 8080 (Docker / Node 运行监听端口，默认 8080)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 主要依赖库

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 主要依赖库            │ 版本      │ 作用                               │
├────────────────────────────────────────────────────────────────────────┤
│ react                 │ ^18.2.0   │ UI 视图核心框架                    │
│ hls.js                │ ^1.5.8    │ HLS 视频流自适应解析与播放          │
│ tailwindcss           │ ^3.4.1    │ 响应式 UI 样式库                  │
│ react-router-dom      │ ^6.22.3   │ 单页应用路由管理                  │
│ lucide-react          │ ^0.344.0  │ 高质感矢量图标库                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 部署指南 (支持多种平台)

### 1. Cloudflare Pages 部署 (推荐，零成本)

Cloudflare Pages 提供极致的全球 CDN 加速与 Functions 服务，提供以下两种部署方式：

#### 方式 A：拉取部署 (Git 关联自动部署)
1. 将本项目代码 Fork 或 Push 到你的 **GitHub** 仓库。
2. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/) -> **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**。
3. 选择 `whitefox5` 仓库，设置构建参数：
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. 点击 **Save and Deploy** 即可完成部署！

#### 方式 B：上传部署 (直接上传构建文件)
1. 本地执行构建生成静态文件：
   ```bash
   npm run build
   ```
2. 在 Cloudflare Dashboard 中选择 **Workers & Pages** -> **Create application** -> **Pages** -> **Upload assets**。
3. 输入项目名称（如 `whitefox5`），直接将本地打包好的 `dist` 文件夹或压缩包拖拽上传即可完成部署！

#### 配置 Cloudflare D1 数据库同步 (可选)：
1. 在 Cloudflare Dashboard -> **D1 Database** -> 创建名为 `whitefox5-db` 的数据库。
2. 在 Pages 项目设置 -> **Functions** -> **D1 database bindings** -> 添加绑定：
   - **Variable name**: `DB`
   - **D1 Database**: 选择 `whitefox5-db`

---

### 2. Vercel 一键部署

点击下方按钮一键克隆并部署到 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

手动步骤：
1. 在 Vercel 导入 GitHub 仓库。
2. **Framework Preset**: Vite
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. （可选）在 Environment Variables 中添加 `PASSWORD` 环境变量。
6. 点击 **Deploy**，系统路由及 `/api/proxy` 函数将自动生效。

---

### 3. Docker / Docker-Compose 部署

本项目内置支持 **Nginx 代理缓存 (Anti-Lag)** 的 Dockerfile 及 docker-compose 配置文件。

```bash
# 1. 克隆源码并进入目录
git clone https://github.com/your-username/whitefox5.git
cd whitefox5

# 2. 一键启动 Docker 容器
docker-compose up -d --build
```

启动完成后，打开浏览器访问 `http://你的服务器IP:8080` 即可使用。

---

## ⚙️ 恢复默认设置与常见问题

- **界面打不开 / 提示输入密码**：初始若设置了环境变量 `PASSWORD`，请输入对应的访问密码。也可在【系统设置】中随时更改或清除密码。
- **播放卡顿**：可在播放器右下角点击【启用极速代理】按钮，或在【系统设置】中将默认画质调至 `360P`。
- **海报图片不显示**：平台已内置防盗链与 SVG 省流占位图，遇到源站屏蔽将自动切至高效占位符。
- **恢复出厂配置**：进入【系统设置】-> 点击【恢复默认设置】按钮，即可清空所有本地缓存、还原 20 条默认 API 并重置选项。
