# 🦊 白狐5 (WhiteFox 5) - 极速影视聚合平台

白狐5 是一款轻量、极速、高颜值的全网影视聚合播放平台。采用 React 18 + Vite + TypeScript + Tailwind CSS 开发，专为流畅看片与极速响应打造。

---

## 🌟 核心特性

- 🔒 **密码保护与独立面板**：
  - 支持**全局访问密码登录**，有效防止未授权刷量与云平台流量消耗。
  - 提供**一键退出登录**与面板锁定功能。
- ⚡ **解决卡顿与缓冲的三大核心技术**：
  1. **Nginx 代理缓存 / Cloudflare Worker 代理**：支持服务器端与 Worker 代理反查，解除跨域限制（CORS）与源站响应慢问题。
  2. **预加载 + 预连接**：在 HTML/HLS 标签加入 `preconnect` 及 `dns-prefetch`，提前建立源站 DNS 与 TCP 连接。
  3. **多码率自适应切换 (低至 360P)**：内置低至 360P 流畅码率选项，系统默认 360P，弱网环境自动切至低码率，实现秒播无卡顿。
- 🌐 **二十条互联网可用 API + 成人视频专栏**：默认自动配置 20 条优质 CMS 接口，支持全站集合搜索，且支持在设置中自动加载互联网成人影片 API 专栏。
- 🎨 **白天/夜间模式切换与恢复默认设置**：支持一键切换深色/浅色主题，支持一键恢复出厂默认配置。
- 🕒 **播放历史与清除功能**：自动记录播放进度，支持单条记录删除及一键清空历史。
- ⏬ **下载与内嵌播放**：播放页提供集数直链复制与下载页功能，下载页可直接粘贴 M3U8/MP4 在线测试与预览播放。
- ☁️ **Cloudflare D1 数据库同步**：支持调用 Cloudflare D1 数据库实时同步用户设置与观看历史。
- 🖼️ **省流海报图与防盗链解决**：采用 SVG 高清省流占位图与图片代理 routing，彻底解决海报加载失败或破损问题。

---

## 🔑 核心环境变量

> **注意事项**：部署时请在对应的云平台面板中将关键环境变量进行如下设置：

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 环境变量名称          │ 示例值 / 说明                                  │
├────────────────────────────────────────────────────────────────────────┤
│ PASSWORD              │ admin123 (系统全局访问密码，留空为不设限)      │
├────────────────────────────────────────────────────────────────────────┤
│ CF_D1_BINDING         │ DB (Cloudflare Pages 绑定的 D1 数据库名称)    │
├────────────────────────────────────────────────────────────────────────┤
│ PORT                  │ 8080 (Docker / Node 运行监听端口)              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 部署指南 (支持拉取部署与上传部署)

### 1. Cloudflare Pages 部署 (推荐，零成本 & 强兼容)

本项目针对 Cloudflare Pages 提供了完整的兼容配置文件（包含 `_redirects`、`_routes.json` 以及 `functions/api/proxy.ts`），完美解决 SPA 路由 404 与 CORS 跨域问题。

#### 方案 A：拉取部署 (GitHub 自动关联)
1. Fork 或 Clone 本项目到你的 **GitHub** 仓库。
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) -> 点击 **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**。
3. 选择 `whitefox5` 仓库，配置构建参数：
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. 点击 **Save and Deploy** 即可完成部署！

#### 方案 B：上传部署 (直接上传预编译 dist)
1. 本地运行 `npm install && npm run build` 生成 `dist` 文件夹。
2. 登录 Cloudflare Dashboard -> **Workers & Pages** -> **Create application** -> **Pages** -> 选择 **Upload assets**。
3. 将 `dist` 文件夹拖拽上传，点击部署即可。

---

### 2. Vercel 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fwhitefox5%2Fwhitefox5)

1. 点击上方按钮或在 Vercel 中导入 GitHub 仓库。
2. 配置参数：
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. 环境变量可选填 `PASSWORD`。
4. 本项目已内置 `vercel.json` 规则，系统路由与 `/api/proxy` 函数将自动生效。

---

### 3. Docker & Docker-Compose 部署

本项目已提供支持 **Nginx 代理缓存 (Anti-Lag)** 的 Dockerfile 及 docker-compose 配置文件。

#### 方式 1：使用 Docker Compose 启动（推荐）
```bash
docker-compose up -d --build
```

#### 方式 2：使用 Docker 原生命令构建并启动
```bash
docker build -t whitefox5 .
docker run -d -p 8080:80 --name whitefox5_app whitefox5
```
启动后访问 `http://你的服务器IP:8080` 即可。

---

## 🛠️ 主要依赖

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

## ⚙️ 恢复默认设置与退出登录

- 点击右上角或设置页面中的 **【退出登录】** 按钮即可登出当前账号。
- 如需重置配置，可进入【系统设置】-> 点击【恢复默认设置】按钮，系统将自动重置 API 接口列表、删除本地历史并还原出厂配置。
