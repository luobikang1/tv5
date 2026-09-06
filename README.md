# 🦊 白狐5 (WhiteFox 5) - 极速影视聚合平台

白狐5 是一款轻量、极速、高颜值的全网影视聚合播放平台。采用 **React 18 + Vite + TypeScript + Tailwind CSS** 开发，专为流畅看片与极速响应打造。

---

## 🌟 核心功能与亮点

- 🔒 **全局独立访问密码与账号保护**：
  - 支持**全局访问密码锁**、**账号注册与登录**。
  - 能够有效防止未授权刷量，保障个人云部署资源与流量安全。
- ⚡ **解决播放卡顿的三大核心技术**：
  1. **Nginx 代理缓存 / Worker 代理**：服务器与 Cloudflare Worker 代理反查，解除 CORS 跨域限制与源站慢响应。
  2. **预加载 + 预连接 (Preload & Preconnect)**：在 `index.html` 中提前建立对多源站域名的 DNS 解析与 TCP/TLS 连接。
  3. **多码率自适应 (低至 360P)**：默认采用 360P 流畅画质，在弱网环境或源站卡顿时自动自适应降码率，秒播无卡顿。
- 🌐 **自动配置 20+ 互联网可用 API & 成人专区**：
  - 默认加载 20 条优质 CMS 接口，支持全站聚合搜索。
  - 设置中支持一键开启**成人视频专区**，自动加载互联网成人影片 API。
- 🎨 **白天/夜间模式切换**：一键无缝切换日间/夜间深色主题。
- 🕒 **播放历史管理**：自动存储观看进度，支持单条记录删除及一键清空所有历史。
- ⏬ **下载中心与内嵌播放**：播放页提供下载选项与集数直链复制，下载页支持直接粘贴 M3U8/MP4 链接在线测试与预览播放。
- ☁️ **Cloudflare D1 数据库实时同步**：支持调用 D1 数据库，实现多端用户注册登录及历史记录数据同步。
- 🖼️ **省流海报图与防盗链解决**：采用 SVG 高清省流占位图与 `onError` 自动回退机制，彻底解决海报破损与加载慢的问题。

---

## 🔑 核心环境变量 (Key Environment Variables)

> **部署注意事项**：在对应的云平台面板中将关键环境变量进行如下配置：

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 环境变量名称          │ 示例值 / 说明                                  │
├────────────────────────────────────────────────────────────────────────┤
│ VITE_PASSWORD         │ admin123 (系统全局访问密码，留空为不设限)      │
├────────────────────────────────────────────────────────────────────────┤
│ CF_D1_BINDING         │ DB (Cloudflare Pages 绑定的 D1 数据库名称)    │
├────────────────────────────────────────────────────────────────────────┤
│ PORT                  │ 8080 (Docker / Node 运行监听端口，默认 8080)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 主要依赖 (Main Dependencies)

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 主要依赖库            │ 版本      │ 作用                               │
├────────────────────────────────────────────────────────────────────────┤
│ react                 │ ^18.2.0   │ 核心前端 UI 框架                   │
│ hls.js                │ ^1.5.8    │ HLS 视频流自适应解析与播放          │
│ tailwindcss           │ ^3.4.1    │ 响应式 UI 样式库                  │
│ react-router-dom      │ ^6.22.3   │ 单页应用 (SPA) 路由管理            │
│ lucide-react          │ ^0.344.0  │ 矢量图标库                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 部署指南 (简单易懂)

本项目提供完整的部署配置文件（含 `public/_redirects`、`public/_routes.json`、`functions/`、`vercel.json`、`Dockerfile` 及 `docker-compose.yml`），确保各种方式均能 100% 成功部署。

### 1. Cloudflare Pages 部署 (推荐，免费极速)

#### 方式 A：GitHub 拉取部署（自动持续集成）
1. 将本项目 Fork 或 Push 到你的 **GitHub** 仓库。
2. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/) -> 进入 **Workers & Pages** -> 点击 **Create application** -> **Pages** -> **Connect to Git**。
3. 选择 `whitefox5` 仓库，设置构建参数：
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. 点击 **Save and Deploy** 即可完成部署！

#### 方式 B：直接上传部署（无需 GitHub）
1. 本地运行 `npm run build` 生成 `dist` 静态资源目录。
2. 打开 Cloudflare Dashboard -> **Workers & Pages** -> **Create application** -> **Pages** -> **Upload assets**。
3. 将 `dist` 文件夹打包或直接拖拽上传即可。
4. 本项目已内置 `public/_redirects`，完全解决 Cloudflare Pages 部署后直接访问子路由 404 的问题。

> **可选功能：绑定 Cloudflare D1 数据库同步**
> 在 Pages 项目设置 -> **Functions** -> **D1 database bindings** -> 添加绑定，变量名设为 `DB`，指向你的 D1 数据库即可开启云端数据同步与注册登录。

---

### 2. Vercel 一键部署

#### 方式 A：一键导入部署
1. 登录 [Vercel Dashboard](https://vercel.com/) -> 点击 **Add New...** -> **Project** -> 导入 GitHub 仓库。
2. Framework Preset 选择 **Vite**。
3. Build Command: `npm run build` | Output Directory: `dist`
4. 点击 **Deploy** 即可一键完成。

#### 方式 B：Vercel CLI 上传部署
1. 本地安装 Vercel CLI：`npm i -g vercel`
2. 在项目根目录下执行 `vercel`，按提示直接上传发布。
3. 本项目已包含 `vercel.json` 规则，页面路由与反向代理 API 将自动配置。

---

### 3. Docker & Docker-Compose 部署

本项目已内置配合 **Nginx 代理缓存 (Anti-Lag)** 的 `Dockerfile` 与 `docker-compose.yml`。

```bash
# 拉取源码并一键启动容器
docker-compose up -d --build
```
启动后访问 `http://服务器IP:8080` 即可流畅看片。

---

## ⚙️ 常见问题与恢复默认

- **界面锁定/解锁**：若设置了访问密码，可点击导航栏右侧锁图标锁定，或在设置页面修改/取消密码。
- **重置与恢复出厂设置**：进入【系统设置】 -> 点击【恢复默认设置】，可一键清空本地缓存、恢复 20 条默认 API 接口并重置清晰度选项。
