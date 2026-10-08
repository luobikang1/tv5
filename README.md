# 白狐5 (WhiteFox TV5) 极速影视聚合与多端云服务平台

![WhiteFox TV5 Banner](https://img.shields.io/badge/%E7%99%BD%E7%8B%905-WhiteFox%20TV5-orange?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-blue.style=for-the-badge)
![Cloudflare Pages](https://img.shields.io/badge/Deployment-Cloudflare%20Pages%20%7C%20Vercel%20%7C%20Docker-success?style=for-the-badge)

**白狐5** 是一款基于 Vite + React + TypeScript + Tailwind CSS 构建的极简高画质影视聚合与多端云服务平台。支持 20+ 互联网 CMS 源站接口直连与边缘代理防护、HLS.js 预加载缓存、多码率自适应切换（包含 360P / 720P / 1080P）、Cloudflare R2 对象存储全量可视化管理、Cloudflare D1 数据库实时同步（新数据覆盖老数据）、随身云笔记本 (支持导出 TXT) 以及全员互动留言区 (支持图片与回复引用)。

---

## 🌟 核心特色与功能亮点

### 1. 🎬 极速流媒体播放与多码率切换
- **HLS.js 边缘切片解析**：支持 M3U8 视频流解析与防卡顿优化（`maxBufferHole` / `nudgeMaxRetry` / `maxStarvationDelay`）。
- **预加载缓存 switch**：开启后 paused 状态自动预加载 180 秒（3 分钟）视频缓存，流畅不卡顿。
- **自适应码率切换**：实时解析并显示当前比特率，支持 360P / 720P / 1080P 自适应切换。
- **画幅与亮度/音量调节**：支持 9:16 竖屏与非标准视频画幅缩放适配，提供手势/滑块调节。

### 2. ☁️ Cloudflare R2 云盘全量可视化管理
- **文件分类文件夹管理**：内置【🎬 视频】、【🎵 音乐】、【🖼️ 图片】、【📄 文档】与【📦 其他】分类文件夹，支持选择目标文件夹上传与跨文件夹批量/单项移动。
- **批量文件上传与下载**：支持多文件同时选择并批量上传，实时显示总体百分比进度条。
- **删除确认保护**：单文件与批量删除增加确认提问，防止误操作。
- **批量取消选择**：批量管理工具栏内置“一键取消选择”按钮。
- **全量可视化与 D1 实时同步**：一键同步 R2 云盘，使用**新数据覆盖老数据**策略保证多端数据一致。

### 3. 📝 随身云笔记本与留言区互动
- **随身云笔记本**：记录观影清单或个人备忘，支持按分类检索，并可以**一键导出下载为 UTF-8 `.txt` 文本文件**。
- **全员留言交流区**：全员实时留言，支持图文发布、**针对特定留言一键引用回复**，管理员支持独立清理图片以节省云端存储空间。

### 4. 🎨 系统设置与全局自定义
- **折叠选项与状态持久化**：所有设置模块默认折叠，展开后状态存储于 `localStorage`，刷新页面不收起。
- **主题调色与全局背景**：提供预设主题调色按键（经典蓝绿、白狐橙红、深邃极夜等），支持上传全站背景图片及**首页介绍区全图无裁剪展示**模式。
- **中英双语切换**：提供 `zh` (简体中文) 与 `en` (English) 切换。
- **安全密码与持久会话**：支持设置独立访问密码，一次解锁即可保持 **30 天持久免登录**。

---

## 🚀 部署指南 (支持全平台一键部署)

本项目原生支持多种云平台及自建服务器部署，支持静态与 Serverless 函数代理。

### 1. ☁️ Cloudflare Pages 部署 (推荐，支持 D1 与 R2)

1. Fork 本仓库至您的 GitHub / GitLab 账号。
2. 登录 Cloudflare 控制台，进入 **Workers and Pages** -> **Create application** -> **Pages** -> **Connect to Git**。
3. 构建参数配置：
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. 环境变量设置（可选）：
   - `PASSWORD`: 设置独立访问密码（默认：`whitefox5`）
5. D1 数据库与 R2 绑定：
   - 在 Pages 项目设置中进入 **Functions** -> **D1 Database Bindings**，添加绑定名称 `DB`。
   - 在 **R2 Bucket Bindings** 添加绑定名称 `R2_BUCKET`。

### 2. 📐 Vercel 一键部署

1. 关联 GitHub 仓库并导入 Vercel。
2. Vercel 将自动读取根目录下的 `vercel.json` 配置文件。
3. 构建命令设为 `npm run build`，输出目录设为 `dist`。
4. 添加环境变量 `PASSWORD` 后点击 **Deploy**。

### 3. 🐳 Docker & Docker Compose 部署 (VPS / 服务器)

```bash
# 克隆仓库
git clone https://github.com/your-username/whitefox5.git
cd whitefox5

# 使用 Docker Compose 启动容器服务
docker-compose up -d --build
```
服务启动后即可通过 `http://<您的服务器IP>:3000` 访问。

### 4. ☁️ 腾讯云 (Tencent Cloud Serverless / 云开发) 部署

1. 在腾讯云 EdgeOne / Webify / Serverless 控制台新建 Web 应用。
2. 绑定 Git 仓库，构建命令填 `npm run build`，发布目录填 `dist`。
3. 添加路由 Rewrite 规则：`/*` -> `/index.html` (SPA 单页路由支持)。

### 5. ☁️ 阿里云 (Alibaba Cloud ESA / OSS / 基础服务器) 部署

- **ESA / 静态网站托管**：把构建生成的 `dist/` 静态文件上传至阿里云 OSS 或 ESA，配置 404 Rewrite 转向 `index.html`。
- **ECS 传统服务器**：使用 Nginx 托管：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /var/www/whitefox5/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/proxy {
        proxy_pass http://localhost:3000/api/proxy;
        proxy_set_header Host $host;
    }
}
```

### 6. 🌐 Netlify / Zeabur / Render 一键部署

- **Netlify**: 项目自带 `netlify.toml`，自动配置 SPA 路由与 `npm run build` 构建。
- **Zeabur / Render**: 导入 Git 仓库，选择 Node.js 或 Static Environment，构建命令 `npm run build`，发布路径 `dist`。

---

## 🛠️ 本地开发与环境配置

```bash
# 1. 克隆代码库
git clone https://github.com/your-username/whitefox5.git
cd whitefox5

# 2. 安装项目依赖
npm install

# 3. 启动本地 Vite 开发服务器
npm run dev

# 4. 编译打包生成产物
npm run build
```

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 协议开源。
