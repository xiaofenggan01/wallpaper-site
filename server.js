// ============================================================================
// WALLPAPER GALLERY - Supabase Backend
// ============================================================================
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// ============================================================================
// CUSTOM SUPABASE SESSION STORE (For Vercel Serverless Compatibility)
// ============================================================================

class SupabaseSessionStore extends session.Store {
    constructor(supabase, options = {}) {
        super();
        this.supabase = supabase;
        this.tableName = options.tableName || 'sessions';
        this.autoRemoveInterval = options.autoRemoveInterval || 24 * 60 * 60 * 1000; // 24 hours

        // Set up automatic cleanup of expired sessions
        if (this.autoRemoveInterval > 0) {
            this.cleanupTimer = setInterval(() => {
                this.cleanup().catch(err => console.error('[SESSION] Cleanup error:', err));
            }, this.autoRemoveInterval);
        }
    }

    async get(sid, callback) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('sess')
                .eq('sid', sid)
                .single();

            if (error || !data) {
                return callback(null, null);
            }

            // Parse JSON data
            const sessionData = typeof data.sess === 'string'
                ? JSON.parse(data.sess)
                : data.sess;

            callback(null, sessionData);
        } catch (err) {
            callback(err);
        }
    }

    async set(sid, session, callback) {
        try {
            const expires = new Date(Date.now() + session.cookie.maxAge);
            const sessionData = JSON.stringify(session);

            const { error } = await this.supabase
                .from(this.tableName)
                .upsert({
                    sid: sid,
                    sess: sessionData,
                    expires: expires.toISOString()
                }, {
                    onConflict: 'sid'
                });

            if (error) {
                console.error('[SESSION] Set error:', error);
                return callback(error);
            }

            callback(null);
        } catch (err) {
            callback(err);
        }
    }

    async destroy(sid, callback) {
        try {
            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .eq('sid', sid);

            if (error) {
                console.error('[SESSION] Destroy error:', error);
                return callback(error);
            }

            callback(null);
        } catch (err) {
            callback(err);
        }
    }

    async all(callback) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('sid, sess');

            if (error) {
                return callback(error);
            }

            const sessions = {};
            for (const row of data) {
                const sessionData = typeof row.sess === 'string'
                    ? JSON.parse(row.sess)
                    : row.sess;
                sessions[row.sid] = sessionData;
            }

            callback(null, sessions);
        } catch (err) {
            callback(err);
        }
    }

    async length(callback) {
        try {
            const { count, error } = await this.supabase
                .from(this.tableName)
                .select('*', { count: 'exact', head: true });

            if (error) {
                return callback(error);
            }

            callback(null, count || 0);
        } catch (err) {
            callback(err);
        }
    }

    async clear(callback) {
        try {
            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .neq('sid', ''); // Delete all (neq empty string matches everything)

            if (error) {
                return callback(error);
            }

            callback(null);
        } catch (err) {
            callback(err);
        }
    }

    async cleanup() {
        try {
            const now = new Date().toISOString();
            const { data, error } = await this.supabase
                .from(this.tableName)
                .delete()
                .lt('expires', now);

            if (error) {
                console.error('[SESSION] Cleanup error:', error);
            } else {
                console.log('[SESSION] Cleaned up expired sessions');
            }
        } catch (err) {
            console.error('[SESSION] Cleanup error:', err);
        }
    }

    destroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
    }
}

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// SUPABASE CLIENT SETUP
// ============================================================================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ERROR: Missing Supabase credentials in .env file');
    process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('[SUPABASE] Connected to:', supabaseUrl);

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration with Supabase store for Vercel compatibility
const sessionStore = new SupabaseSessionStore(supabase, {
    tableName: 'sessions'
});

app.use(session({
    secret: process.env.SESSION_SECRET || 'wallpaper-gallery-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
}));

// ============================================================================
// AUTH MIDDLEWARE
// ============================================================================

