# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 1. Project Overview

**Project Name:** Gallery (极简主义壁纸画廊)

**Description:** A minimalist wallpaper gallery with user authentication, drag-and-drop sorting, and immersive dark mode. Users can browse, upload, download, and manage their own wallpapers.

---

## 2. Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** SQLite3 (`database.sqlite`)
- **Authentication:** express-session + bcrypt
- **File Upload:** Multer

### Frontend
- **Structure:** Static HTML (no build process)
- **Styling:** Tailwind CSS (CDN)
- **Interactions:** Vanilla JavaScript
- **Libraries:**
  - SortableJS (drag-and-drop sorting)
  - No Alpine.js or React (pure Vanilla JS)

---

## 3. Running the Project

```bash
# Install dependencies (first time only)
npm install

# Start server
npm start

# Server runs at http://localhost:3000
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

---

## 4. Visual Design System

### Core Style
- **Modern Glassmorphism:** Translucent cards with backdrop-blur
- **Immersive Darkroom:** Deep gradient backgrounds with ambient lighting effects

### Color Palette

| Mode | Background | Text | Accent |
|------|------------|------|--------|
| **Light Mode** | Warm Wheat `#F5E6D3` | `#4A3B32` | Blue/Violet gradients |
| **Dark Mode** | Deep Mesh Gradient (blue/violet/cyan) | White/Gray-300 | Blue/Violet/Fuchsia |

### Typography
- **Headings:** Outfit (via Google Fonts)
- **Body:** Work Sans (via Google Fonts)
- **Gradients:** `bg-gradient-to-r from-blue-400 to-violet-400`

---

## 5. Layout Architecture

### Homepage: Bento Grid
- **CSS Grid** with responsive columns (2/3/4 columns)
- **Featured Item:** First element (`:nth-child(1)`) spans 2x2 on desktop
- **Position-based styling:** No hardcoded classes - uses CSS `:nth-child(1)` selector
- **Draggable:** SortableJS integration with localStorage persistence

### Detail Modal: Split View (Desktop 70/30)
- **Left (70%):** Image container with 9:16 aspect ratio frame
- **Right (30%):** Info panel with metadata
- **Mobile:** Vertical stack (image top, info bottom)

### Image Adaptation
- **Container:** Flexbox `justify-center items-center` for perfect centering
- **Background:** Ambient blur layer (same image, `blur-3xl opacity-40`)
- **Image:** `object-contain` with `drop-shadow-2xl`

---

## 6. Core UX Rules

### Drag & Drop Sorting
- **Library:** SortableJS (CDN: `https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js`)
- **Animation:** 300ms cubic-bezier easing
- **Persistence:** localStorage key `galleryOrder` stores array of image IDs
- **Visual Feedback:** `.sortable-ghost` class for placeholder, cursor states

### Detail Modal Interactions

| Interaction | Behavior |
|-------------|----------|
| **Lens Zoom** | Mouse hover → 2x scale, mouse move → transform-origin follows cursor |
| **Backdrop Click** | Click outside → close modal |
| **Scroll** | Long images scrollable within frame |
| **Download** | Always use `/download?url=` proxy for proper Content-Disposition header |

### Upload Flow
1. User must be logged in
2. File validated (image only, max 10MB)
3. Saved to `/uploads/` directory
4. Database record created with `user_id`
5. Gallery reloaded and updated

---

## 7. Backend Architecture

### Database Schema

**Table: `users`**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',  -- 'admin' or 'user'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Table: `images`**
```sql
CREATE TABLE images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### API Endpoints

#### Authentication
| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/register` | POST | No | Create new user account |
| `/api/login` | POST | No | Authenticate and create session |
| `/api/logout` | POST | No | Destroy session |
| `/api/me` | GET | No | Get current user info |

