# ConstructionIQ - AWS EC2 Deployment Guide

## 📋 Yêu Cầu Hệ Thống

- **EC2 Instance**: t2.medium hoặc cao hơn (2 vCPU, 4GB RAM)
- **OS**: Ubuntu 22.04 LTS
- **Storage**: Tối thiểu 20GB
- **Security Group**: Ports 80, 443, 22 mở

## 🚀 Hướng Dẫn Deploy Nhanh

### 1. Chuẩn Bị EC2 Instance

```bash
# SSH vào EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Clone repository
git clone YOUR_REPOSITORY_URL ki8_exe
cd ki8_exe

# Chạy deployment script
chmod +x deploy.sh
./deploy.sh
```

### 2. Cấu Hình Environment Variables

Sau khi chạy `deploy.sh`, chỉnh sửa file `.env.production`:

```bash
nano .env.production
```

**Cập nhật các giá trị sau:**

```bash
# Database - Thay YOUR_MYSQL_PASSWORD
DATABASE_URL=mysql+pymysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/ki8_exe

# JWT Secret - Đã tự động generate, giữ nguyên
SECRET_KEY=your-auto-generated-secret-key

# OpenAI API Key - Thêm key của bạn
OPENAI_API_KEY=sk-your-openai-api-key-here

# Frontend URL - Thay your-domain.com
NEXT_PUBLIC_AI_BACKEND_URL=http://your-domain.com/api
```

### 3. Cấu Hình Nginx với Domain

Chỉnh sửa file nginx:

```bash
sudo nano /etc/nginx/sites-available/constructioniq
```

Thay đổi `server_name`:

```nginx
server_name your-domain.com www.your-domain.com;
```

Restart Nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Setup SSL với Let's Encrypt (Khuyến Nghị)

```bash
# Cài đặt Certbot
sudo apt install certbot python3-certbot-nginx -y

# Tạo SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Certificate sẽ tự động renew
sudo certbot renew --dry-run
```

### 5. Khởi Động Services

```bash
# Restart tất cả services
sudo systemctl restart constructioniq-backend
sudo systemctl restart constructioniq-frontend
sudo systemctl restart nginx

# Kiểm tra trạng thái
sudo systemctl status constructioniq-backend
sudo systemctl status constructioniq-frontend
sudo systemctl status nginx
```

## 📊 Kiểm Tra & Monitoring

### Check Service Logs

```bash
# Backend logs
sudo journalctl -u constructioniq-backend -f

# Frontend logs
sudo journalctl -u constructioniq-frontend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs
sudo tail -f /var/log/constructioniq-backend.log
sudo tail -f /var/log/constructioniq-frontend.log
```

### Health Checks

```bash
# Backend health check
curl http://localhost:8002/health

# Frontend check
curl http://localhost:3000

# Full API check
curl http://your-domain.com/api/health
```

## 🔧 Quản Lý Services

### Restart Services

```bash
# Restart backend
sudo systemctl restart constructioniq-backend

# Restart frontend
sudo systemctl restart constructioniq-frontend

# Restart nginx
sudo systemctl restart nginx

# Restart tất cả
sudo systemctl restart constructioniq-backend constructioniq-frontend nginx
```

### Stop/Start Services

```bash
# Stop
sudo systemctl stop constructioniq-backend
sudo systemctl stop constructioniq-frontend

# Start
sudo systemctl start constructioniq-backend
sudo systemctl start constructioniq-frontend
```

### Enable/Disable Auto-start

```bash
# Enable (tự động khởi động khi boot)
sudo systemctl enable constructioniq-backend
sudo systemctl enable constructioniq-frontend

# Disable
sudo systemctl disable constructioniq-backend
sudo systemctl disable constructioniq-frontend
```

## 🔄 Update & Redeploy

Khi có code mới:

```bash
cd /home/ubuntu/ki8_exe

# Pull latest code
git pull origin main

# Update backend
source venv/bin/activate
pip install -e .
sudo systemctl restart constructioniq-backend

# Update frontend
pnpm install
pnpm build
sudo systemctl restart constructioniq-frontend
```

## 🗄️ Database Management

### Backup Database

```bash
# Backup
mysqldump -u root -p ki8_exe > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
mysql -u root -p ki8_exe < backup_20260203_120000.sql
```

### Reset Database

