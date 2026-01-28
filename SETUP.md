# 壁纸网站 - 架构升级完成

## 完成的更新

### 1. 暖麦色主题
- Light Mode 现在使用温暖的 #F5E6D3 小麦色背景
- 文字使用深棕色 #4A3B32 保持柔和阅读体验
- 按钮和 UI 元素采用暖色调渐变 (#D4A574)
- Dark Mode 保持原有的深色极光设计

### 2. Node.js 后端架构
- 创建了 `server.js` - Express 服务器
- 创建了 `package.json` - 项目配置
- 创建了 `uploads/` 文件夹 - 存储上传的壁纸
- 添加了 `/upload` 接口 - 接收图片上传
- 添加了 `/api/wallpapers` 接口 - 获取服务器壁纸列表

### 3. 上传功能
- 导航栏添加了"上传壁纸"按钮
- 点击后弹出文件选择器
- 上传成功后自动刷新网格，新图片显示在第一位
- 上传状态显示（上传中、成功、失败）

---

## 启动服务器

由于 npm 缓存权限问题，请手动执行以下命令：

### 方式 1: 使用 npm（推荐）
```bash
# 修复 npm 缓存权限（需要管理员密码）
sudo chown -R $(whoami) ~/.npm

# 安装依赖
npm install

# 启动服务器
npm start
```

### 方式 2: 使用 yarn（如果已安装）
```bash
# 安装依赖
yarn add express multer

# 启动服务器
node server.js
```

### 方式 3: 手动下载依赖
如果上述方式都失败，请访问以下链接手动下载：
- https://registry.npmjs.org/express/-/express-4.18.2.tgz
- https://registry.npmjs.org/multer/-/multer-1.4.5-lts.1.tgz

解压到 `node_modules` 目录后运行：
```bash
node server.js
```

---

## 访问网站

服务器启动后，访问：
- **主页**: http://localhost:3000
- **上传接口**: POST http://localhost:3000/upload
- **壁纸列表**: GET http://localhost:3000/api/wallpapers

---

## 项目结构

```
wallpaper-site/
├── server.js          # Express 服务器
├── package.json       # 项目配置
├── index.html         # 主页面
├── js/
│   └── main.js        # 前端逻辑（含上传功能）
├── uploads/           # 上传的壁纸存储目录
├── css/               # 样式目录
└── .claude/           # Claude Code 配置
```

---

## 功能特性

- ✅ 暖麦色 Light Mode 主题
- ✅ 深色极光 Dark Mode 主题
- ✅ Bento Grid 非对称网格布局
- ✅ Featured 精选项目（2x2 网格）
- ✅ 霓虹胶囊分类按钮
- ✅ 图片悬停操作栏（收藏、下载、预览）
- ✅ 壁纸上传功能
- ✅ 收藏功能（本地存储）
- ✅ 淡入向上动画效果
