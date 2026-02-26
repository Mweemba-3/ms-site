// main.js - Complete Frontend Application Logic

// ============================================
// MOBILE MENU FUNCTIONALITY
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu
    const menuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('nav');
    const overlay = document.getElementById('menuOverlay');
    
    if (menuBtn && nav && overlay) {
        menuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
            overlay.classList.toggle('active');
            menuBtn.textContent = nav.classList.contains('active') ? '×' : '☰';
        });
        
        overlay.addEventListener('click', () => {
            nav.classList.remove('active');
            overlay.classList.remove('active');
            menuBtn.textContent = '☰';
        });
        
        // Close menu when clicking a link
        nav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                overlay.classList.remove('active');
                menuBtn.textContent = '☰';
            });
        });
    }
    
    // Initialize everything
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
    
    // Set active nav link based on scroll
    setActiveNavLink();
});

// ============================================
// TYPING EFFECT
// ============================================
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

// ============================================
// BINARY RAIN CANVAS
// ============================================
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

// ============================================
// PARTICLE SYSTEM
// ============================================
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
        for (let i = 0; i < 40; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
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

// ============================================
// CUSTOM CURSOR
// ============================================
function initializeCustomCursor() {
    const cursor = document.getElementById('cursor');
    if (!cursor) return;
    
    // Don't initialize on mobile
    if (window.innerWidth <= 768) {
        cursor.style.display = 'none';
        return;
    }
    
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
    const interactiveElements = document.querySelectorAll('a, button, .software-card, .nav-link, .btn, .download-btn');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
    
    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });
}

// ============================================
// ACTIVE NAV LINK ON SCROLL
// ============================================
function setActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ============================================
// LOAD SOFTWARE FROM DATABASE
// ============================================
async function loadSoftware() {
    const grid = document.getElementById('softwareGrid');
    if (!grid) return;
    
    // Show skeletons
    grid.innerHTML = Array(3).fill(0).map(() => 
        '<div class="skeleton"></div>'
    ).join('');
    
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
                                    `<a href="${downloadUrl}" class="download-btn" target="_blank" rel="noopener">⬇ Download APK</a>` : 
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

// ============================================
// LOAD MESSAGES
// ============================================
async function loadMessages() {
    const list = document.getElementById('messagesList');
    if (!list) return;
    
    try {
        const result = await window.messages.getAll();
        
        if (result.success) {
            if (result.data.length === 0) {
                list.innerHTML = `
                    <div class="message-bubble">
                        <div class="message-header">
                            <span class="message-sender">System</span>
                            <span class="message-time">${new Date().toLocaleTimeString()}</span>
                        </div>
                        <div class="message-content">Welcome to the community! Be the first to send a message.</div>
                    </div>
                `;
            } else {
                list.innerHTML = result.data.map(msg => {
                    const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return `
                        <div class="message-bubble ${msg.is_admin ? 'admin' : ''}">
                            <div class="message-header">
                                <span class="message-sender">${msg.sender_name}${msg.is_admin ? ' ⚡' : ''}</span>
                                <span class="message-time">${time}</span>
                            </div>
                            <div class="message-content">${escapeHtml(msg.message)}</div>
                        </div>
                    `;
                }).join('');
            }
            
            // Scroll to bottom
            list.scrollTop = list.scrollHeight;
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Simple HTML escape to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// SEND MESSAGE
// ============================================
window.sendMessage = async function() {
    const nameInput = document.getElementById('messageName');
    const emailInput = document.getElementById('messageEmail');
    const contentInput = document.getElementById('messageContent');
    
    if (!nameInput || !contentInput) return;
    
    const name = nameInput.value.trim() || 'Guest';
    const email = emailInput ? emailInput.value.trim() : null;
    const content = contentInput.value.trim();
    
    if (!content) {
        alert('Please enter a message');
        return;
    }
    
    // Disable button to prevent double sending
    const sendBtn = document.querySelector('.send-btn');
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';
    }
    
    try {
        const result = await window.messages.send({
            sender_name: name,
            sender_email: email,
            message: content,
            is_admin: false
        });
        
        if (result.success) {
            contentInput.value = '';
            await loadMessages(); // Wait for messages to reload
        } else {
            alert('Failed to send message. Please try again.');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Error sending message');
    } finally {
        // Re-enable button
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send Message';
        }
    }
};

// ============================================
// LOGIN MODAL
// ============================================
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
        // Clear inputs
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
    }
};

// ============================================
// AUTHENTICATE ADMIN
// ============================================
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
            // Store session
            localStorage.setItem('admin_session', JSON.stringify({
                user: result.data,
                expires: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
            }));
            
            closeLoginModal();
            window.location.href = 'admin.html';
        } else {
            if (errorDiv) errorDiv.textContent = result.error || 'Invalid credentials';
        }
    } catch (error) {
        console.error('Login error:', error);
        if (errorDiv) errorDiv.textContent = 'Login failed. Check console.';
    }
};

// ============================================
// CLOSE MODAL ON ESCAPE OR CLICK OUTSIDE
// ============================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLoginModal();
    }
});

document.addEventListener('click', (e) => {
    const modal = document.getElementById('loginModal');
    if (e.target === modal) {
        closeLoginModal();
    }
});

// ============================================
// AUTO-REFRESH MESSAGES EVERY 10 SECONDS
// ============================================
setInterval(() => {
    // Only refresh if messages section is visible
    const messagesSection = document.getElementById('community');
    if (messagesSection && isElementInViewport(messagesSection)) {
        loadMessages();
    }
}, 10000);

// Helper to check if element is in viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ============================================
// CLEANUP ON PAGE UNLOAD
// ============================================
window.addEventListener('beforeunload', () => {
    if (window.binaryInterval) {
        clearInterval(window.binaryInterval);
    }
    if (window.particleFrame) {
        cancelAnimationFrame(window.particleFrame);
    }
});

// ============================================
// HANDLE RESIZE EVENTS
// ============================================
let resizeTimer;
window.addEventListener('resize', () => {
    // Throttle resize events
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Re-initialize cursor for desktop/mobile
        if (window.innerWidth <= 768) {
            document.getElementById('cursor')?.style.setProperty('display', 'none');
        } else {
            document.getElementById('cursor')?.style.setProperty('display', 'block');
        }
    }, 250);
});
