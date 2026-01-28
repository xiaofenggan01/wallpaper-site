// ============================================================================
// MAIN.JS - Wallpaper Gallery Application
// ============================================================================
console.log('[MAIN] main.js loaded successfully');

// Wallpaper data with varied heights for masonry layout
let wallpapers = [
    { id: 1, title: "抽象渐变 01", category: "abstract", url: "https://picsum.photos/seed/w1/600/800", height: 'aspect-[9/16]' },
    { id: 2, title: "自然风光 01", category: "nature", url: "https://picsum.photos/seed/w2/600/800", height: 'aspect-[9/16]' },
    { id: 3, title: "极简线条 01", category: "minimal", url: "https://picsum.photos/seed/w3/600/600", height: 'aspect-[3/4]' },
    { id: 4, title: "艺术纹理 01", category: "art", url: "https://picsum.photos/seed/w4/600/750", height: 'aspect-[8/15]' },
    { id: 5, title: "抽象渐变 02", category: "abstract", url: "https://picsum.photos/seed/w5/600/800", height: 'aspect-[9/16]' },
    { id: 6, title: "渐变色彩 01", category: "gradient", url: "https://picsum.photos/seed/w6/600/650", height: 'aspect-[5/8]' },
    { id: 7, title: "自然风光 02", category: "nature", url: "https://picsum.photos/seed/w7/600/700", height: 'aspect-[9/16]' },
    { id: 8, title: "极简几何 01", category: "minimal", url: "https://picsum.photos/seed/w8/600/800", height: 'aspect-[9/16]' },
    { id: 9, title: "抽象渐变 03", category: "abstract", url: "https://picsum.photos/seed/w9/600/680", height: 'aspect-[4/7]' },
    { id: 10, title: "艺术纹理 02", category: "art", url: "https://picsum.photos/seed/w10/600/800", height: 'aspect-[9/16]' },
    { id: 11, title: "渐变色彩 02", category: "gradient", url: "https://picsum.photos/seed/w11/600/720", height: 'aspect-[8/15]' },
    { id: 12, title: "极简几何 02", category: "minimal", url: "https://picsum.photos/seed/w12/600/760", height: 'aspect-[9/16]' },
    { id: 13, title: "自然风光 03", category: "nature", url: "https://picsum.photos/seed/w13/600/800", height: 'aspect-[9/16]' },
    { id: 14, title: "抽象渐变 04", category: "abstract", url: "https://picsum.photos/seed/w14/600/640", height: 'aspect-[3/5]' },
    { id: 15, title: "艺术纹理 03", category: "art", url: "https://picsum.photos/seed/w15/600/780", height: 'aspect-[9/16]' },
    { id: 16, title: "渐变色彩 03", category: "gradient", url: "https://picsum.photos/seed/w16/600/800", height: 'aspect-[9/16]' },
    { id: 17, title: "梦幻星空 01", category: "abstract", url: "https://picsum.photos/seed/w17/600/700", height: 'aspect-[9/16]' },
    { id: 18, title: "山川湖海 01", category: "nature", url: "https://picsum.photos/seed/w18/600/750", height: 'aspect-[9/16]' },
    { id: 19, title: "城市夜景 01", category: "minimal", url: "https://picsum.photos/seed/w19/600/680", height: 'aspect-[4/7]' },
    { id: 20, title: "极光森林", category: "nature", url: "https://picsum.photos/seed/w20/600/800", height: 'aspect-[9/16]' },
];

// Favorites storage
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// DOM elements
const galleryGrid = document.getElementById('galleryGrid');
const categoryFilters = document.getElementById('categoryFilters');
const themeToggle = document.getElementById('themeToggle');
const previewModal = document.getElementById('previewModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalTitle = document.getElementById('modalTitle');
const modalImage = document.getElementById('modalImage');
const ambientBlur = document.getElementById('ambientBlur');
const modalFilename = document.getElementById('modalFilename');
const modalResolution = document.getElementById('modalResolution');
const modalCategory = document.getElementById('modalCategory');
const modalTags = document.getElementById('modalTags');
const closeModal = document.getElementById('closeModal');
const downloadBtn = document.getElementById('downloadBtn');
const deleteBtn = document.getElementById('deleteBtn');
const editBtn = document.getElementById('editBtn');
const editBtnText = document.getElementById('editBtnText');
const editIcon = document.getElementById('editIcon');

// Edit mode elements
const titleViewMode = document.getElementById('titleViewMode');
const titleEditMode = document.getElementById('titleEditMode');
const editTitleInput = document.getElementById('editTitleInput');
const editCategorySelect = document.getElementById('editCategorySelect');
const editTagsInput = document.getElementById('editTagsInput');
const emptyState = document.getElementById('emptyState');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');

// Auth DOM elements
const authButtons = document.getElementById('authButtons');
const userInfo = document.getElementById('userInfo');
const welcomeText = document.getElementById('welcomeText');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authModal = document.getElementById('authModal');
const authModalBackdrop = document.getElementById('authModalBackdrop');
const closeAuthModal = document.getElementById('closeAuthModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const toggleText = document.getElementById('toggleText');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

let currentWallpaper = null;
let currentFilter = 'all';
let currentUser = null;  // Store current logged-in user
let isLoginMode = true;  // Toggle between login/register forms
let isEditMode = false;  // Toggle between view/edit modes

// Initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
    }
}

