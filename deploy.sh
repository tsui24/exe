#!/bin/bash

# ConstructionIQ Deployment Script for AWS EC2
# This script automates the deployment process

set -e  # Exit on error

echo "==================================="
echo "ConstructionIQ Deployment Script"
echo "==================================="

# Configuration
PROJECT_DIR="/home/ubuntu/ki8_exe"
REPO_URL="YOUR_GIT_REPOSITORY_URL"  # Thay đổi thành git repo của bạn
BRANCH="main"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run as root"
    exit 1
fi

# Update system packages
echo ""
echo "Step 1: Updating system packages..."
sudo apt update
sudo apt upgrade -y
print_success "System packages updated"

# Install required packages
echo ""
echo "Step 2: Installing required packages..."
sudo apt install -y nginx mysql-server python3-pip python3-venv nodejs npm git curl
print_success "Required packages installed"

# Install Node.js 20.x (LTS)
echo ""
echo "Step 3: Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
print_success "Node.js installed: $(node --version)"

# Install pnpm
echo ""
echo "Step 4: Installing pnpm..."
sudo npm install -g pnpm
print_success "pnpm installed: $(pnpm --version)"

# Clone or update repository
echo ""
echo "Step 5: Setting up project directory..."
if [ -d "$PROJECT_DIR" ]; then
    print_warning "Project directory exists, pulling latest changes..."
    cd "$PROJECT_DIR"
    git pull origin $BRANCH
else
    print_warning "Cloning repository..."
    git clone -b $BRANCH "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi
print_success "Project directory ready"

# Setup Python virtual environment
echo ""
echo "Step 6: Setting up Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
pip install -e .
print_success "Python environment ready"

# Setup environment files
echo ""
echo "Step 7: Configuring environment variables..."
if [ ! -f ".env.production" ]; then
    print_warning "Creating .env.production file..."
    cat > .env.production << EOF
# Database Configuration
DATABASE_URL=mysql+pymysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/ki8_exe

# JWT Configuration
SECRET_KEY=$(openssl rand -hex 32)

# OpenAI Configuration
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE

# Next.js Configuration
NEXT_PUBLIC_AI_BACKEND_URL=http://localhost:8002
NODE_ENV=production
EOF
    print_warning "Please edit .env.production and add your credentials!"
    print_warning "MySQL password, OpenAI API key, etc."
else
    print_success ".env.production already exists"
fi

if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
NEXT_PUBLIC_AI_BACKEND_URL=http://your-domain.com/api
NEXT_PUBLIC_UPLOAD_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_QUERY_SERVICE_URL=http://localhost:8001
EOF
fi
print_success "Environment files ready"

# Setup MySQL database
echo ""
echo "Step 8: Setting up MySQL database..."
read -p "Do you want to create MySQL database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Please enter MySQL root password when prompted"
    sudo mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS ki8_exe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
EOF
    print_success "MySQL database created"
fi

# Install Node.js dependencies
echo ""
echo "Step 9: Installing Node.js dependencies..."
pnpm install
print_success "Node.js dependencies installed"

# Build Next.js application
echo ""
echo "Step 10: Building Next.js application..."
pnpm build
print_success "Next.js application built"

# Setup systemd services
echo ""
echo "Step 11: Setting up systemd services..."

# Backend service
sudo cp constructioniq-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable constructioniq-backend.service
print_success "Backend service configured"

# Frontend service
sudo cp constructioniq-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable constructioniq-frontend.service
print_success "Frontend service configured"

# Setup Nginx
echo ""
echo "Step 12: Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/constructioniq
sudo ln -sf /etc/nginx/sites-available/constructioniq /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
print_success "Nginx configured"

# Create log files
echo ""
echo "Step 13: Creating log files..."
sudo touch /var/log/constructioniq-backend.log
sudo touch /var/log/constructioniq-backend-error.log
sudo touch /var/log/constructioniq-frontend.log
sudo touch /var/log/constructioniq-frontend-error.log
sudo chown ubuntu:ubuntu /var/log/constructioniq-*.log
print_success "Log files created"

# Start services
echo ""
echo "Step 14: Starting services..."
sudo systemctl restart constructioniq-backend
sudo systemctl restart constructioniq-frontend
sudo systemctl restart nginx
print_success "All services started"

# Check service status
echo ""
echo "==================================="
echo "Service Status:"
echo "==================================="
sudo systemctl status constructioniq-backend --no-pager -l
echo ""
sudo systemctl status constructioniq-frontend --no-pager -l
echo ""
sudo systemctl status nginx --no-pager -l

echo ""
echo "==================================="
print_success "Deployment completed!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Edit .env.production with your actual credentials"
echo "2. Update nginx.conf with your domain name"
echo "3. Setup SSL certificate with Let's Encrypt (see DEPLOYMENT.md)"
echo "4. Test the application at http://your-server-ip"
echo ""
echo "Useful commands:"
echo "  - Check backend logs: sudo journalctl -u constructioniq-backend -f"
echo "  - Check frontend logs: sudo journalctl -u constructioniq-frontend -f"
echo "  - Restart backend: sudo systemctl restart constructioniq-backend"
echo "  - Restart frontend: sudo systemctl restart constructioniq-frontend"
echo "  - Restart nginx: sudo systemctl restart nginx"
echo ""