// Auth middleware - check if user is logged in
function requireAuth(req, res, next) {
    console.log('[AUTH] Checking authentication...');
    console.log('[AUTH] Session:', req.session);

    if (!req.session || !req.session.userId) {
        console.log('[AUTH] Authentication FAILED - No valid session');
        return res.status(401).json({ error: 'Authentication required' });
    }

    console.log('[AUTH] Authentication SUCCESS - User ID:', req.session.userId);
    next();
}

// Admin middleware - check if user is admin
async function requireAdmin(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const { data: user } = await supabase
            .from('users')
            .select('role')
            .eq('id', req.session.userId)
            .single();

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        next();
    } catch (error) {
        console.error('[ADMIN] Error checking admin role:', error);
        return res.status(500).json({ error: 'Failed to verify admin role' });
    }
}

// ============================================================================
// STATIC FILES
// ============================================================================

app.use(express.static(__dirname));

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

// Register new user
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    console.log('[REGISTER] Registration attempt for username:', username);

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('username', username)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash password
        const passwordHash = bcrypt.hashSync(password, 10);

        // Create user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                username: username,
                password_hash: passwordHash,
                role: 'user'
            })
            .select()
            .single();

        if (error) {
            console.error('[REGISTER] Database error:', error);
            return res.status(500).json({ error: 'Failed to create user' });
        }

        console.log('[REGISTER] User created successfully:', newUser.id);

        res.status(201).json({
            success: true,
            user: {
                id: newUser.id,
                username: newUser.username,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('[REGISTER] Error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    console.log('[LOGIN] Login attempt for username:', username);

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        // Get user from database
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !user) {
            console.log('[LOGIN] User not found');
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Verify password
        const passwordMatch = bcrypt.compareSync(password, user.password_hash);

        if (!passwordMatch) {
            console.log('[LOGIN] Password mismatch');
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        console.log('[LOGIN] Authentication successful, setting session...');

        // Set session
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;

        console.log('[LOGIN] Session saved:', req.session.userId);

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('[LOGIN] Error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ success: true });
    });
});

// Get current user info
app.get('/api/me', (req, res) => {
    console.log('[ME] Session check - Session:', req.session);

    if (!req.session || !req.session.userId) {
        console.log('[ME] No active session');
        return res.json({ user: null });
    }

    console.log('[ME] Active session - User ID:', req.session.userId);

    res.json({
        user: {
            id: req.session.userId,
            username: req.session.username,
            role: req.session.role
        }
    });
});

// ============================================================================
// FILE UPLOAD CONFIG (Memory storage for Supabase upload)
// ============================================================================

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// ============================================================================
// IMAGE ENDPOINTS
// ============================================================================

// Get all images (from database)
app.get('/api/images', async (req, res) => {
    console.log('[IMAGES] GET /api/images - Fetching all images from database');

    try {
        const { data: images, error } = await supabase
            .from('images')
            .select(`
                id,
                filename,
                storage_path,
                user_id,
                title,
                category,
                tags,
                upload_date,
                users!inner (
                    username,
                    role
                )
            `)
            .order('upload_date', { ascending: false });

        if (error) {
            console.error('[IMAGES] Database error:', error);
            return res.status(500).json({ error: 'Failed to fetch images' });
        }

        // Transform data to match expected format
        const transformedImages = images.map(img => {
            const publicUrl = `${supabaseUrl}/storage/v1/object/public/wallpapers/${img.storage_path}`;

            return {
                id: img.id,
                filename: img.filename,
                url: publicUrl,
                title: img.title,
                category: img.category || 'upload',
                tags: img.tags,
                userId: img.user_id,
                username: img.users.username,
                userRole: img.users.role,
                uploadDate: img.upload_date,
                canDelete: req.session && (
                    req.session.role === 'admin' || req.session.userId === img.user_id
                ),
                canEdit: req.session && (
                    req.session.role === 'admin' || req.session.userId === img.user_id
                )
            };
        });

        res.json(transformedImages);
    } catch (error) {
        console.error('[IMAGES] Error:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

// Upload image (requires authentication)
app.post('/api/upload', requireAuth, upload.single('wallpaper'), async (req, res) => {
    console.log('[UPLOAD] Upload request received');
    console.log('[UPLOAD] File:', req.file?.originalname);
    console.log('[UPLOAD] User from session:', req.session.userId);

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const userId = req.session.userId;
        const fileExt = path.extname(req.file.originalname);
        const fileName = `wallpaper-${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
        const storagePath = `${userId}/${fileName}`;

        console.log('[UPLOAD] Uploading to Supabase Storage:', storagePath);

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('wallpapers')
            .upload(storagePath, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            });

        if (uploadError) {
            console.error('[UPLOAD] Storage error:', uploadError);
            return res.status(500).json({ error: 'Failed to upload file to storage' });
        }

        console.log('[UPLOAD] Storage upload successful');

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('wallpapers')
            .getPublicUrl(storagePath);

        // Save to database
        const { data: dbData, error: dbError } = await supabase
            .from('images')
            .insert({
                filename: fileName,
                storage_path: storagePath,
                user_id: userId,
                title: req.file.originalname.replace(fileExt, ''),
                category: 'upload',
                tags: null
            })
            .select()
            .single();

        if (dbError) {
            console.error('[UPLOAD] Database error:', dbError);
            // Rollback: delete from storage
            await supabase.storage.from('wallpapers').remove([storagePath]);
            return res.status(500).json({ error: 'Failed to save image record' });
        }

        console.log('[UPLOAD] Upload SUCCESS - Image ID:', dbData.id);

        res.status(201).json({
            success: true,
            image: {
                id: dbData.id,
                filename: dbData.filename,
                url: urlData.publicUrl,
                title: dbData.title,
                userId: userId,
                uploadDate: dbData.upload_date
            }
        });
    } catch (error) {
        console.error('[UPLOAD] Error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Update image metadata (title, category, tags)
app.put('/api/images/:id', requireAuth, async (req, res) => {
    const imageId = parseInt(req.params.id);
    const userId = req.session.userId;
    const userRole = req.session.role;
    const { title, category, tags } = req.body;

    console.log('[UPDATE] ====== UPDATE REQUEST START ======');
    console.log('[UPDATE] Image ID:', imageId);
    console.log('[UPDATE] Data:', { title, category, tags });

    // Validate input
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ success: false, error: 'Request body is empty' });
    }

    if (!title) {
        return res.status(400).json({ success: false, error: 'Title is required' });
    }

    if (isNaN(imageId)) {
        return res.status(400).json({ success: false, error: 'Invalid image ID' });
    }

    try {
        // Get the image to check permissions
        const { data: image, error: fetchError } = await supabase
            .from('images')
            .select('id, user_id, title, category, tags')
            .eq('id', imageId)
            .single();

        if (fetchError || !image) {
            console.error('[UPDATE] Image not found');
            return res.status(404).json({ success: false, error: 'Image not found' });
        }

        // Check permissions
        const canEdit = userRole === 'admin' || image.user_id === userId;

        if (!canEdit) {
            console.error('[UPDATE] Permission denied');
            return res.status(403).json({ success: false, error: 'You do not have permission to edit this image' });
        }

        console.log('[UPDATE] Permission check passed. Executing UPDATE...');

        // Update the image
        const { data: updatedImage, error: updateError } = await supabase
            .from('images')
            .update({
                title: title,
                category: category,
                tags: tags
            })
            .eq('id', imageId)
            .select()
            .single();

        if (updateError) {
            console.error('[UPDATE] Update error:', updateError);
            return res.status(500).json({ success: false, error: 'Failed to update image' });
        }

        console.log('[UPDATE] ====== UPDATE SUCCESS ======');
        console.log('[UPDATE] Updated image - ID:', imageId, 'title:', title);

        res.json({
            success: true,
            image: {
                id: imageId,
                title: title,
                category: category,
                tags: tags
            }
        });
    } catch (error) {
        console.error('[UPDATE] Error:', error);
        res.status(500).json({ success: false, error: 'Update failed' });
    }
});

// Delete image (with permission check)
app.delete('/api/images/:id', requireAdmin, async (req, res) => {
    const imageId = req.params.id;
    const userId = req.session.userId;
    const userRole = req.session.role;

    console.log('[DELETE] Delete request for image ID:', imageId);

    try {
        // First, get the image to check permissions and get storage path
        const { data: image, error: fetchError } = await supabase
            .from('images')
            .select('id, filename, storage_path, user_id')
            .eq('id', imageId)
            .single();

        if (fetchError || !image) {
            return res.status(404).json({ error: 'Image not found' });
        }

        // Check permissions
        const canDelete = userRole === 'admin' || image.user_id === userId;

        if (!canDelete) {
            return res.status(403).json({ error: 'You do not have permission to delete this image' });
        }

        // Delete file from Supabase Storage
        const { error: storageError } = await supabase.storage
            .from('wallpapers')
            .remove([image.storage_path]);

        if (storageError) {
            console.error('[DELETE] Storage deletion error:', storageError);
            // Continue with database deletion even if storage deletion fails
        }

        // Delete from database
        const { error: dbError } = await supabase
            .from('images')
            .delete()
            .eq('id', imageId);

        if (dbError) {
            console.error('[DELETE] Database error:', dbError);
            return res.status(500).json({ error: 'Failed to delete image record' });
        }

        console.log('[DELETE] Delete SUCCESS');

        res.json({ success: true });
    } catch (error) {
        console.error('[DELETE] Error:', error);
        res.status(500).json({ error: 'Delete failed' });
    }
});

// ============================================================================
// DOWNLOAD ENDPOINT
// ============================================================================

app.get('/download', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        // Handle Supabase Storage URLs
        if (url.includes('/storage/v1/object/public/wallpapers/')) {
            // Extract storage path from URL
            const pathMatch = url.match(/\/wallpapers\/(.+)$/);
            if (pathMatch) {
                const storagePath = pathMatch[1];
                const filename = path.basename(storagePath);

                // Download from Supabase Storage
                const { data, error } = await supabase.storage
                    .from('wallpapers')
                    .download(storagePath);

                if (error) {
                    console.error('[DOWNLOAD] Storage error:', error);
                    return res.status(404).json({ error: 'File not found' });
                }

                // Set headers for download
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.setHeader('Content-Type', data.type || 'image/jpeg');

                // Pipe the data to response
                const arrayBuffer = await data.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                res.send(buffer);
                return;
            }
        }

        // Handle external URLs (original logic)
        const https = require('https');
        const http = require('http');
        const urlModule = require('url');

        const parsedUrl = url_module.parse(url);

        if (!parsedUrl.protocol || !parsedUrl.hostname) {
            return res.status(400).json({ error: 'Invalid URL format' });
        }

        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        protocol.get(url, (response) => {
            if (response.statusCode !== 200) {
                return res.status(response.statusCode).json({ error: 'Failed to fetch image' });
            }

            res.setHeader('Content-Disposition', `attachment; filename="wallpaper.jpg"`);
            res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');

            response.pipe(res);
        }).on('error', (err) => {
            console.error('Download error:', err);
            res.status(500).json({ error: 'Failed to download image' });
        });

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Download failed' });
    }
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Wallpaper Gallery Server Running`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🗄️  Database: Supabase (${supabaseUrl})`);
    console.log(`📦 Storage: Supabase Storage (wallpapers bucket)`);
    console.log(`🔐 Session: Supabase Store (sessions table)`);
    console.log(`${'='.repeat(60)}\n`);
    console.log(`⚠️  IMPORTANT SETUP STEPS:`);
    console.log(`   1. Run the SQL commands below in Supabase SQL Editor`);
    console.log(`   2. Create 'wallpapers' storage bucket in Supabase`);
    console.log(`   3. Make bucket public for URL access`);
    console.log(`   4. Set up environment variables in Vercel`);
    console.log(`   5. Default admin: admin / admin123`);
    console.log(`${'='.repeat(60)}\n`);
});
