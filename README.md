# 白狐5 (WhiteFox TV5) 极速影视聚合与多端云服务平台

![WhiteFox TV5 Banner](https://img.shields.io/badge/%E7%99%BD%E7%8B%905-WhiteFox%20TV5-orange?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-blue.style=for-the-badge)
![Cloudflare Pages](https://img.shields.io/badge/Deployment-Cloudflare%20Pages%20%7C%20Vercel%20%7C%20Docker-success?style=for-the-badge)

**白狐5** 是一款基于 Vite + React + TypeScript + Tailwind CSS 构建的极简高画质影视聚合与多端云服务平台（功能媲美月亮TV）。支持 20+ 互联网 CMS 源站接口直连与边缘代理防护、HLS.js 预加载缓存、多码率自适应切换（低至 360P / 720P / 1080P，默认 360P）、Cloudflare D1 数据库实时同步（新数据覆盖老数据）、成人影片专栏自动配置、随身云笔记本 (支持导出 TXT) 以及全员互动留言区 (支持图片与回复引用)。

---

## 📦 主要依赖 (Key Dependencies)

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 核心依赖库 (Core Dependencies)                                          │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ 依赖包            │ 版本号            │ 用途说明                       │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ react / react-dom │ ^18.2.0           │ 前端 UI 视图响应式框架         │
│ react-router-dom  │ ^6.22.3           │ SPA 单页路由路由导航机制       │
│ hls.js            │ ^1.5.8            │ M3U8 流媒体自适应与切片解析    │
│ lucide-react      │ ^0.344.0          │ 高清矢量 UI 图标库             │
│ tailwindcss       │ ^3.4.1            │ 响应式 CSS 样式与夜间模式处理  │
│ vite              │ ^5.1.4            │ 极速构建与开发服务器           │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

---

## ⚡ 关键环境变量 (Environment Variables)

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 关键环境变量配置框 (Environment Variables Box)                         │
├─────────────────┬───────────────────┬──────────────────────────────────┤
│ 变量名称        │ 默认值 / 示例     │ 功能与作用说明                   │
├─────────────────┼───────────────────┼──────────────────────────────────┤
│ PASSWORD        │ whitefox5         │ 全站独立访问安全密码 (30天持久)  │
│ VITE_PASSWORD   │ whitefox5         │ 前端构建期预设全局初始解锁密码   │
│ CF_D1_BINDING   │ DB                │ Cloudflare Pages D1 数据库绑定名 │
│ R2_BUCKET       │ R2_BUCKET         │ Cloudflare R2 对象存储绑定名     │
│ PORT            │ 3000              │ Docker 及 Node 本地部署监听端口  │
└─────────────────┴───────────────────┴──────────────────────────────────┘
```

---

## 🚀 部署指南 (支持拉取部署与上传部署)

本项目支持 **拉取部署**（Git 绑定自动构建）与 **上传部署**（直接上传 `dist` 打包文件）。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

### 1. ☁️ Cloudflare Pages 部署 (支持 Git 拉取与 ZIP 直接上传)

#### 方式 A：Git 关联拉取部署 (推荐)
1. Fork 本仓库至您的 GitHub 账号。
2. 登录 Cloudflare 控制台 -> **Workers 和 Pages** -> **创建应用程序** -> **Pages** -> **连接到 Git**。
3. 构建配置参数：
   - **框架预设 (Framework preset)**: `Vite`
   - **构建命令 (Build command)**: `npm run build`
   - **输出目录 (Build output directory)**: `dist`
4. 环境变量（可选）：添加 `PASSWORD`。
5. 绑定 D1 数据库与 R2 存储（在 Pages **设置 -> 函数 -> D1 数据库绑定** 中添加 `DB` 绑定）。

#### 方式 B：打包文件直接上传部署 (直接上到 CF Pages)
1. 在本地运行命令打包编译静态文件：
   ```bash
   npm install && npm run build
   ```
2. 登录 Cloudflare Pages -> 选择 **上传资产 (Upload assets)**。
3. 将编译好的 `dist` 文件夹上传，Cloudflare Pages 将直接完成全站部署！
4. 本项目内置 `public/_redirects` (`/* /index.html 200`) 与 `public/_routes.json`，确保 Cloudflare Pages 刷新路由不抛 404，具备强大的兼容性。

---

### 2. 📐 Vercel 一键部署

1. 点击上方 **Deploy with Vercel** 按钮或导入 GitHub 仓库。
2. Vercel 将自动识别根目录的 `vercel.json` 配置文件。
3. 构建命令设为 `npm run build`，输出目录设为 `dist`。
4. 添加环境变量 `PASSWORD` 即可完成部署。

---

### 3. 🐳 Docker & Docker Compose 部署 (VPS / 服务器)

```bash
# 克隆仓库 (拉取部署)
git clone https://github.com/your-username/whitefox5.git
cd whitefox5

# 使用 Docker Compose 一键启动
docker-compose up -d --build
```
服务启动后通过 `http://<您的服务器IP>:3000` 即可访问。

---

### 4. 🌐 腾讯云 / 阿里云 / Netlify / Zeabur / Render 部署

- **Netlify**: 自带 `netlify.toml`，导入仓库点击部署即可。
- **腾讯云 EdgeOne / 阿里云 ESA**: 将 `dist` 文件夹直接上传至 OSS / 静态托管，配置 404 重定向至 `index.html`。
- **Nginx 传统服务器部署**：参考项目自带的 `nginx.conf` 配置代理反向解析与缓存。

---

## 🛠️ 三大流畅看片技术 (解决源站卡顿)

1. **Nginx 代理缓存 (Proxy Caching)**：
   - 通过本地/边缘反向代理缓存 M3U8 切片与 MP4 片段，降低源站响应延迟。
2. **预加载 + 预连接 (Preload & Preconnect)**：
   - 网页预连接常见 CMS 边缘节点（`<link rel="preconnect">`），播放器内置 **180 秒预加载缓存 Switch**，暂停时自动充能缓存。
3. **多码率自适应切换 (Adaptive Bitrate Down to 360P)**：
   - 支持 360P、480P、720P、1080P 自适应降级与手动切换，默认 360P 极速省流模式，弱网环境下流畅看片不卡顿。

---

## 🌟 核心功能一览

- 🔒 **安全密码保护**：需输入独立密码方可使用，支持 30 天持久免登录 session。
- 🌓 **白天 / 夜间模式**：一键无缝切换亮色与暗色模式。
- 🔄 **恢复默认设置**：设置面板提供一键重置功能。
- 📜 **历史记录 & 删除功能**：保存多达 350+ 条播放历史，支持精准断点续播与单条/批量一键删除。
- 🔎 **全站集合聚合搜索**：支持并发抓取 20+ 内置接口，按电影、电视剧、港剧、台剧、动漫分类过滤。
- 🖼️ **省流海报图**：内置 SVG 矢量占位图与 HTTP/HTTPS 代理，解决海报图失效或跨域无法显示问题。
- ⬇️ **播放页下载与下载页播放**：播放页提供一键复制解析直链与下载选项，下载页同样支持 M3U8 在线播放预览。
- 🏠 **返回主界面按键**：播放页与解析页均带有直达主页的快速导航按钮。
- ⏭️ **上下集切换功能**：播放页提供“上一集”与“下一集”便捷按键。
- 🔞 **成人影片专栏**：可自由开启/关闭成人专区，自动配置互联网成人影片 API。

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 协议开源。