// Toggle theme
function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

// Check current user authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/me');
        const data = await response.json();

        if (data.user) {
            currentUser = data.user;
            updateAuthUI();
        } else {
            currentUser = null;
            updateAuthUI();
        }
    } catch (error) {
        console.error('Failed to check auth status:', error);
        currentUser = null;
        updateAuthUI();
    }
}

// Update UI based on authentication status
function updateAuthUI() {
    if (currentUser) {
        // User is logged in
        authButtons.classList.add('hidden');
        userInfo.classList.remove('hidden');
        welcomeText.textContent = `欢迎, ${currentUser.username}`;
    } else {
        // User is not logged in
        authButtons.classList.remove('hidden');
        userInfo.classList.add('hidden');
    }
}

// Open auth modal
function openAuthModal() {
    authModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    loginError.classList.add('hidden');
    registerError.classList.add('hidden');
}

// Close auth modal
function closeAuthModalFn() {
    authModal.classList.add('hidden');
    document.body.style.overflow = '';
    // Reset forms
    loginForm.reset();
    registerForm.reset();
}

// Toggle between login and register forms
function toggleAuthModeFn() {
    isLoginMode = !isLoginMode;

    if (isLoginMode) {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        toggleText.textContent = '还没有账号？';
        toggleAuthMode.textContent = '立即注册';
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        toggleText.textContent = '已有账号？';
        toggleAuthMode.textContent = '立即登录';
    }

    loginError.classList.add('hidden');
    registerError.classList.add('hidden');
}

// Login function
async function login(username, password) {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            updateAuthUI();
            closeAuthModalFn();
        } else {
            loginError.textContent = data.error || '登录失败';
            loginError.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = '网络错误，请重试';
        loginError.classList.remove('hidden');
    }
}

// Register function
async function register(username, password) {
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            // Auto-login after registration
            await login(username, password);
        } else {
            registerError.textContent = data.error || '注册失败';
            registerError.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Register error:', error);
        registerError.textContent = '网络错误，请重试';
        registerError.classList.remove('hidden');
    }
}

// Logout function
async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });

        if (response.ok) {
            currentUser = null;
            updateAuthUI();
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Check if wallpaper is favorited
function isFavorited(id) {
    return favorites.includes(id);
}

// Toggle favorite
function toggleFavorite(id, event) {
    event.stopPropagation();

    if (favorites.includes(id)) {
        favorites = favorites.filter(f => f !== id);
    } else {
        favorites.push(id);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));

    // Update button state
    const btn = event.currentTarget;
    btn.classList.toggle('favorited');

    // Update heart icon
    const svg = btn.querySelector('svg');
    if (favorites.includes(id)) {
        svg.setAttribute('fill', 'currentColor');
    } else {
        svg.setAttribute('fill', 'none');
    }
}

// Quick download from gallery
function quickDownload(id, event) {
    event.stopPropagation();
    const wallpaper = wallpapers.find(w => w.id === id);
    if (!wallpaper) return;

    // Use /download endpoint to trigger proper file download
    window.location.href = `/download?url=${encodeURIComponent(wallpaper.url)}`;
}

