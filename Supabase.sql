-- Production Schema
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS software (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    image_url TEXT,
    download_url TEXT,
    playstore_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_name TEXT NOT NULL,
    sender_email TEXT,
    message TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admins
INSERT INTO admins (username, password) VALUES
    ('admin', 'admin123'),
    ('harry', 'admin123'),
    ('mweemba', 'admin123')
ON CONFLICT (username) DO NOTHING;

-- Enable RLS but allow public read for messages and software
ALTER TABLE software ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read software" ON software FOR SELECT USING (true);
CREATE POLICY "Allow admin all software" ON software FOR ALL USING (true);

CREATE POLICY "Allow public read messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert messages" ON messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin read admins" ON admins FOR SELECT USING (true);