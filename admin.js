// admin.js - Admin Dashboard
(function() {
    'use strict';
    
    // Check authentication
    function checkAuth() {
        const session = JSON.parse(localStorage.getItem('admin_session'));
        if (!session || session.expires < Date.now()) {
            localStorage.removeItem('admin_session');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
    
    // Initialize admin page
    document.addEventListener('DOMContentLoaded', function() {
        if (!checkAuth()) return;
        
        loadSoftwareList();
        loadMessageList();
        setupEventListeners();
    });
    
    function setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('admin_session');
                window.location.href = 'index.html';
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
    
    async function loadSoftwareList() {
        const list = document.getElementById('softwareList');
        if (!list) return;
        
        const result = await window.software.getAll();
        
        if (result.success) {
            list.innerHTML = result.data.map(sw => {
                const downloadLink = sw.drive_file_id ? 
                    `https://drive.google.com/file/d/${sw.drive_file_id}/view` : 
                    '#';
                
                return `
                    <tr>
                        <td>${sw.name}</td>
                        <td>${sw.category || '-'}</td>
                        <td>
                            ${sw.drive_file_id ? 
                                `<a href="${downloadLink}" target="_blank" style="color:#00f7ff;">Drive File</a>` : 
                                '-'
                            }
                        </td>
                        <td>${new Date(sw.created_at).toLocaleDateString()}</td>
                        <td>
                            <button onclick="deleteSoftware(${sw.id})" class="btn btn-outline btn-small">Delete</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }
    
    window.addSoftware = async function() {
        const form = document.getElementById('addSoftwareForm');
        const formData = new FormData(form);
        
        // Extract drive file ID if it's a full URL
        let driveFileId = formData.get('drive_file_id');
        if (driveFileId && driveFileId.includes('drive.google.com')) {
            // Extract ID from full URL
            const match = driveFileId.match(/[-\w]{25,}/);
            if (match) driveFileId = match[0];
        }
        
        const softwareData = {
            name: formData.get('name'),
            description: formData.get('description'),
            category: formData.get('category'),
            image_url: formData.get('image_url'), // Cloudinary URL
            drive_file_id: driveFileId, // Google Drive ID only
            playstore_url: formData.get('playstore_url')
        };
        
        const result = await window.software.add(softwareData);
        
        if (result.success) {
            form.reset();
            loadSoftwareList();
            alert('Software added successfully!');
        } else {
            alert('Error adding software: ' + result.error);
        }
    };
    
    window.deleteSoftware = async function(id) {
        if (!confirm('Delete this software?')) return;
        
        const result = await window.software.delete(id);
        
        if (result.success) {
            loadSoftwareList();
        } else {
            alert('Error deleting software: ' + result.error);
        }
    };
    
    async function loadMessageList() {
        const list = document.getElementById('messageList');
        if (!list) return;
        
        const result = await window.messages.getAll();
        
        if (result.success) {
            list.innerHTML = result.data.map(msg => `
                <tr>
                    <td>${msg.sender_name}</td>
                    <td>${msg.message.substring(0, 50)}${msg.message.length > 50 ? '...' : ''}</td>
                    <td>${msg.sender_email || '-'}</td>
                    <td>${new Date(msg.created_at).toLocaleString()}</td>
                </tr>
            `).join('');
        }
    }
})();