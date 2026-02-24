#!/bin/bash
# Run these commands on EC2 server after uploading files

echo "=== Setting up on EC2 ==="

# Navigate to project
cd /home/ubuntu/constructioniq

# Activate virtual environment
source venv/bin/activate

# Install new Python packages
echo "Installing Python packages..."
pip install google-genai Pillow

# Update nginx configuration for larger file uploads
echo "Updating nginx configuration..."
sudo bash -c 'cat > /etc/nginx/sites-available/constructioniq.com.vn << EOF
server {
    listen 80;
    server_name constructioniq.com.vn www.constructioniq.com.vn;

    client_max_body_size 50M;  # Allow 50MB uploads

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/ {
        proxy_pass http://localhost:8002/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
}
EOF'

# Test nginx configuration
echo "Testing nginx configuration..."
sudo nginx -t

# Restart nginx
echo "Restarting nginx..."
sudo systemctl restart nginx

# Restart backend
echo "Restarting backend..."
sudo systemctl restart backend

# Check backend status
echo "Backend status:"
sudo systemctl status backend --no-pager

# Install frontend dependencies and rebuild
echo "Installing frontend dependencies..."
npm install

# Build frontend
echo "Building frontend..."
npm run build

# Restart frontend
echo "Restarting frontend with PM2..."
pm2 restart frontend

# Show PM2 status
echo "PM2 status:"
pm2 status

echo "=== Deployment complete ==="
echo "Check your site at: http://constructioniq.com.vn"