// Render gallery with stagger animation and Bento Grid
function renderGallery(filter = 'all') {
    const filtered = filter === 'all'
        ? wallpapers
        : wallpapers.filter(w => w.category === filter);

    if (filtered.length === 0) {
        galleryGrid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    galleryGrid.innerHTML = filtered.map((wallpaper, index) => {
        const isFav = isFavorited(wallpaper.id);
        return `
        <div class="gallery-item" data-id="${wallpaper.id}">
            ${index === 0 ? '<div class="featured-badge">Featured</div>' : ''}

            <img src="${wallpaper.url}"
                 alt="${wallpaper.title}"
                 loading="${index < 4 ? 'eager' : 'lazy'}">

            <!-- Hover Reveal Overlay -->
            <div class="hover-overlay">
                <!-- Top: Featured badge (already rendered above, positioned by CSS) -->

                <!-- Bottom: Metadata + Actions -->
                <div class="flex flex-col gap-3">
                    <!-- Metadata -->
                    <div class="card-metadata">
                        <p class="card-title">${wallpaper.title}</p>
                        ${wallpaper.username ? `<p class="card-user">@${wallpaper.username}</p>` : ''}
                    </div>

                    <!-- Actions -->
                    <div class="card-actions">
                        <button class="card-action-btn ${isFav ? 'favorited' : ''}" data-action="favorite" aria-label="Favorite">
                            <svg class="w-4 h-4" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                        </button>
                        <button class="card-action-btn" data-action="download" aria-label="Download">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                        </button>
                        <button class="card-action-btn" data-action="preview" aria-label="Preview">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `}).join('');

    // Add click listeners for action buttons
    document.querySelectorAll('.card-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.currentTarget.closest('.gallery-item');
            const id = parseInt(item.dataset.id);
            const action = e.currentTarget.dataset.action;

            if (action === 'favorite') {
                toggleFavorite(id, e);
            } else if (action === 'download') {
                quickDownload(id, e);
            } else if (action === 'preview') {
                openModal(id);
            }
        });
    });

    // Add click listener for card preview (click on image area)
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // Only open modal if not clicking on action buttons
            if (!e.target.closest('.card-action-btn')) {
                openModal(parseInt(item.dataset.id));
            }
        });
    });
}

// Get category name in Chinese
function getCategoryName(category) {
    const names = {
        abstract: '抽象',
        nature: '自然',
        gradient: '渐变',
        minimal: '极简',
        art: '艺术'
    };
    return names[category] || category;
}

