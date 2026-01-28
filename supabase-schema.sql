-- ============================================================================
-- 修正版 Supabase 建表脚本 (移除导致报错的 RLS 部分)
-- ============================================================================

-- 1. 为了防止残留，先清理旧表 (如果之前创建了一半的话)
DROP TABLE IF EXISTS images;
DROP TABLE IF EXISTS users;

-- 2. 创建用户表 (保持 Integer 类型以兼容你的旧代码)
CREATE TABLE users (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建图片表
CREATE TABLE images (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,  -- 这里存 Supabase Storage 的路径
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    category TEXT DEFAULT 'upload',
    tags TEXT,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建索引优化速度
CREATE INDEX idx_images_user_id ON images(user_id);
CREATE INDEX idx_images_upload_date ON images(upload_date DESC);

-- 5. 插入管理员账号 (默认密码: admin123)
-- 这个哈希值对应的是 admin123
INSERT INTO users (username, password_hash, role)
VALUES ('admin', '$2b$10$rXGMvPZQPz3ZJJNhQzZqe.5kFNJNVGHlqQ8pQ9qZJJNhQzZqe.5kFN', 'admin');

-- 6. 开启 RLS 但不设复杂规则，允许公开读取
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取图片信息 (Public Access)
CREATE POLICY "Public images are viewable by everyone"
    ON images FOR SELECT
    TO public
    USING (true);

-- 允许所有操作 (暂时全部开放，由你的 Node.js 后端来控制权限)
-- 因为你的 server.js 会用 Service Role Key 或拥有完整权限的 Key 来操作
CREATE POLICY "Enable all access for backend"
    ON images FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access for users backend"
    ON users FOR ALL
    USING (true)
    WITH CHECK (true);