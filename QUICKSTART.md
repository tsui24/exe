# Quick Start Guide - Local Development

## Prerequisites

- Node.js 18+ và pnpm
- Python 3.10+
- MySQL 8.0+
- OpenAI API Key

## 1. Setup Backend

```bash
# Tạo virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -e .

# Tạo database
mysql -u root -p
CREATE DATABASE ki8_exe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# Tạo file .env trong backend_ai/
cd backend_ai
cp .env.example .env

# Edit .env với thông tin của bạn:
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/ki8_exe
SECRET_KEY=your-secret-key
OPENAI_API_KEY=sk-your-key

# Chạy backend
python -m backend_ai.main
# Backend sẽ chạy tại http://localhost:8002
```

## 2. Setup Frontend

```bash
# Cài đặt dependencies
pnpm install

# Tạo file .env.local
cp .env.local.example .env.local

# Edit .env.local:
NEXT_PUBLIC_AI_BACKEND_URL=http://localhost:8002

# Chạy development server
pnpm dev
# Frontend sẽ chạy tại http://localhost:3000
```

## 3. Test Application

1. Mở browser tại http://localhost:3000
2. Click "Đăng ký ngay" để tạo tài khoản
3. Login với tài khoản vừa tạo
4. Test chat với AI

## API Documentation

Sau khi backend chạy, xem API docs tại:

- Swagger UI: http://localhost:8002/docs
- ReDoc: http://localhost:8002/redoc

## Deployment

Xem hướng dẫn chi tiết trong [DEPLOYMENT.md](DEPLOYMENT.md)