// Filter gallery
function filterGallery(category) {
    currentFilter = category;
    renderGallery(category);

    // Update active filter button (filter-pill style)
    document.querySelectorAll('.filter-pill').forEach(btn => {
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Open modal
function openModal(id) {
    currentWallpaper = wallpapers.find(w => w.id === id);
    if (!currentWallpaper) return;

    // Reset edit mode when opening modal
    exitEditMode();

    // Set title and image
    modalTitle.textContent = currentWallpaper.title;
    modalImage.src = currentWallpaper.url;

    // Set ambient blur background (same image)
    ambientBlur.src = currentWallpaper.url;

    // Set filename (without extension)
    const filename = getFilenameWithoutExtension(currentWallpaper);
    modalFilename.textContent = filename;

    // Reset resolution to loading state
    modalResolution.textContent = '加载中...';

    // Set category
    modalCategory.textContent = getCategoryName(currentWallpaper.category);

    // Generate and display random tags
    displayRandomTags();

    // Show/hide delete button based on permissions
    const canDelete = currentWallpaper.userId && currentUser &&
        (currentUser.role === 'admin' || currentUser.id === currentWallpaper.userId);

    if (canDelete) {
        deleteBtn.classList.remove('hidden');
    } else {
        deleteBtn.classList.add('hidden');
    }

    // Show/hide edit button based on permissions
    const canEdit = currentWallpaper.userId && currentUser &&
        (currentUser.role === 'admin' || currentUser.id === currentWallpaper.userId);

    if (canEdit) {
        editBtn.classList.remove('hidden');
    } else {
        editBtn.classList.add('hidden');
    }

    // Show modal
    previewModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Detect resolution after image loads
    modalImage.onload = function() {
        const width = this.naturalWidth;
        const height = this.naturalHeight;
        modalResolution.textContent = `${width} x ${height} px`;
    };

    // Handle image load error
    modalImage.onerror = function() {
        modalResolution.textContent = '无法获取分辨率';
    };
}

// Get filename without extension
function getFilenameWithoutExtension(wallpaper) {
    if (!wallpaper.url) return wallpaper.title;

    // For external URLs, extract from path
    try {
        const url = new URL(wallpaper.url, window.location.origin);
        const pathname = url.pathname;
        const filename = pathname.split('/').pop();

        // Remove extension
        if (filename && filename.includes('.')) {
            return filename.replace(/\.[^.]+$/, '');
        }

        // For local uploads or fallback
        return wallpaper.title;
    } catch {
        // For relative URLs or errors
        const parts = wallpaper.url.split('/');
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart.includes('.')) {
            return lastPart.replace(/\.[^.]+$/, '');
        }
        return wallpaper.title;
    }
}

// Display random tags
function displayRandomTags() {
    // If current wallpaper has saved tags, use them; otherwise generate random
    let tagsToShow = [];

    if (currentWallpaper.tags) {
        try {
            tagsToShow = JSON.parse(currentWallpaper.tags);
        } catch {
            tagsToShow = currentWallpaper.tags.split(',').map(t => t.trim()).filter(t => t);
        }
    }

    // If no tags, generate random ones
    if (tagsToShow.length === 0) {
        const allTags = ['4K', 'Mobile', 'Art', 'HD', 'Wallpaper', 'Minimal', 'Abstract', 'Nature', 'Gradient', 'Design'];
        const shuffled = allTags.sort(() => Math.random() - 0.5);
        tagsToShow = shuffled.slice(0, 3);
    }

    modalTags.innerHTML = tagsToShow.map(tag =>
        `<span class="modal-tag">${tag}</span>`
    ).join('');
}

// ============================================================================
// EDIT MODE FUNCTIONS
// ============================================================================

// Toggle edit mode
function toggleEditMode() {
    if (isEditMode) {
        saveChanges();
    } else {
        enterEditMode();
    }
}

// Enter edit mode
function enterEditMode() {
    isEditMode = true;

    // Update button appearance
    editBtnText.textContent = 'Save';
    editIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>';
    editBtn.classList.add('bg-blue-500', 'text-white', 'border-blue-500');

    // Populate edit inputs with current values
    editTitleInput.value = currentWallpaper.title || '';
    editCategorySelect.value = currentWallpaper.category || 'upload';

    // Get current tags
    let currentTags = [];
    if (currentWallpaper.tags) {
        try {
            currentTags = JSON.parse(currentWallpaper.tags);
        } catch {
            currentTags = currentWallpaper.tags.split(',').map(t => t.trim()).filter(t => t);
        }
    }
    editTagsInput.value = currentTags.join(', ');

    // Toggle view/edit elements
    titleViewMode.classList.add('hidden');
    titleEditMode.classList.remove('hidden');

    modalCategory.classList.add('hidden');
    editCategorySelect.classList.remove('hidden');

    modalTags.classList.add('hidden');
    editTagsInput.classList.remove('hidden');

    console.log('[EDIT MODE] Entered edit mode for image:', currentWallpaper.id);
}

// Exit edit mode (without saving)
function exitEditMode() {
    isEditMode = false;

    // Reset button appearance
    editBtnText.textContent = 'Edit';
    editIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>';
    editBtn.classList.remove('bg-blue-500', 'text-white', 'border-blue-500', 'saving');

    // Toggle view/edit elements back
    titleViewMode.classList.remove('hidden');
    titleEditMode.classList.add('hidden');

    modalCategory.classList.remove('hidden');
    editCategorySelect.classList.add('hidden');

    modalTags.classList.remove('hidden');
    editTagsInput.classList.add('hidden');
}

// Save changes
async function saveChanges() {
    if (!currentWallpaper) return;

    // Show saving state
    editBtn.classList.add('saving');
    editBtnText.textContent = 'Saving...';

    const newTitle = editTitleInput.value.trim();
    const newCategory = editCategorySelect.value;
    const newTags = editTagsInput.value.trim();

    // Validate inputs
    if (!newTitle) {
        alert('标题不能为空');
        editBtn.classList.remove('saving');
        editBtnText.textContent = 'Save';
        return;
    }

    // Parse tags into array
    const tagsArray = newTags.split(',').map(t => t.trim()).filter(t => t);
    const tagsJson = JSON.stringify(tagsArray);

    try {
        const response = await fetch(`/api/images/${currentWallpaper.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: newTitle,
                category: newCategory,
                tags: tagsJson
            })
        });

        const result = await response.json();

        if (result.success) {
            console.log('[EDIT] Changes saved successfully:', result);

            // Update local wallpaper object
            const wallpaperIndex = wallpapers.findIndex(w => w.id === currentWallpaper.id);
            if (wallpaperIndex !== -1) {
                wallpapers[wallpaperIndex].title = newTitle;
                wallpapers[wallpaperIndex].category = newCategory;
                wallpapers[wallpaperIndex].tags = tagsJson;
                currentWallpaper = wallpapers[wallpaperIndex];
            }

            // Update UI
            modalTitle.textContent = newTitle;
            modalCategory.textContent = getCategoryName(newCategory);
            displayRandomTags();

            // Re-render gallery to show updated title
            renderGallery(currentFilter);

            // Exit edit mode
            exitEditMode();

            // Show success feedback
            editBtnText.textContent = 'Saved!';
            setTimeout(() => {
                editBtnText.textContent = 'Edit';
            }, 1500);

        } else {
            console.error('[EDIT] Save failed:', result.error);
            alert('保存失败: ' + (result.error || '未知错误'));
            editBtn.classList.remove('saving');
            editBtnText.textContent = 'Save';
        }
    } catch (error) {
        console.error('[EDIT] Save error:', error);
        alert('保存失败: 网络错误');
        editBtn.classList.remove('saving');
        editBtnText.textContent = 'Save';
    }
}

// Close modal
function closeModalFn() {
    previewModal.classList.add('hidden');
    document.body.style.overflow = '';
    currentWallpaper = null;
}

// Download wallpaper from modal
function downloadWallpaper() {
    if (!currentWallpaper) return;

    // Use /download endpoint to trigger proper file download
    window.location.href = `/download?url=${encodeURIComponent(currentWallpaper.url)}`;
}

// Delete wallpaper
async function deleteWallpaper() {
    if (!currentWallpaper || !currentWallpaper.userId) return;

    if (!confirm('确定要删除这张壁纸吗？此操作不可撤销。')) {
        return;
    }

    try {
        const response = await fetch(`/api/images/${currentWallpaper.id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Close modal
            closeModalFn();

            // Reload gallery to update the list
            await loadServerWallpapers();
            renderGallery(currentFilter);
        } else {
            const data = await response.json();
            alert(data.error || '删除失败');
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('删除失败，请重试');
    }
}

// Event listeners
themeToggle.addEventListener('click', toggleTheme);

// Auth event listeners
loginBtn.addEventListener('click', openAuthModal);
closeAuthModal.addEventListener('click', closeAuthModalFn);
authModalBackdrop.addEventListener('click', closeAuthModalFn);
toggleAuthMode.addEventListener('click', toggleAuthModeFn);
logoutBtn.addEventListener('click', logout);

// Login form submit
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    login(username, password);
});

// Register form submit
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    register(username, password);
});

