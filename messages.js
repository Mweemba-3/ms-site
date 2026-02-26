// messages.js - Professional version
async function loadMessages() {
    const container = document.getElementById('messages-container');
    if (!container) return;
    
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .is('parent_message_id', null)
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        container.innerHTML = data.map(msg => `
            <div class="message-bubble ${msg.is_from_admin ? 'own' : ''}">
                <div class="message-sender">
                    ${msg.sender_name}
                    ${msg.is_from_admin ? '<span style="margin-left:5px;">⚡</span>' : ''}
                </div>
                <div>${msg.message}</div>
                <div class="message-time">
                    ${new Date(msg.created_at).toLocaleTimeString()}
                </div>
            </div>
        `).join('');
        
        container.scrollTop = container.scrollHeight;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function sendMessage() {
    const name = document.getElementById('message-name').value.trim() || 'Guest';
    const email = document.getElementById('message-email').value.trim();
    const message = document.getElementById('message-text').value.trim();
    
    if (!message) return;
    
    try {
        const { error } = await supabase
            .from('messages')
            .insert([{ 
                sender_name: name,
                sender_email: email || null,
                message: message,
                is_from_admin: false
            }]);
        
        if (!error) {
            document.getElementById('message-text').value = '';
            loadMessages();
        }
    } catch (error) {
        alert('Failed to send message');
    }
}

// Auto-refresh messages every 10 seconds
setInterval(loadMessages, 10000);