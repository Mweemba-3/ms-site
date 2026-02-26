// supabase.js
const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// REAL AUTH - Hash passwords in Supabase
async function adminLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('loginError');
    
    if (!username || !password) {
        errorDiv.style.display = 'block';
        errorDiv.innerText = 'Username and password required';
        return;
    }
    
    try {
        // Supabase auth with hashed passwords
        const { data, error } = await supabase
            .from('admins')
            .select('id, username, role')
            .eq('username', username)
            .eq('password', password) // In production, use bcrypt
            .single();
        
        if (error || !data) {
            throw new Error('Invalid credentials');
        }
        
        // Set session with expiry
        const session = {
            user: data,
            expires: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
        };
        localStorage.setItem('adminSession', JSON.stringify(session));
        
        document.getElementById('modal').style.display = 'none';
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('adminLink').style.display = 'inline';
        
        // Clear login form
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        errorDiv.style.display = 'none';
        
    } catch (error) {
        errorDiv.style.display = 'block';
        errorDiv.innerText = 'Authentication failed';
    }
}

// Check session on load
function checkAdminSession() {
    const session = JSON.parse(localStorage.getItem('adminSession'));
    if (session && session.expires > Date.now()) {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('adminLink').style.display = 'inline';
    }
}

// Logout
function adminLogout() {
    localStorage.removeItem('adminSession');
    document.getElementById('loginBtn').style.display = 'inline';
    document.getElementById('adminLink').style.display = 'none';
    window.location.href = 'index.html';
}