categoryFilters.addEventListener('click', (e) => {
    // Check if clicked element is a filter pill
    const filterPill = e.target.closest('.filter-pill');
    if (filterPill) {
        const category = filterPill.dataset.category;
        filterGallery(category);
    }
});

closeModal.addEventListener('click', closeModalFn);
modalBackdrop.addEventListener('click', closeModalFn);
downloadBtn.addEventListener('click', downloadWallpaper);
deleteBtn.addEventListener('click', deleteWallpaper);
editBtn.addEventListener('click', toggleEditMode);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !previewModal.classList.contains('hidden')) {
        closeModalFn();
    }
});

// Upload functionality - check if user is logged in
uploadBtn.addEventListener('click', () => {
    // Check if user is logged in
    if (!currentUser) {
        openAuthModal();
        return;
    }
    fileInput.click();
});

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show upload indicator
    uploadBtn.innerHTML = `
        <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke-width="4" stroke-opacity="0.25"></circle>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12a8 8 0 018-8v0a8 8 0 018 8v0"></path>
        </svg>
        <span class="hidden sm:inline">上传中...</span>
    `;

    const formData = new FormData();
    formData.append('wallpaper', file);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }

        const result = await response.json();

        if (result.image) {
            console.log('[UPLOAD] Upload successful, ID:', result.image.id);

            // Reload wallpapers from database to ensure sync
            await loadServerWallpapers();

            // Reset filter to "all" so the new image is visible
            currentFilter = 'all';
            document.querySelectorAll('.filter-pill').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.category === 'all') {
                    btn.classList.add('active');
                }
            });

            // Render gallery
            renderGallery(currentFilter);
        }

        // Reset button - success
        uploadBtn.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="hidden sm:inline">上传成功!</span>
        `;

        setTimeout(() => {
            uploadBtn.innerHTML = `
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                </svg>
                <span class="hidden sm:inline">上传壁纸</span>
            `;
        }, 2000);

    } catch (error) {
        console.error('Upload error:', error);
        uploadBtn.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span class="hidden sm:inline">上传失败</span>
        `;

        setTimeout(() => {
            uploadBtn.innerHTML = `
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                </svg>
                <span class="hidden sm:inline">上传壁纸</span>
            `;
        }, 2000);
    }

    // Reset file input
    fileInput.value = '';
});

// Load wallpapers from server
async function loadServerWallpapers() {
    try {
        console.log('[loadServerWallpapers] Fetching images from database...');
        const response = await fetch('/api/images');
        if (!response.ok) {
            console.error('[loadServerWallpapers] Failed to fetch, status:', response.status);
            return;
        }

        const serverImages = await response.json();
        console.log('[loadServerWallpapers] Database returned', serverImages.length, 'images');

        // Log first image for debugging
        if (serverImages.length > 0) {
            console.log('[loadServerWallpapers] First server image data:', {
                id: serverImages[0].id,
                title: serverImages[0].title,
                category: serverImages[0].category,
                tags: serverImages[0].tags
            });
        }

        // Remove old server wallpapers (those with userId) from current array
        const beforeCount = wallpapers.length;
        wallpapers = wallpapers.filter(w => !w.userId);
        console.log('[loadServerWallpapers] Removed', beforeCount - wallpapers.length, 'old database images');

        // Add server images at the BEGINNING (so newest uploads appear first)
        const uploadedWallpapers = serverImages.map(img => ({
            id: img.id,
            title: img.title || img.filename.replace(/^wallpaper-/, '').replace(/\.[^.]+$/, ''), // Use title from database, fallback to filename
            category: img.category || 'upload', // Use category from database
            url: img.url,
            userId: img.userId,
            username: img.username,
            uploadDate: img.uploadDate,
            tags: img.tags // Include tags from database
        }));

        // Put uploaded wallpapers at the beginning, before default wallpapers
        wallpapers = [...uploadedWallpapers, ...wallpapers];

        console.log('[loadServerWallpapers] Total wallpapers:', wallpapers.length);
        console.log('[loadServerWallpapers] Database images:', uploadedWallpapers.length);
        console.log('[loadServerWallpapers] Default images:', wallpapers.length - uploadedWallpapers.length);

        // Log first few database images for debugging
        if (uploadedWallpapers.length > 0) {
            console.log('[loadServerWallpapers] First database image:', uploadedWallpapers[0]);
        }
    } catch (error) {
        console.error('[loadServerWallpapers] Error:', error);
    }
}