```bash
mysql -u root -p

DROP DATABASE ki8_exe;
CREATE DATABASE ki8_exe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# Tables sẽ tự động tạo khi backend restart
sudo systemctl restart constructioniq-backend
```

## 🔐 Security Checklist

- [ ] SSL Certificate được cài đặt (HTTPS)
- [ ] MySQL password mạnh
- [ ] JWT SECRET_KEY random và mạnh
- [ ] Firewall được cấu hình đúng (chỉ mở port 80, 443, 22)
- [ ] SSH key authentication (disable password login)
- [ ] Regular system updates
- [ ] Backup database định kỳ
- [ ] Log rotation được setup

### Setup Firewall (UFW)

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

### Secure MySQL

```bash
sudo mysql_secure_installation
```

## 📱 Testing API Endpoints

### Register User

```bash
curl -X POST http://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "full_name": "Test User"
  }'
```

### Login

```bash
curl -X POST http://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Current User

```bash
curl -X GET http://your-domain.com/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Chat API

```bash
curl -X POST http://your-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "message": "Hello, how are you?"
  }'
```

## 🐛 Troubleshooting

### Backend không khởi động

```bash
# Check logs
sudo journalctl -u constructioniq-backend -n 50

# Common issues:
# - Database connection: Check DATABASE_URL in .env.production
# - Missing dependencies: source venv/bin/activate && pip install -e .
# - Port already in use: sudo lsof -i :8002
```

### Frontend không khởi động

```bash
# Check logs
sudo journalctl -u constructioniq-frontend -n 50

# Common issues:
# - Build failed: cd /home/ubuntu/ki8_exe && pnpm build
# - Port in use: sudo lsof -i :3000
# - Environment variables: Check .env.local
```

### Nginx 502 Bad Gateway

```bash
# Check if services are running
sudo systemctl status constructioniq-backend
sudo systemctl status constructioniq-frontend

# Check nginx error log
sudo tail -f /var/log/nginx/error.log

# Test nginx config
sudo nginx -t
```

### Database Connection Issues

```bash
# Test MySQL connection
mysql -u root -p

# Check if database exists
SHOW DATABASES;

# Check if tables exist
USE ki8_exe;
SHOW TABLES;

# If tables don't exist, restart backend
sudo systemctl restart constructioniq-backend
```

## 📈 Performance Optimization

### Enable Nginx Caching

```nginx
# Add to nginx.conf
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m inactive=60m;

location / {
    proxy_cache my_cache;
    proxy_cache_valid 200 60m;
    # ... other proxy settings
}
```

### PM2 for Better Process Management (Alternative)

```bash
# Install PM2
sudo npm install -g pm2

# Start backend with PM2
pm2 start "python -m backend_ai.main" --name constructioniq-backend

# Start frontend with PM2
pm2 start npm --name constructioniq-frontend -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🔍 Monitoring Setup

### Setup Basic Monitoring

```bash
# Install htop for system monitoring
sudo apt install htop

# Monitor resources
htop

# Check disk usage
df -h

# Check memory usage
free -h

# Check network
sudo netstat -tulpn | grep LISTEN
```

## 📞 Support

Nếu gặp vấn đề, kiểm tra:

1. Service logs: `sudo journalctl -u constructioniq-backend -f`
2. Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Application logs: `sudo tail -f /var/log/constructioniq-backend.log`

## 🎉 Post-Deployment Checklist

- [ ] Services đang chạy (backend, frontend, nginx)
- [ ] SSL certificate được cài đặt
- [ ] Domain trỏ đúng IP
- [ ] Health checks pass
- [ ] Test register/login functionality
- [ ] Test chat API với OpenAI
- [ ] Backup database
- [ ] Document credentials safely
- [ ] Setup monitoring/alerts (optional)

## 📝 Important Files Location

```
/home/ubuntu/ki8_exe/                           # Project root
├── .env.production                             # Environment variables
├── backend_ai/                                 # Backend code
├── app/                                        # Frontend code
├── venv/                                       # Python virtual environment
└── node_modules/                               # Node.js dependencies

/etc/nginx/sites-available/constructioniq       # Nginx config
/etc/systemd/system/constructioniq-*.service    # Systemd services
/var/log/constructioniq-*.log                   # Application logs
/var/log/nginx/                                 # Nginx logs
```
