# Wallpaper Gallery - Supabase Setup Guide

This guide will help you set up the wallpaper gallery with Supabase backend.

## Prerequisites

- Node.js installed
- Supabase account and project created
- Your Supabase credentials:
  - URL: `https://jehqztypdyzjzbjyzzay.supabase.co`
  - Anon Key: `sb_publishable_LYy67SuhlLSKmHnFe4mhcA_wQvZ22cx`

---

## Step 1: Set Up Database Tables

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Copy the contents of `supabase-schema.sql`
4. Paste it into the SQL Editor
5. Click **Run** to execute the SQL

This will create:
- `users` table with default admin user
- `images` table with all necessary fields
- Row Level Security (RLS) policies
- Indexes for performance

**Default admin credentials:**
- Username: `admin`
- Password: `admin123`

---

## Step 2: Create Storage Bucket

1. Navigate to **Storage** in the left sidebar
2. Click **Create a new bucket**
3. Enter the following details:
   - **Name:** `wallpapers`
   - **Public bucket:** Toggle ON (this is important for public URL access)
4. Click **Create bucket**

### Configure Bucket Policies

After creating the bucket:

1. Click on the `wallpapers` bucket
2. Go to **Policies** tab
3. Add the following policies (click **New Policy** → **Full Custom**):

#### Public Read Policy (for viewing images)

```sql
allow SELECT
on storage.objects
for public
with check ( bucket_id = 'wallpapers' );
```

#### Authenticated Upload Policy

```sql
allow INSERT
on storage.objects
for authenticated
with check ( bucket_id = 'wallpapers' );
```

#### User Delete Policy (users can delete their own files)

```sql
allow DELETE
on storage.objects
for authenticated
using ( bucket_id = 'wallpapers' )
with check ( auth.uid()::text = (storage.foldername) );
```

---

## Step 3: Install Dependencies

Run the following commands in your terminal:

```bash
# Stop the old server if running
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Remove old dependencies
rm -rf node_modules package-lock.json

# Install new dependencies
npm install
```

---

## Step 4: Environment Configuration

The `.env` file has been created with your credentials:

```env
SUPABASE_URL=https://jehqztypdyzjzbjyzzay.supabase.co
SUPABASE_ANON_KEY=sb_publishable_LYy67SuhlLSKmHnFe4mhcA_wQvZ22cx
PORT=3000
SESSION_SECRET=wallpaper-gallery-secret-key-2024-change-in-production
SUPABASE_STORAGE_BUCKET=wallpapers
```

---

## Step 5: Start the Server

```bash
npm start
```

You should see output like:

```
============================================================
🚀 Wallpaper Gallery Server Running
============================================================
📍 URL: http://localhost:3000
🗄️  Database: Supabase (https://jehqztypdyzjzbjyzzay.supabase.co)
📦 Storage: Supabase Storage (wallpapers bucket)
============================================================

⚠️  IMPORTANT SETUP STEPS:
   1. Run supabase-schema.sql in Supabase SQL Editor
   2. Create 'wallpapers' storage bucket in Supabase
   3. Make bucket public for URL access
   4. Default admin: admin / admin123
============================================================
```

---

## Step 6: Test the Application

1. Open http://localhost:3000 in your browser
2. Login with `admin` / `admin123`
3. Test uploading an image
4. Test editing image metadata
5. Test deleting an image

All data will now be stored in Supabase!

---

## Migration Notes

### What Changed?

| Before (Local) | After (Supabase) |
|----------------|------------------|
| SQLite database | Supabase PostgreSQL |
| Local /uploads folder | Supabase Storage (wallpapers bucket) |
| File system paths | Public Storage URLs |
| sqlite3 package | @supabase/supabase-js |
| multer disk storage | multer memory storage |

### Features Preserved

✅ User authentication (register, login, logout)
✅ Image upload to cloud storage
✅ Image listing with metadata
✅ Edit image title, category, tags
✅ Delete images with permission checks
✅ Download functionality
✅ Admin vs user permissions
✅ Session management

### Data Structure

The database structure remains the same:
- `users` table: id, username, password_hash, role, created_at
- `images` table: id, filename, storage_path, user_id, title, category, tags, upload_date

The `storage_path` field is new and contains the Supabase Storage path (e.g., `1/wallpaper-1234567890.jpg`)

---

## Troubleshooting

### Error: "Bucket not found"

**Solution:** Make sure you created the `wallpapers` bucket in Supabase Storage.

### Error: "Failed to upload file to storage"

**Solutions:**
1. Check that the bucket is public
2. Verify your SUPABASE_URL and SUPABASE_ANON_KEY are correct
3. Check browser console for CORS errors

### Images not loading after upload

**Solution:** Verify the bucket is marked as **Public** in Supabase Storage settings.

### Permission denied errors

**Solution:** Make sure RLS policies are created in the database (Step 1).

---

## Production Deployment

When deploying to production:

1. Change `SESSION_SECRET` in `.env` to a secure random string
2. Set `NODE_ENV=production` for secure cookies
3. Consider using Supabase Auth instead of session-based auth
4. Enable CDN for faster image delivery
5. Set up proper backup strategy

---

## Support

For issues with:
- **Supabase:** https://supabase.com/docs
- **Database:** Check Supabase SQL Editor logs
- **Storage:** Check Supabase Storage logs

---

**Generated for:** Wallpaper Gallery
**Date:** 2026-01-28
**Supabase Project:** jehqztypdyzjzbjyzzay