// Initialize
console.log('[INIT] Starting application initialization...');

// Wait for DOM to be ready before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

async function initializeApp() {
    console.log('[INIT] DOM ready, initializing app...');

    initTheme();
    checkAuthStatus();  // Check auth status on page load

    // Reset filter state to 'all' on page load
    currentFilter = 'all';

    // Ensure filter buttons show correct state
    document.querySelectorAll('.filter-pill').forEach(btn => {
        if (btn.dataset.category === 'all') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Header scroll effect
    const floatingHeader = document.querySelector('.floating-header');
    let lastScrollY = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        if (scrollY > 50) {
            floatingHeader.classList.add('scrolled');
        } else {
            floatingHeader.classList.remove('scrolled');
        }

        lastScrollY = scrollY;
    });

    // Load wallpapers from database and render gallery
    console.log('[INIT] Loading wallpapers from server...');
    await loadServerWallpapers();
    console.log('[INIT] Rendering gallery with', wallpapers.length, 'total images');
    renderGallery('all');

    console.log('[INIT] App initialization complete!');
}

// SortableJS - Drag and Drop Sorting
let sortableInstance = null;

// Initialize Sortable after gallery is rendered
function initSortable() {
    if (sortableInstance) {
        sortableInstance.destroy();
    }

    sortableInstance = new Sortable(galleryGrid, {
        animation: 300,
        easing: "cubic-bezier(1, 0, 0, 1)",
        ghostClass: "sortable-ghost",
        chosenClass: "sortable-chosen",
        dragClass: "sortable-drag",

        onEnd: function(evt) {
            // Save new order to localStorage
            saveOrder();
        }
    });
}

// Save current order to localStorage
function saveOrder() {
    const itemIds = Array.from(galleryGrid.children).map(item => parseInt(item.dataset.id));
    localStorage.setItem('galleryOrder', JSON.stringify(itemIds));
}

// Load order from localStorage and reorder items
function applySavedOrder() {
    const savedOrder = localStorage.getItem('galleryOrder');
    if (!savedOrder) return;

    try {
        const orderIds = JSON.parse(savedOrder);
        const items = Array.from(galleryGrid.children);

        // Sort items based on saved order
        items.sort((a, b) => {
            const aId = parseInt(a.dataset.id);
            const bId = parseInt(b.dataset.id);
            const aIndex = orderIds.indexOf(aId);
            const bIndex = orderIds.indexOf(bId);

            // If item not in saved order, put it at the end
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;

            return aIndex - bIndex;
        });

        // Reorder DOM
        items.forEach(item => galleryGrid.appendChild(item));
    } catch (error) {
        console.error('Failed to apply saved order:', error);
    }
}

// Override renderGallery to apply saved order after rendering
const originalRenderGallery = renderGallery;
renderGallery = function(filter = 'all') {
    originalRenderGallery(filter);
    // Initialize Sortable after gallery is rendered
    initSortable();
    // Apply saved order
    applySavedOrder();
};

// ============================================================================
// AMBIENT PARTICLE SYSTEM - Frosted Glass Effect
// ============================================================================

/**
 * Particle class - represents a single floating particle
 * Features: smooth floating, mouse interaction with fluorescence effect
 */
