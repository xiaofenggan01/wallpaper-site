# 🚀 Wallpaper Gallery - Vercel 部署指南

完整的部署步骤，从本地到 Vercel 生产环境。

---

## 📋 准备工作清单

- ✅ vercel.json 配置文件已创建
- ✅ .gitignore 已配置（排除 .env 和 node_modules）
- ✅ package.json 已更新（包含 engines 字段）
- ✅ Supabase 后端已配置
- ⏳ GitHub 仓库创建
- ⏳ Git 初始化和推送
- ⏳ Vercel 项目配置

---

## 🌐 第一步：在 GitHub 创建仓库

### 1.1 登录 GitHub

访问：https://github.com

### 1.2 创建新仓库

1. 点击右上角 **+** → **New repository**
2. 填写仓库信息：
   - **Repository name**: `wallpaper-site`（或你喜欢的名字）
   - **Description**: `Modern wallpaper gallery with Supabase backend`
   - **Public/Private**: 选择 **Public**（免费）或 **Private**（需要付费账户）
3. **⚠️ 不要勾选**：
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
4. 点击 **Create repository**

### 1.3 复制仓库 URL

创建后，GitHub 会显示一个 URL，格式类似：
```
https://github.com/YOUR_USERNAME/wallpaper-site.git
```

**记住这个 URL，后面要用到！**

---

## 📦 第二步：初始化 Git 并推送代码

### 2.1 初始化 Git 仓库

在终端执行以下命令：

```bash
# 进入项目目录
cd /Users/lubenwei/wallpaper-site

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 查看状态（可选）
git status
```

### 2.2 创建首次提交

```bash
# 提交所有文件
git commit -m "Initial commit: Wallpaper gallery with Supabase backend

- Express.js backend with Supabase integration
- User authentication (register/login/logout)
- Image upload to Supabase Storage
- CRUD operations for image metadata
- Modern glassmorphism UI with dark/light mode
- Particle background and cursor spotlight effects"
```

### 2.3 关联远程仓库

```bash
# 添加远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/wallpaper-site.git

# 验证远程仓库
git remote -v
```

### 2.4 推送到 GitHub

```bash
# 推送代码到 GitHub
git push -u origin main
```

**如果遇到错误：**

```bash
# 如果默认分支不是 main，重命名分支
git branch -M main

# 再次推送
git push -u origin main
```

---

## 🚀 第三步：在 Vercel 部署

### 3.1 导入项目到 Vercel

1. 访问：https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 **Add New** → **Project**
4. 点击 **Import Git Repository**
5. 选择你的 `wallpaper-site` 仓库
6. 点击 **Import**

### 3.2 配置环境变量

Vercel 会自动检测到 `vercel.json` 中的环境变量引用。

在项目配置页面，添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `SUPABASE_URL` | `https://jehqztypdyzjzbjyzzay.supabase.co` | Supabase 项目 URL |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | 你的 Supabase Anon Key |
| `SESSION_SECRET` | `[生成一个随机字符串]` | Session 加密密钥 |

**生成 SESSION_SECRET：**

在终端执行：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

复制输出结果并粘贴到 Vercel 的 `SESSION_SECRET` 变量中。

### 3.3 部署

1. 确认所有配置正确
2. 点击 **Deploy**
3. 等待部署完成（通常 1-2 分钟）

### 3.4 获取部署 URL

部署完成后，Vercel 会提供一个 URL，格式类似：
```
https://wallpaper-site-xyz.vercel.app
```

这就是你的生产环境地址！

---

## ✅ 部署后验证

### 测试你的网站

1. 访问 Vercel 提供的 URL
2. 测试登录功能（admin / admin123）
3. 测试图片上传
4. 测试编辑和删除功能
5. 测试暗色/亮色模式切换

---

## 🔄 更新部署

### 当你需要更新代码时：

```bash
# 1. 修改代码

# 2. 查看更改
git status

# 3. 添加修改的文件
git add .

# 4. 提交更改
git commit -m "描述你的修改"

# 5. 推送到 GitHub
git push

# Vercel 会自动检测并重新部署！
```

---

## 🛠️ 常见问题

### Q: Vercel 部署失败

**A:** 检查以下几点：
1. `package.json` 中的 `engines.node` 字段是否正确
2. `vercel.json` 配置是否正确
3. 环境变量是否全部配置
4. 查看 Vercel 的部署日志

### Q: Supabase 连接失败

**A:** 确保：
1. 环境变量中的 URL 和 Key 正确
2. Supabase 项目中的 Storage bucket 已创建
3. RLS 策略已正确配置

### Q: 图片上传失败

**A:** 检查：
1. Supabase Storage bucket 是否为 Public
2. Storage Policies 是否允许 INSERT 操作
3. 文件大小是否超过限制（当前 10MB）

---

## 🔐 安全提醒

### ⚠️ 永远不要提交到 Git：

- `.env` 文件（包含敏感密钥）
- `node_modules/` 目录
- 任何 API 密钥或密码
- 本地数据库文件

### ✅ 已添加到 .gitignore：

```
.env
.env.local
node_modules/
uploads/
database.sqlite
```

---

## 📊 部署架构

```
用户浏览器
    ↓
Vercel Edge Network (CDN)
    ↓
Vercel Serverless Function
    ↓
Express.js (server.js)
    ↓
Supabase (PostgreSQL + Storage)
```

---

## 🎉 完成！

现在你的壁纸画廊网站已经部署到全球 CDN，任何人都可以访问！

**你的网站地址：** Vercel 部署完成后显示的 URL

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

---

## 📝 部署检查清单

- [ ] GitHub 仓库已创建
- [ ] 代码已推送到 GitHub
- [ ] Vercel 项目已导入
- [ ] 环境变量已配置
- [ ] 部署成功
- [ ] 网站可访问
- [ ] 登录功能正常
- [ ] 图片上传功能正常
- [ ] 编辑功能正常
- [ ] 删除功能正常

---

**需要帮助？**
- Vercel 文档：https://vercel.com/docs
- Supabase 文档：https://supabase.com/docs
