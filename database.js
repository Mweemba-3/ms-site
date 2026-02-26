// database.js - Supabase Client & Database Operations
(function() {
    // Initialize Supabase client
    window.db = supabase.createClient(
        window.APP_CONFIG.SUPABASE_URL,
        window.APP_CONFIG.SUPABASE_ANON_KEY
    );
    
    console.log('✅ Database client initialized');
    
    // Software operations
    window.software = {
        // Get all software
        getAll: async function() {
            try {
                const { data, error } = await window.db
                    .from('software')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                
                // Convert drive_file_id to download_url for display
                const processedData = data.map(item => ({
                    ...item,
                    download_url: item.drive_file_id ? 
                        `https://drive.google.com/uc?export=download&id=${item.drive_file_id}` : 
                        null
                }));
                
                return { success: true, data: processedData };
            } catch (error) {
                console.error('Error fetching software:', error);
                return { success: false, error: error.message };
            }
        },
        
        // Add new software
        add: async function(softwareData) {
            try {
                // Only store the drive_file_id, not the full URL
                const { data, error } = await window.db
                    .from('software')
                    .insert([{
                        name: softwareData.name,
                        description: softwareData.description,
                        category: softwareData.category,
                        image_url: softwareData.image_url, // Cloudinary URL
                        drive_file_id: softwareData.drive_file_id, // Google Drive ID
                        playstore_url: softwareData.playstore_url
                    }])
                    .select();
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Error adding software:', error);
                return { success: false, error: error.message };
            }
        },
        
        // Delete software
        delete: async function(id) {
            try {
                const { error } = await window.db
                    .from('software')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                return { success: true };
            } catch (error) {
                console.error('Error deleting software:', error);
                return { success: false, error: error.message };
            }
        }
    };
    
    // Message operations
    window.messages = {
        // Get all messages
        getAll: async function() {
            try {
                const { data, error } = await window.db
                    .from('messages')
                    .select('*')
                    .order('created_at', { ascending: true });
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Error fetching messages:', error);
                return { success: false, error: error.message };
            }
        },
        
        // Send message
        send: async function(messageData) {
            try {
                const { data, error } = await window.db
                    .from('messages')
                    .insert([messageData])
                    .select();
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Error sending message:', error);
                return { success: false, error: error.message };
            }
        }
    };
    
    // Admin operations
    window.admin = {
        // Authenticate admin
        login: async function(username, password) {
            try {
                const { data, error } = await window.db
                    .from('admins')
                    .select('id, username')
                    .eq('username', username)
                    .eq('password', password)
                    .single();
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Login error:', error);
                return { success: false, error: 'Invalid credentials' };
            }
        }
    };
})();