class Particle {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.init();
    }

    init() {
        // Position - random placement across canvas
        this.x = Math.random() * this.canvasWidth;
        this.y = Math.random() * this.canvasHeight;

        // Velocity - very slow, ambient floating (0.1 to 0.3 pixels per frame)
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.1 + Math.random() * 0.2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        // Size - varied for depth perception (2 to 6 pixels)
        this.baseRadius = 2 + Math.random() * 4;
        this.radius = this.baseRadius;

        // Opacity - semi-transparent for frosted effect (0.05 to 0.2)
        this.baseOpacity = 0.05 + Math.random() * 0.15;
        this.currentOpacity = this.baseOpacity;
        this.targetOpacity = this.baseOpacity;

        // Color - cool tones (blue-purple) with low saturation
        // Using HSL for easy color manipulation
        const hue = 220 + Math.random() * 60; // 220-280 (blue to purple)
        const saturation = 30 + Math.random() * 20; // 30-50% (low saturation)
        const lightness = 60 + Math.random() * 20; // 60-80% (fairly light)
        this.baseColor = { h: hue, s: saturation, l: lightness };
        this.currentColor = { ...this.baseColor };

        // Fluorescent color (when excited by mouse)
        this.fluorescentColor = { h: 180 + Math.random() * 40, s: 90, l: 70 }; // Cyan to bright purple

        // Animation state
        this.excited = false;
        this.excitementLevel = 0; // 0 to 1
    }

    /**
     * Update particle position and state
     * @param {number} mouseX - Mouse X position
     * @param {number} mouseY - Mouse Y position
     * @param {boolean} mousePresent - Whether mouse is on the page
     */
    update(mouseX, mouseY, mousePresent) {
        // Update position with slow floating
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges (seamless infinite canvas)
        if (this.x < -10) this.x = this.canvasWidth + 10;
        if (this.x > this.canvasWidth + 10) this.x = -10;
        if (this.y < -10) this.y = this.canvasHeight + 10;
        if (this.y > this.canvasHeight + 10) this.y = -10;

        // Mouse interaction - calculate distance
        if (mousePresent) {
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const influenceRadius = 180; // pixels

            if (distance < influenceRadius) {
                // Calculate excitement level (0 to 1) based on distance
                this.excitementLevel = 1 - (distance / influenceRadius);
                this.excited = true;
            } else {
                this.excited = false;
            }
        } else {
            this.excited = false;
        }

        // Smooth decay of excitement
        if (!this.excited && this.excitementLevel > 0) {
            this.excitementLevel *= 0.95; // Decay factor
            if (this.excitementLevel < 0.01) {
                this.excitementLevel = 0;
            }
        }

        // Update visual properties based on excitement
        this.updateVisuals();
    }

    /**
     * Update opacity, color, and radius based on excitement level
     */
    updateVisuals() {
        const e = this.excitementLevel;

        if (e > 0) {
            // Excited state - fluorescent effect
            this.targetOpacity = this.baseOpacity + (0.6 - this.baseOpacity) * e; // Up to 0.6
            this.targetRadius = this.baseRadius * (1 + e * 1.5); // Up to 2.5x size

            // Interpolate color towards fluorescent
            this.currentColor.h = this.lerp(this.baseColor.h, this.fluorescentColor.h, e);
            this.currentColor.s = this.lerp(this.baseColor.s, this.fluorescentColor.s, e);
            this.currentColor.l = this.lerp(this.baseColor.l, this.fluorescentColor.l, e);
        } else {
            // Return to base state
            this.targetOpacity = this.baseOpacity;
            this.targetRadius = this.baseRadius;
            this.currentColor = { ...this.baseColor };
        }

        // Smooth interpolation for opacity and radius
        this.currentOpacity += (this.targetOpacity - this.currentOpacity) * 0.1;
        this.radius += (this.targetRadius - this.radius) * 0.1;
    }

    /**
     * Linear interpolation
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    }

    /**
     * Draw the particle
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {boolean} isDarkMode - Current theme mode
     */
    draw(ctx, isDarkMode) {
        ctx.beginPath();

        // Create frosted glass effect with radial gradient
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );

        const { h, s, l } = this.currentColor;
        const color = `hsla(${h}, ${s}%, ${l}%, ${this.currentOpacity})`;
        const colorTransparent = `hsla(${h}, ${s}%, ${l}%, 0)`;

        gradient.addColorStop(0, color);
        gradient.addColorStop(0.4, `hsla(${h}, ${s}%, ${l}%, ${this.currentOpacity * 0.5})`);
        gradient.addColorStop(1, colorTransparent);

        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Handle canvas resize
     */
    resize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;

        // Reposition if outside bounds
        if (this.x > width) this.x = Math.random() * width;
        if (this.y > height) this.y = Math.random() * height;
    }
}