#### Images
| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/images` | GET | No | Get all images (with ownership info) |
| `/api/upload` | POST | Yes | Upload new wallpaper |
| `/api/images/:id` | DELETE | Yes | Delete image (permission checked) |
| `/download` | GET | No | Proxy download with Content-Disposition |

### Permission System

| Role | Can Upload | Can Delete |
|------|------------|------------|
| **Guest** | No | No |
| **User** | Yes | Only own images |
| **Admin** | Yes | All images |

**Middleware:** `requireAuth` checks `req.session.userId`

---

## 8. File Structure

```
wallpaper-site/
├── index.html          # Main HTML with embedded CSS and modals
├── server.js           # Express server with SQLite and auth
├── package.json        # Dependencies and scripts
├── js/
│   └── main.js         # All frontend logic (gallery, auth, modal)
├── uploads/            # User-uploaded wallpapers (auto-created)
├── database.sqlite     # SQLite database (auto-created on first run)
└── CLAUDE.md           # This file
```

---

## 9. Key Implementation Details

### Bento Grid Featured Item
```css
/* Position-based - first item always featured */
.gallery-item:nth-child(1) {
    grid-column: span 2;
    grid-row: span 2;
}
```
**Important:** No hardcoded `featured` class in HTML - always use `:nth-child(1)` selector so dragging works correctly.

### Image Upload Response Format
```json
{
    "success": true,
    "image": {
        "id": 3,
        "filename": "wallpaper-xxx.png",
        "url": "/uploads/wallpaper-xxx.png",
        "userId": 1,
        "uploadDate": "2026-01-15T..."
    }
}
```

### Delete Button Visibility
Delete button only shows when:
```javascript
const canDelete = currentWallpaper.userId && currentUser &&
    (currentUser.role === 'admin' || currentUser.id === currentWallpaper.userId);
```

---

## 10. Development Guidelines

### When Adding New Features
1. **Backend:** Add to `server.js` with proper auth middleware
2. **Frontend:** Add to `js/main.js` following existing patterns
3. **Styling:** Use Tailwind utility classes, add custom CSS in `<style>` block if needed
4. **Testing:** Use admin account (`admin`/`admin123`) for full access

### Common Patterns
- **Modals:** Use `fixed inset-0 z-50` with backdrop
- **Glassmorphism:** `bg-white/10 backdrop-blur-md border border-white/20`
- **Gradients:** `bg-gradient-to-r from-blue-500 to-violet-500`
- **Dark Mode:** `dark:` prefix for dark-specific styles
- **Responsive:** Mobile-first, use `sm:` `md:` `lg:` prefixes

### Debug Logging
Server logs include prefixes for easy filtering:
- `[LOGIN]` - Authentication attempts
- `[AUTH]` - Permission checks
- `[UPLOAD]` - File uploads
- `[ME]` - Session status checks

---

## 11. Default Data

### Default Wallpapers
20 placeholder images from Lorem Picsum (`https://picsum.photos`)

Categories: `abstract`, `nature`, `gradient`, `minimal`, `art`

### Default User
Created automatically on first run:
- Username: `admin`
- Password: `admin123`
- Role: `admin`

---

## 12. Dependencies

```json
{
  "dependencies": {
    "bcrypt": "^6.0.0",
    "express": "^4.22.1",
    "express-session": "^1.18.2",
    "multer": "^1.4.5-lts.1",
    "sqlite3": "^5.1.7"
  }
}
```

---

## 13. Browser Compatibility

- **Modern Browsers:** Chrome, Firefox, Safari, Edge (last 2 versions)
- **Mobile:** iOS Safari, Chrome Mobile (fully responsive)
- **Features Used:** CSS Grid, Flexbox, Backdrop Filter, CSS Custom Properties

---

## Quick Reference

| Task | Command |
|------|----------|
| Start server | `npm start` |
| Kill server on port 3000 | `lsof -ti:3000 \| xargs kill -9` |
| View logs | Check server console output |
| Reset database | Delete `database.sqlite` and restart |
| Clear sort order | Clear localStorage key `galleryOrder` |
