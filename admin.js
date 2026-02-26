// admin.js - Complete Admin Dashboard Functionality

// ============================================
// INITIALIZATION
// ============================================
(function() {
    'use strict';
    
    // Check authentication on load
    document.addEventListener('DOMContentLoaded', function() {
        if (!checkAuth()) return;
        
        // Initialize all components
        initializeMobileMenu();
        initializeTouchEvents();
        loadSoftwareList();
        loadMessageList();
        updateStats();
        setupEventListeners();
    });
    
    // ============================================
    // AUTHENTICATION CHECK
    // ============================================
    function checkAuth() {
        const session = JSON.parse(localStorage.getItem('admin_session'));
        const currentPath = window.location.pathname;
        
        // If no session or expired, redirect to index
        if (!session || session.expires < Date.now()) {
            localStorage.removeItem('admin_session');
            
            // Only redirect if we're on admin page
            if (currentPath.includes('admin.html')) {
                window.location.href = 'index.html';
                return false;
            }
        }
        return true;
    }
    
    // ============================================
    // MOBILE MENU
    // ============================================
    function initializeMobileMenu() {
        const menuBtn = document.getElementById('adminMobileMenuBtn');
        const nav = document.getElementById('adminNav');
        const overlay = document.getElementById('adminMenuOverlay');
        
        if (menuBtn && nav && overlay) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                nav.classList.toggle('active');
                overlay.classList.toggle('active');
                menuBtn.textContent = nav.classList.contains('active') ? '×' : '☰';
                document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
            });
            
            overlay.addEventListener('click', () => {
                nav.classList.remove('active');
                overlay.classList.remove('active');
                menuBtn.textContent = '☰';
                document.body.style.overflow = '';
            });
            
            // Close menu on window resize if open
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768 && nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    overlay.classList.remove('active');
                    menuBtn.textContent = '☰';
                    document.body.style.overflow = '';
                }
            });
        }
    }
    
    // ============================================
    // TOUCH EVENT OPTIMIZATIONS
    // ============================================
    function initializeTouchEvents() {
        // Better touch feedback for buttons
        const buttons = document.querySelectorAll('button, .btn, .nav-link');
        buttons.forEach(btn => {
            btn.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
                this.style.opacity = '0.8';
            });
            
            btn.addEventListener('touchend', function() {
                this.style.transform = '';
                this.style.opacity = '';
            });
            
            btn.addEventListener('touchcancel', function() {
                this.style.transform = '';
                this.style.opacity = '';
            });
        });
        
        // Horizontal scroll hint for tables
        const tableContainers = document.querySelectorAll('.admin-table-container');
        tableContainers.forEach(container => {
            if (container.scrollWidth > container.clientWidth) {
                const hint = document.createElement('div');
                hint.className = 'scroll-hint';
                hint.innerHTML = '← Swipe to scroll →';
                hint.style.cssText = `
                    text-align: center;
                    color: #00f7ff;
                    font-size: 0.8rem;
                    padding: 0.5rem;
                    opacity: 0.7;
                `;
                container.parentNode.insertBefore(hint, container.nextSibling);
                
                // Hide hint after scrolling
                container.addEventListener('scroll', () => {
                    hint.style.opacity = '0.3';
                });
            }
        });
    }
    
    // ============================================
    // EVENT LISTENERS
    // ============================================
    function setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
        
        // Add software form
        const addForm = document.getElementById('addSoftwareForm');
        if (addForm) {
            addForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await addSoftware();
            });
        }
        
        // Handle escape key for any open menus
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const nav = document.getElementById('adminNav');
                const overlay = document.getElementById('adminMenuOverlay');
                const menuBtn = document.getElementById('adminMobileMenuBtn');
                
                if (nav?.classList.contains('active')) {
                    nav.classList.remove('active');
                    overlay?.classList.remove('active');
                    if (menuBtn) menuBtn.textContent = '☰';
                    document.body.style.overflow = '';
                }
            }
        });
    }
    
    // ============================================
    // LOGOUT FUNCTION
    // ============================================
    function logout() {
        // Show confirmation on mobile
        if (window.innerWidth <= 768) {
            if (!confirm('Are you sure you want to logout?')) return;
        }
        
        localStorage.removeItem('admin_session');
        window.location.href = 'index.html';
    }
    
    // ============================================
    // UPDATE STATS DASHBOARD
    // ============================================
    async function updateStats() {
        try {
            const softwareResult = await window.software.getAll();
            const messagesResult = await window.messages.getAll();
            
            const totalSoftwareEl = document.getElementById('totalSoftware');
            const totalMessagesEl = document.getElementById('totalMessages');
            const totalDownloadsEl = document.getElementById('totalDownloads');
            
            if (softwareResult.success && totalSoftwareEl) {
                totalSoftwareEl.textContent = softwareResult.data.length;
            }
            
            if (messagesResult.success && totalMessagesEl) {
                totalMessagesEl.textContent = messagesResult.data.length;
            }
            
            // Calculate total downloads (if you have download tracking)
            if (softwareResult.success && totalDownloadsEl) {
                const totalDownloads = softwareResult.data.reduce((acc, sw) => {
                    return acc + (sw.download_count || 0);
                }, 0);
                totalDownloadsEl.textContent = totalDownloads;
            }
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }
    
    // ============================================
    // LOAD SOFTWARE LIST
    // ============================================
    async function loadSoftwareList() {
        const list = document.getElementById('softwareList');
        if (!list) return;
        
        try {
            const result = await window.software.getAll();
            
            if (result.success) {
                if (result.data.length === 0) {
                    list.innerHTML = `
                        <tr>
                            <td colspan="5" class="empty-state">No software added yet. Add your first software above.</td>
                        </tr>
                    `;
                } else {
                    list.innerHTML = result.data.map(sw => {
                        const downloadLink = sw.drive_file_id ? 
                            `https://drive.google.com/file/d/${sw.drive_file_id}/view` : 
                            null;
                        
                        const date = new Date(sw.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        });
                        
                        return `
                            <tr>
                                <td><strong style="color:#00f7ff;">${escapeHtml(sw.name)}</strong></td>
                                <td><span class="status-badge">${escapeHtml(sw.category || 'Uncategorized')}</span></td>
                                <td>
                                    ${downloadLink ? 
                                        `<a href="${downloadLink}" target="_blank" style="color:#00f7ff; text-decoration:none;" class="download-link">📦 Drive</a>` : 
                                        '<span style="color:#666;">No file</span>'
                                    }
                                </td>
                                <td>${date}</td>
                                <td class="action-buttons">
                                    <button onclick="deleteSoftware(${sw.id})" class="btn btn-small btn-danger">Delete</button>
                                </td>
                            </tr>
                        `;
                    }).join('');
                }
            } else {
                list.innerHTML = `
                    <tr>
                        <td colspan="5" class="empty-state" style="color:#ff4444;">Error loading software. Please refresh.</td>
                    </tr>
                `;
            }
        } catch (error) {
            console.error('Error loading software list:', error);
            list.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state" style="color:#ff4444;">Failed to load software</td>
                </tr>
            `;
        }
    }
    
    // ============================================
    // ADD SOFTWARE
    // ============================================
    window.addSoftware = async function() {
        const form = document.getElementById('addSoftwareForm');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Disable button to prevent double submission
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding...';
        
        try {
            const formData = new FormData(form);
            
            // Extract drive file ID if it's a full URL
            let driveFileId = formData.get('drive_file_id');
            if (driveFileId && driveFileId.includes('drive.google.com')) {
                // Extract ID from full URL
                const match = driveFileId.match(/[-\w]{25,}/);
                if (match) driveFileId = match[0];
            }
            
            // Validate required fields
            const name = formData.get('name');
            if (!name) {
                throw new Error('Software name is required');
            }
            
            const softwareData = {
                name: name,
                description: formData.get('description') || '',
                category: formData.get('category') || 'General',
                image_url: formData.get('image_url') || '',
                drive_file_id: driveFileId || '',
                playstore_url: formData.get('playstore_url') || ''
            };
            
            const result = await window.software.add(softwareData);
            
            if (result.success) {
                // Show success message
                alert('✅ Software added successfully!');
                
                // Reset form
                form.reset();
                
                // Reload lists
                await loadSoftwareList();
                await updateStats();
            } else {
                throw new Error(result.error || 'Failed to add software');
            }
        } catch (error) {
            console.error('Error adding software:', error);
            alert('❌ ' + (error.message || 'Error adding software'));
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Software';
        }
    };
    
    // ============================================
    // DELETE SOFTWARE
    // ============================================
    window.deleteSoftware = async function(id) {
        // Confirm on both desktop and mobile
        if (!confirm('⚠️ Are you sure you want to delete this software? This action cannot be undone.')) {
            return;
        }
        
        try {
            const result = await window.software.delete(id);
            
            if (result.success) {
                // Show brief success
                if (window.innerWidth <= 768) {
                    // On mobile, just reload without alert
                    await loadSoftwareList();
                    await updateStats();
                } else {
                    alert('✅ Software deleted successfully');
                    await loadSoftwareList();
                    await updateStats();
                }
            } else {
                throw new Error(result.error || 'Failed to delete software');
            }
        } catch (error) {
            console.error('Error deleting software:', error);
            alert('❌ ' + (error.message || 'Error deleting software'));
        }
    };
    
    // ============================================
    // LOAD MESSAGE LIST
    // ============================================
    async function loadMessageList() {
        const list = document.getElementById('messageList');
        if (!list) return;
        
        try {
            const result = await window.messages.getAll();
            
            if (result.success) {
                if (result.data.length === 0) {
                    list.innerHTML = `
                        <tr>
                            <td colspan="4" class="empty-state">No messages yet from the community.</td>
                        </tr>
                    `;
                } else {
                    list.innerHTML = result.data.map(msg => {
                        const date = new Date(msg.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        
                        return `
                            <tr>
                                <td>
                                    <strong>${escapeHtml(msg.sender_name)}</strong>
                                    ${msg.is_admin ? '<span style="color:#00f7ff; margin-left:4px;">⚡</span>' : ''}
                                </td>
                                <td>${escapeHtml(msg.message.substring(0, 50))}${msg.message.length > 50 ? '...' : ''}</td>
                                <td>${escapeHtml(msg.sender_email) || '<span style="color:#666;">—</span>'}</td>
                                <td style="font-size:0.8rem; color:#666;">${date}</td>
                            </tr>
                        `;
                    }).join('');
                }
            } else {
                list.innerHTML = `
                    <tr>
                        <td colspan="4" class="empty-state" style="color:#ff4444;">Error loading messages</td>
                    </tr>
                `;
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            list.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state" style="color:#ff4444;">Failed to load messages</td>
                </tr>
            `;
        }
    }
    
    // ============================================
    // AUTO-REFRESH (every 30 seconds)
    // ============================================
    setInterval(() => {
        // Only refresh if page is visible
        if (!document.hidden) {
            loadSoftwareList();
            loadMessageList();
            updateStats();
        }
    }, 30000);
    
    // ============================================
    // HELPER: Escape HTML to prevent XSS
    // ============================================
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // ============================================
    // NETWORK STATUS HANDLER
    // ============================================
    window.addEventListener('online', () => {
        // Show brief online notification
        const toast = document.createElement('div');
        toast.textContent = '📶 Back online';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #00f7ff;
            color: #030712;
            padding: 10px 20px;
            border-radius: 30px;
            z-index: 9999;
            font-weight: bold;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
        
        // Refresh data
        loadSoftwareList();
        loadMessageList();
        updateStats();
    });
    
    window.addEventListener('offline', () => {
        // Show offline warning
        const toast = document.createElement('div');
        toast.textContent = '📴 You are offline';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff4444;
            color: white;
            padding: 10px 20px;
            border-radius: 30px;
            z-index: 9999;
            font-weight: bold;
        `;
        document.body.appendChild(toast);
    });
    
})();
