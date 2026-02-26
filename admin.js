// admin.js - Clean Admin Dashboard

(function() {
    'use strict';
    
    // ============================================
    // INITIALIZATION
    // ============================================
    document.addEventListener('DOMContentLoaded', function() {
        if (!checkAuth()) return;
        
        // Initialize components
        initializeMobileMenu();
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
        
        if (!session || session.expires < Date.now()) {
            localStorage.removeItem('admin_session');
            window.location.href = 'index.html';
            return false;
        }
        
        // Show session info
        const sessionInfo = document.getElementById('adminSessionInfo');
        if (sessionInfo && session.user) {
            sessionInfo.textContent = `Logged in as ${session.user.username}`;
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
            menuBtn.addEventListener('click', function() {
                nav.classList.toggle('active');
                overlay.classList.toggle('active');
                menuBtn.textContent = nav.classList.contains('active') ? '×' : '☰';
            });
            
            overlay.addEventListener('click', function() {
                nav.classList.remove('active');
                overlay.classList.remove('active');
                menuBtn.textContent = '☰';
            });
        }
    }
    
    // ============================================
    // EVENT LISTENERS
    // ============================================
    function setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
        
        // Add software form
        const addForm = document.getElementById('addSoftwareForm');
        if (addForm) {
            addForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                await addSoftware();
            });
        }
    }
    
    // ============================================
    // LOGOUT FUNCTION
    // ============================================
    function logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('admin_session');
            window.location.href = 'index.html';
        }
    }
    
    // ============================================
    // UPDATE STATS
    // ============================================
    async function updateStats() {
        try {
            const softwareResult = await window.software.getAll();
            const messagesResult = await window.messages.getAll();
            
            const totalSoftwareEl = document.getElementById('totalSoftware');
            const totalMessagesEl = document.getElementById('totalMessages');
            
            if (softwareResult.success && totalSoftwareEl) {
                totalSoftwareEl.textContent = softwareResult.data.length;
            }
            
            if (messagesResult.success && totalMessagesEl) {
                totalMessagesEl.textContent = messagesResult.data.length;
            }
            
            // Simple download count (if you have it)
            const totalDownloadsEl = document.getElementById('totalDownloads');
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
                            <td colspan="5" class="empty-state">No software added yet.</td>
                        </tr>
                    `;
                } else {
                    list.innerHTML = result.data.map(sw => {
                        const downloadLink = sw.drive_file_id ? 
                            `https://drive.google.com/file/d/${sw.drive_file_id}/view` : null;
                        
                        const date = new Date(sw.created_at).toLocaleDateString();
                        
                        return `
                            <tr>
                                <td><strong style="color:#00f7ff;">${escapeHtml(sw.name)}</strong></td>
                                <td><span class="status-badge">${escapeHtml(sw.category || 'General')}</span></td>
                                <td>
                                    ${downloadLink ? 
                                        `<a href="${downloadLink}" target="_blank" style="color:#00f7ff;">Drive</a>` : 
                                        '<span style="color:#666;">—</span>'}
                                </td>
                                <td>${date}</td>
                                <td>
                                    <button onclick="deleteSoftware(${sw.id})" class="btn-small btn-danger">Delete</button>
                                </td>
                            </tr>
                        `;
                    }).join('');
                }
            }
        } catch (error) {
            console.error('Error loading software:', error);
            list.innerHTML = `<tr><td colspan="5" class="empty-state">Error loading software</td></tr>`;
        }
    }
    
    // ============================================
    // ADD SOFTWARE
    // ============================================
    window.addSoftware = async function() {
        const form = document.getElementById('addSoftwareForm');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding...';
        
        try {
            const formData = new FormData(form);
            
            // Extract drive file ID if it's a full URL
            let driveFileId = formData.get('drive_file_id');
            if (driveFileId && driveFileId.includes('drive.google.com')) {
                const match = driveFileId.match(/[-\w]{25,}/);
                if (match) driveFileId = match[0];
            }
            
            const softwareData = {
                name: formData.get('name'),
                description: formData.get('description') || '',
                category: formData.get('category') || 'General',
                image_url: formData.get('image_url') || '',
                drive_file_id: driveFileId || '',
                playstore_url: formData.get('playstore_url') || ''
            };
            
            const result = await window.software.add(softwareData);
            
            if (result.success) {
                alert('Software added successfully!');
                form.reset();
                await loadSoftwareList();
                await updateStats();
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            alert('Error adding software');
            console.error(error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Software';
        }
    };
    
    // ============================================
    // DELETE SOFTWARE
    // ============================================
    window.deleteSoftware = async function(id) {
        if (!confirm('Delete this software?')) return;
        
        try {
            const result = await window.software.delete(id);
            
            if (result.success) {
                await loadSoftwareList();
                await updateStats();
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            alert('Error deleting software');
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
                            <td colspan="4" class="empty-state">No messages yet</td>
                        </tr>
                    `;
                } else {
                    list.innerHTML = result.data.map(msg => {
                        const date = new Date(msg.created_at).toLocaleString();
                        return `
                            <tr>
                                <td>${escapeHtml(msg.sender_name)}</td>
                                <td>${escapeHtml(msg.message.substring(0, 50))}${msg.message.length > 50 ? '...' : ''}</td>
                                <td>${escapeHtml(msg.sender_email) || '—'}</td>
                                <td>${date}</td>
                            </tr>
                        `;
                    }).join('');
                }
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }
    
    // ============================================
    // HELPER: Escape HTML
    // ============================================
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Make functions global for onclick handlers
    window.logout = logout;
    window.deleteSoftware = deleteSoftware;
    
    // Auto-refresh every 30 seconds
    setInterval(function() {
        if (!document.hidden) {
            loadSoftwareList();
            loadMessageList();
            updateStats();
        }
    }, 30000);
    
})();