/**
 * ParticleSystem - manages all particles and animation loop
 */
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('ambient-bg');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.mousePresent = false;
        this.isDarkMode = document.documentElement.classList.contains('dark');

        // Calculate particle count based on screen size (sparse)
        this.calculateParticleCount();

        // Initialize
        this.init();
        this.setupEventListeners();
        this.animate();
    }

    /**
     * Calculate appropriate particle count based on screen area
     * Sparse density for subtle effect
     */
    calculateParticleCount() {
        const area = window.innerWidth * window.innerHeight;
        // Approximately 1 particle per 25,000 pixels (very sparse)
        // Mobile: ~30 particles, Desktop: ~80 particles
        this.particleCount = Math.min(30, Math.floor(area / 25000));
        this.particleCount = Math.max(15, Math.min(100, this.particleCount));
    }

    init() {
        this.resize();
        this.createParticles();
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(new Particle(this.canvas.width, this.canvas.height));
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Update particle bounds
        this.particles.forEach(p => p.resize(this.canvas.width, this.canvas.height));
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.calculateParticleCount();
            this.resize();
            // Recreate particles if count changed significantly
            if (Math.abs(this.particles.length - this.particleCount) > 10) {
                this.createParticles();
            }
        });

        // Mouse tracking
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.mousePresent = true;
        });

        document.addEventListener('mouseleave', () => {
            this.mousePresent = false;
        });

        // Theme change detection
        const observer = new MutationObserver(() => {
            this.isDarkMode = document.documentElement.classList.contains('dark');
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    }

    animate() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles
        this.particles.forEach(particle => {
            particle.update(this.mouseX, this.mouseY, this.mousePresent);
            particle.draw(this.ctx, this.isDarkMode);
        });

        // Continue animation loop
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize particle system
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[ParticleSystem] Initializing on DOMContentLoaded');
        new ParticleSystem();
    });
} else {
    console.log('[ParticleSystem] DOM already loaded, initializing immediately');
    new ParticleSystem();
}

// ============================================================================
// CURSOR SPOTLIGHT - Theme-Aware Blend Mode Effect
// ============================================================================

/**
 * CursorSpotlight - Manages the theme-aware cursor spotlight effect
 * Features: requestAnimationFrame optimization, smooth updates, theme switching
 */
class CursorSpotlight {
    constructor() {
        this.spotlightDark = document.getElementById('cursorSpotlightDark');
        this.spotlightLight = document.getElementById('cursorSpotlightLight');

        if (!this.spotlightDark || !this.spotlightLight) {
            console.warn('[CursorSpotlight] Elements not found');
            return;
        }

        this.cursorX = window.innerWidth / 2;
        this.cursorY = window.innerHeight / 2;
        this.targetX = this.cursorX;
        this.targetY = this.cursorY;
        this.isDarkMode = document.documentElement.classList.contains('dark');

        // Smoothing factor for cursor movement (lower = smoother/slower)
        this.smoothing = 0.15;

        this.init();
    }

    init() {
        // Set initial visibility based on current theme
        this.updateThemeVisibility();

        // Setup event listeners
        this.setupEventListeners();

        // Start animation loop
        this.animate();

        console.log('[CursorSpotlight] Initialized with', this.isDarkMode ? 'Dark Mode' : 'Light Mode');
    }

    setupEventListeners() {
        // Track mouse movement
        document.addEventListener('mousemove', (e) => {
            this.targetX = e.clientX;
            this.targetY = e.clientY;
        });

        // Track touch movement (mobile)
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.targetX = e.touches[0].clientX;
                this.targetY = e.touches[0].clientY;
            }
        }, { passive: true });

        // Handle mouse leave
        document.addEventListener('mouseleave', () => {
            // Move spotlight off-screen when mouse leaves
            this.targetX = -1000;
            this.targetY = -1000;
        });

        // Observe theme changes
        const observer = new MutationObserver(() => {
            const newDarkMode = document.documentElement.classList.contains('dark');
            if (newDarkMode !== this.isDarkMode) {
                this.isDarkMode = newDarkMode;
                this.updateThemeVisibility();
                console.log('[CursorSpotlight] Theme changed to', this.isDarkMode ? 'Dark Mode' : 'Light Mode');
            }
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    }

    updateThemeVisibility() {
        if (this.isDarkMode) {
            // Dark Mode: Show Electric Blue spotlight
            this.spotlightDark.classList.remove('opacity-0');
            this.spotlightDark.classList.add('opacity-100');
            this.spotlightLight.classList.remove('opacity-100');
            this.spotlightLight.classList.add('opacity-0');
        } else {
            // Light Mode: Show Warm Rye spotlight
            this.spotlightLight.classList.remove('opacity-0');
            this.spotlightLight.classList.add('opacity-100');
            this.spotlightDark.classList.remove('opacity-100');
            this.spotlightDark.classList.add('opacity-0');
        }
    }

    animate() {
        // Smooth interpolation (lerp) for cursor position
        const dx = this.targetX - this.cursorX;
        const dy = this.targetY - this.cursorY;

        this.cursorX += dx * this.smoothing;
        this.cursorY += dy * this.smoothing;

        // Update CSS variables for the spotlight position
        document.documentElement.style.setProperty('--cursor-x', `${this.cursorX}px`);
        document.documentElement.style.setProperty('--cursor-y', `${this.cursorY}px`);

        // Continue animation loop
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize cursor spotlight
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[CursorSpotlight] Initializing on DOMContentLoaded');
        new CursorSpotlight();
    });
} else {
    console.log('[CursorSpotlight] DOM already loaded, initializing immediately');
    new CursorSpotlight();
}
