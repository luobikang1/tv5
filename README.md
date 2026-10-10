# 白狐5 (WhiteFox TV5) 极速影视聚合与多端云服务平台

![WhiteFox TV5 Banner](https://img.shields.io/badge/%E7%99%BD%E7%8B%905-WhiteFox%20TV5-orange?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-blue.style=for-the-badge)
![Cloudflare Pages](https://img.shields.io/badge/Deployment-Cloudflare%20Pages%20%7C%20Vercel%20%7C%20Docker-success?style=for-the-badge)

**白狐5** 是一款基于 Vite + React + TypeScript + Tailwind CSS 构建的极简高画质影视聚合与多端云服务平台。功能与月亮TV基本一致，面板名称为**白狐5**。支持 20+ 互联网 CMS 源站接口直连与边缘代理防护、HLS.js 预加载缓存、多码率自适应切换（默认 360P / 可低至 360P / 480P / 720P / 1080P）、Cloudflare R2 对象存储全量可视化管理、Cloudflare D1 数据库实时同步（新数据覆盖老数据）、全站聚合搜索、暗黑/白天模式切换、视频下载与播放、省流海报防护、成人视频专栏及互联网成人 API 自动配置等功能。

---

## 📦 主要依赖 (Key Dependencies)

```text
┌────────────────────────────────────────────────────────────────────────┐
│  主要依赖清单                                                           │
├───────────────────────┬─────────────────┬──────────────────────────────┤
│ 依赖名称 (Package)     │ 版本 (Version)   │ 功能说明 (Description)       │
├───────────────────────┼─────────────────┼──────────────────────────────┤
│ hls.js                │ ^1.5.8          │ HLS 视频流切片解析与多码率播放  │
│ react                 │ ^18.2.0         │ 响应式 UI 核心框架           │
│ react-dom             │ ^18.2.0         │ React DOM 渲染引擎           │
│ react-router-dom      │ ^6.22.3         │ 单页应用 SPA 路由管理        │
│ lucide-react          │ ^0.344.0        │ 高清图标组件库               │
│ tailwindcss           │ ^3.4.1          │ 响应式 CSS 样式库            │
└───────────────────────┴─────────────────┴──────────────────────────────┘
```

---

## 🔑 核心环境变量 (Key Environment Variables)

```text
┌────────────────────────────────────────────────────────────────────────┐
│  环境变量配置 (Boxed Environment Variables)                             │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ 变量名 (Variable)  │ 默认值 (Default)   │ 说明 (Description)             │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ PASSWORD          │ whitefox5         │ 站点访问独立安全密码            │
│ VITE_PASSWORD     │ whitefox5         │ 构建时注入的前端初始解密密码    │
│ CF_D1_BINDING     │ DB                │ Cloudflare D1 数据库绑定名称   │
│ R2_BUCKET         │ R2_BUCKET         │ Cloudflare R2 对象存储绑定名称 │
│ PORT              │ 3000              │ Docker / Node 服务监听端口     │
│ NODE_ENV          │ production        │ 运行环境标识                    │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

---

## ⚡ 三大防卡顿技术 (Anti-Lag Video Streaming Technologies)

为了解决由于源站响应缓慢、跨网传输延迟造成的播放卡顿问题，**白狐5** 整合了以下三种关键播放优化技术：

1. **Nginx 代理缓存 (Nginx Proxy Caching)**：
   - 部署于自建 VPS 或 Nginx 节点时，自动拦截 M3U8 切片与 `.ts` 视频文件。
   - `proxy_cache VIDEO_CACHE` 缓存命中后直接由 Nginx 节点高带宽响应，彻底隔离源站响应慢的问题。

2. **预加载 + 预连接 (Preload & Preconnect)**：
   - 页面初始化时自动对常用 CMS 视频域名（如 `bfzyapi.com`、`ikunzyapi.com` 等）建立 TCP/TLS 预连接（`preconnect` 与 `dns-prefetch`）。
   - 播放器开启“CDN 边缘加速”模式后，暂停状态自动后台预加载高达 180 秒视频缓存，实现即点即播不卡顿。

3. **多码率自适应 (Multi-Bitrate Adaptive Streaming down to 360P)**：
   - 支持自动检测并实时解析 HLS Master Playlist 的不同码率切片。
   - 默认采用 **360P 极速省流** 分辨率，弱网环境下亦可稳定秒播；用户可自由在 360P / 480P / 720P / 1080P 及自适应码率间无缝切换。

---

## 🚀 部署指南 (支持全平台一键部署与拉取/上传)

### 1. ☁️ Cloudflare Pages 部署 (推荐，支持 D1 与 R2)

支持直接拉取 GitHub 仓库部署或上传打包构建产物 `dist` 目录部署。

#### 方式 A：拉取部署 (Git Connect)
1. Fork 本仓库至您的 GitHub / GitLab 账号。
2. 登录 Cloudflare Dashboard -> **Workers and Pages** -> **Create application** -> **Pages** -> **Connect to Git**。
3. 构建参数配置：
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. 环境变量设置（可选）：
   - `PASSWORD`: 设置独立访问密码（默认：`whitefox5`）
5. D1 数据库与 R2 绑定：
   - 在 Pages 项目设置中进入 **Settings** -> **Functions** -> **D1 Database Bindings**，添加绑定名称 `DB`。
   - 在 **R2 Bucket Bindings** 添加绑定名称 `R2_BUCKET`。

#### 方式 B：上传部署 (Direct Upload)
1. 本地运行 `npm run build` 生成 `dist` 文件夹。
2. 在 Cloudflare Pages 中选择 **Upload Assets**，将 `dist` 文件夹打包上传即可完成部署。

> **⚠️ 注意事项 (Precautions)**：
> - 本项目在 `public/_redirects` 中内置了 `/* /index.html 200` 路由重定向规则，确保单页应用 SPA 在 Cloudflare Pages 刷新时不报 404 错误。
> - 在 `functions/api/proxy.ts` 中集成了 Worker 代理，完美解决跨域 CORS 与 HTTP 视频流加载卡顿问题。

---

### 2. 📐 Vercel 一键部署 (1-Click Vercel Deployment)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

1. 点击上方部署按钮或在 Vercel 中导入 GitHub 仓库。
2. Vercel 将自动读取根目录下的 `vercel.json` 配置文件。
3. 构建参数：
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. 添加环境变量：
   - `PASSWORD`: `whitefox5`
5. 点击 **Deploy** 即可在一分钟内完成全球 CDN 部署。

---

### 3. 🐳 Docker & Docker Compose 部署 (VPS / 服务器)

```bash
# 1. 克隆代码库
git clone https://github.com/your-username/whitefox5.git
cd whitefox5

# 2. 一键启动 Docker Compose 容器服务
docker-compose up -d --build
```
服务启动后访问 `http://<您的服务器IP>:8080` 即可使用（内置 Nginx 代理缓存与 gzip 压缩）。

---

### 4. ☁️ 腾讯云与阿里云部署

- **腾讯云 Webify / EdgeOne**：导入仓库，构建命令填 `npm run build`，发布目录填 `dist`，配置路由 Rewrite `/*` -> `/index.html`。
- **阿里云 OSS / ESA / ECS**：上传 `dist/` 静态文件，将 404 页面重定向至 `index.html`。传统 ECS 部署可直接配合 Nginx 反向代理与缓存。

---

### 5. 🌐 Netlify / Zeabur / Render 一键部署

- **Netlify**: 项目自带 `netlify.toml`，自动配置 SPA 路由重定向。
- **Zeabur / Render**: 导入 Git 仓库，选择 Static Environment，构建命令 `npm run build`，发布路径 `dist`。

---

## 🛠️ 本地开发与环境配置

```bash
# 1. 克隆代码库
git clone https://github.com/your-username/whitefox5.git
cd whitefox5

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 编译打包生成部署产物
npm run build
```

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 协议开源。
