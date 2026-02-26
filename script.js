// ========== YOUR ORIGINAL CODE ==========
// TYPING EFFECT
const text = "We build apps. Rent software. Sell digital systems. Scale innovation.";
let i = 0;
function type() {
    if (i < text.length) {
        document.getElementById("typing").innerHTML += text.charAt(i);
        i++;
        setTimeout(type, 40);
    }
}
type();

// COUNTERS
document.querySelectorAll('.counter').forEach(counter => {
    const update = () => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const inc = target / 100;
        if (count < target) {
            counter.innerText = Math.ceil(count + inc);
            setTimeout(update, 20);
        } else counter.innerText = target;
    }
    update();
});

// CURSOR
const cursor = document.getElementById("cursor");
document.addEventListener("mousemove", e => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
});

// BINARY RAIN
const binary = document.getElementById("binary");
const ctx = binary.getContext("2d");
binary.width = window.innerWidth;
binary.height = window.innerHeight;
const letters = "01";
const fontSize = 14;
const columns = binary.width / fontSize;
const drops = [];
for (let x = 0; x < columns; x++) drops[x] = 1;
function draw() {
    ctx.fillStyle = "rgba(3,7,18,0.05)";
    ctx.fillRect(0, 0, binary.width, binary.height);
    ctx.fillStyle = "#00f7ff";
    ctx.font = fontSize + "px monospace";
    for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > binary.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}
setInterval(draw, 35);

// PARTICLES
const particles = document.getElementById("particles");
const pctx = particles.getContext("2d");
particles.width = window.innerWidth;
particles.height = window.innerHeight;
let particlesArray = [];
for (let i = 0; i < 80; i++) {
    particlesArray.push({
        x: Math.random() * particles.width,
        y: Math.random() * particles.height,
        vx: (Math.random() - .5) * 1,
        vy: (Math.random() - .5) * 1
    });
}
function animateParticles() {
    pctx.clearRect(0, 0, particles.width, particles.height);
    particlesArray.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > particles.width) p.vx *= -1;
        if (p.y < 0 || p.y > particles.height) p.vy *= -1;
        pctx.beginPath();
        pctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        pctx.fillStyle = "#00f7ff";
        pctx.fill();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ========== NEW FUNCTIONALITY ==========
// MODAL CONTROLS
function openModal() {
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('loginError').style.display = 'none';
}

// REPLACE your adminLogin function with this:
async function adminLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    console.log('Login attempt:', username); // Debug
    
    if (!username || !password) {
        errorDiv.style.display = 'block';
        errorDiv.innerText = 'Username and password required';
        return;
    }
    
    try {
        // First, test if we can connect to Supabase
        console.log('Supabase client:', supabase);
        
        // Try to get any data from admins table
        const { data: testData, error: testError } = await supabase
            .from('admins')
            .select('count');
        
        console.log('Table check:', testData, testError);
        
        // Now try the actual login
        const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('username', username)
            .eq('password', password);
        
        console.log('Login result:', data, error);
        
        if (error) {
            console.error('Supabase error:', error);
            errorDiv.style.display = 'block';
            errorDiv.innerText = 'Database error: ' + error.message;
            return;
        }
        
        if (!data || data.length === 0) {
            errorDiv.style.display = 'block';
            errorDiv.innerText = 'Invalid credentials';
            return;
        }
        
        // Success!
        const admin = data[0];
        localStorage.setItem('admin', JSON.stringify({
            id: admin.id,
            username: admin.username,
            expires: Date.now() + (8 * 60 * 60 * 1000)
        }));
        
        closeModal();
        window.location.href = 'admin.html';
        
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.style.display = 'block';
        errorDiv.innerText = 'Connection error: ' + error.message;
    }
}

// LOAD SOFTWARE WITH DOWNLOAD BUTTONS
async function loadSoftware() {
    const grid = document.getElementById('software-grid');
    if (!grid) return;
    
    // Show skeletons
    grid.innerHTML = `
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
    `;
    
    try {
        const { data, error } = await supabase
            .from('software')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            grid.innerHTML = data.map(app => `
                <div class="card" style="padding:0; overflow:hidden;">
                    <img src="${app.image_url || 'https://via.placeholder.com/400x200'}" style="width:100%; height:150px; object-fit:cover;">
                    <div style="padding:20px;">
                        <h3 style="color:#00f7ff;">${app.name}</h3>
                        <p style="color:#cbd5ff; font-size:14px; margin:10px 0;">${app.description}</p>
                        <div style="display:flex; gap:10px; margin:15px 0;">
                            <span style="background:#00f7ff33; padding:5px 10px; border-radius:15px; font-size:12px;">${app.category || 'General'}</span>
                        </div>
                        ${app.cloudinary_url ? `
                            <a href="${app.cloudinary_url}" download class="download-btn" style="display:inline-block; text-decoration:none;">
                                ⬇️ Download APK
                            </a>
                        ` : `
                            <a href="${app.google_play_url || '#'}" target="_blank" style="color:#00f7ff; text-decoration:none;">
                                View on Play Store →
                            </a>
                        `}
                    </div>
                </div>
            `).join('');
        } else {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center;">No applications yet</div>';
        }
    } catch (error) {
        console.error('Error:', error);
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center;">Error loading software</div>';
    }
}

// MESSAGING
async function loadMessages() {
    const container = document.getElementById('messages-container');
    if (!container) return;
    
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        container.innerHTML = data.map(msg => `
            <div class="message-bubble ${msg.is_from_admin ? 'own' : ''}">
                <div style="color:#00f7ff; font-size:14px;">${msg.sender_name}</div>
                <div style="margin:5px 0;">${msg.message}</div>
                <div style="color:#666; font-size:10px;">${new Date(msg.created_at).toLocaleTimeString()}</div>
            </div>
        `).join('');
        
        container.scrollTop = container.scrollHeight;
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

async function sendMessage() {
    const name = document.getElementById('msgName')?.value || 'Guest';
    const email = document.getElementById('msgEmail')?.value;
    const message = document.getElementById('msgText')?.value;
    
    if (!message) return;
    
    try {
        const { error } = await supabase
            .from('messages')
            .insert([{
                sender_name: name,
                sender_email: email,
                message: message,
                is_from_admin: false
            }]);
        
        if (!error) {
            document.getElementById('msgText').value = '';
            loadMessages();
        }
    } catch (error) {
        alert('Failed to send message');
    }
}

// Initialize on load
window.onload = function() {
    loadSoftware();
    loadMessages();
    
    // Check if admin is logged in
    const admin = localStorage.getItem('admin');
    if (admin) {
        // Could add admin indicator here
    }
};

// Auto-refresh messages every 10 seconds
setInterval(loadMessages, 10000);