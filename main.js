// main.js - Frontend Application Logic (STABLE VERSION)
(function() {
    'use strict';
    
    // Wait for DOM to be fully ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    function initialize() {
        // Initialize everything in sequence, not parallel
        initializeTypingEffect();
        
        // Delay canvas initialization to prevent glitching
        setTimeout(() => {
            initializeBinaryRain();
            initializeParticles();
        }, 100);
        
        initializeCustomCursor();
        
        // Load data after UI is stable
        setTimeout(() => {
            loadSoftware();
            loadMessages();
        }, 200);
    }
    
    // Typing Effect
    function initializeTypingEffect() {
        const element = document.getElementById('typing');
        if (!element) return;
        
        const text = "Enterprise software engineering · Custom applications · Production deployments";
        let index = 0;
        
        function type() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, 40);
            }
        }
        type();
    }
    
    // Binary Rain Canvas (FIXED - prevents glitching)
    function initializeBinaryRain() {
        const canvas = document.getElementById('binary');
        if (!canvas) return;
        
        // Clear any existing animation
        if (window.binaryInterval) {
            clearInterval(window.binaryInterval);
        }
        
        const ctx = canvas.getContext('2d');
        
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        resize();
        window.addEventListener('resize', resize);
        
        const letters = '01';
        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        const drops = Array(columns).fill(1);
        
        function draw() {
            if (!ctx || !canvas) return;
            
            ctx.fillStyle = 'rgba(3, 7, 18, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#00f7ff';
            ctx.font = `${fontSize}px monospace`;
            
            for (let i = 0; i < drops.length; i++) {
                const text = letters[Math.floor(Math.random() * letters.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        
        // Store interval for cleanup
        window.binaryInterval = setInterval(draw, 35);
    }
    
    // Particle System (FIXED - prevents glitching)
    function initializeParticles() {
        const canvas = document.getElementById('particles');
        if (!canvas) return;
        
        // Cancel existing animation
        if (window.particleFrame) {
            cancelAnimationFrame(window.particleFrame);
        }
        
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationActive = true;
        
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        }
        
        function initParticles() {
            particles = [];
            for (let i = 0; i < 40; i++) { // Reduced from 50 for performance
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.3, // Slower movement
                    vy: (Math.random() - 0.5) * 0.3
                });
            }
        }
        
        resize();
        window.addEventListener('resize', resize);
        
        function animate() {
            if (!animationActive || !ctx || !canvas) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = '#00f7ff';
                ctx.fill();
            });
            
            window.particleFrame = requestAnimationFrame(animate);
        }
        
        animate();
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            animationActive = false;
            if (window.particleFrame) {
                cancelAnimationFrame(window.particleFrame);
            }
        });
    }
    
    // Custom Cursor (FIXED - prevents blocking)
    function initializeCustomCursor() {
        const cursor = document.getElementById('cursor');
        if (!cursor) return;
        
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        // Smooth cursor animation
        function animateCursor() {
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
        
        // Add hover effect on interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .software-card, .nav-link, .btn');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }
    
    // Load Software from Database
    async function loadSoftware() {
        const grid = document.getElementById('softwareGrid');
        if (!grid) return;
        
        try {
            const result = await window.software.getAll();
            
            if (result.success && result.data.length > 0) {
                grid.innerHTML = result.data.map(sw => {
                    const downloadUrl = sw.drive_file_id ? 
                        `https://drive.google.com/uc?export=download&id=${sw.drive_file_id}` : 
                        null;
                    
                    return `
                        <div class="software-card">
                            <img src="${sw.image_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400'}" 
                                 alt="${sw.name}"
                                 class="card-image"
                                 loading="lazy"
                                 onerror="this.src='https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400'">
                            <div class="card-content">
                                <h3 class="card-title">${sw.name}</h3>
                                <p class="card-description">${sw.description || ''}</p>
                                <span class="card-category">${sw.category || 'Enterprise'}</span>
                                <div class="card-actions">
                                    ${downloadUrl ? 
                                        `<a href="${downloadUrl}" class="download-btn" target="_blank" rel="noopener">Download APK</a>` : 
                                        sw.playstore_url ?
                                        `<a href="${sw.playstore_url}" class="playstore-link" target="_blank">View on Play Store →</a>` :
                                        '<span style="color:#666;">No download available</span>'
                                    }
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:3rem;">No software available</div>';
            }
        } catch (error) {
            console.error('Error loading software:', error);
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:3rem; color:#ff4444;">Failed to load software</div>';
        }
    }
    
    // Load Messages
    async function loadMessages() {
        const list = document.getElementById('messagesList');
        if (!list) return;
        
        try {
            const result = await window.messages.getAll();
            
            if (result.success) {
                list.innerHTML = result.data.map(msg => `
                    <div class="message-bubble ${msg.is_admin ? 'admin' : ''}">
                        <div class="message-header">
                            <span class="message-sender">${msg.sender_name}</span>
                            <span class="message-time">${new Date(msg.created_at).toLocaleTimeString()}</span>
                        </div>
                        <div class="message-content">${msg.message}</div>
                    </div>
                `).join('');
                
                list.scrollTop = list.scrollHeight;
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }
    
    // Send Message
    window.sendMessage = async function() {
        const name = document.getElementById('messageName')?.value.trim() || 'Guest';
        const email = document.getElementById('messageEmail')?.value.trim() || null;
        const content = document.getElementById('messageContent')?.value.trim();
        
        if (!content) return;
        
        const result = await window.messages.send({
            sender_name: name,
            sender_email: email,
            message: content,
            is_admin: false
        });
        
        if (result.success) {
            document.getElementById('messageContent').value = '';
            loadMessages();
        }
    };
    
    // Login Modal
    window.openLoginModal = function() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'flex';
            // Focus first input
            setTimeout(() => {
                document.getElementById('loginUsername')?.focus();
            }, 100);
        }
    };
    
    window.closeLoginModal = function() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('loginError').textContent = '';
        }
    };
    
    // Authenticate Admin
    window.authenticateAdmin = async function() {
        const username = document.getElementById('loginUsername')?.value;
        const password = document.getElementById('loginPassword')?.value;
        const errorDiv = document.getElementById('loginError');
        
        if (!username || !password) {
            if (errorDiv) errorDiv.textContent = 'Username and password required';
            return;
        }
        
        try {
            const result = await window.admin.login(username, password);
            
            if (result.success) {
                localStorage.setItem('admin_session', JSON.stringify({
                    user: result.data,
                    expires: Date.now() + (8 * 60 * 60 * 1000)
                }));
                
                closeLoginModal();
                window.location.href = 'admin.html';
            } else {
                if (errorDiv) errorDiv.textContent = result.error;
            }
        } catch (error) {
            if (errorDiv) errorDiv.textContent = 'Login failed';
        }
    };
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLoginModal();
        }
    });
    
    // Click outside modal to close
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('loginModal');
        if (e.target === modal) {
            closeLoginModal();
        }
    });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (window.binaryInterval) {
            clearInterval(window.binaryInterval);
        }
        if (window.particleFrame) {
            cancelAnimationFrame(window.particleFrame);
        }
    });
})();