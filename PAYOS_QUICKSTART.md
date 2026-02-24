# Quick Start Guide - PayOS Payment Integration

## 📋 Overview

Hệ thống đã được tích hợp thanh toán PayOS cho các gói subscription:

- **Free**: Miễn phí, tính năng cơ bản
- **Normal**: 99,000 VND/tháng
- **Pro**: 199,000 VND/tháng

## 🚀 Quick Setup (5 phút)

### 1. Cài đặt Dependencies

```bash
# Backend
pip install requests python-dotenv

# Hoặc sử dụng uv
uv sync
```

### 2. Cấu hình PayOS Credentials

Cập nhật file `.env`:

```env
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key
FRONTEND_URL=http://localhost:3000
```

**Lấy credentials tại:** https://payos.vn/portal/settings/api-key

### 3. Chạy Migration

```bash
cd backend_ai
python migrate_payments.py
```

### 4. Start Services

```bash
# Terminal 1: Backend
python -m backend_ai.main

# Terminal 2: Frontend
npm run dev
```

### 5. Test Flow

1. Mở http://localhost:3000/register
2. Điền thông tin tài khoản
3. Chọn gói Normal hoặc Pro
4. Click "Tiếp tục thanh toán"
5. Hoàn tất thanh toán trên PayOS

## 📚 Documentation

Chi tiết đầy đủ: [PAYOS_INTEGRATION.md](PAYOS_INTEGRATION.md)

## 🎯 Key Features

✅ Chọn gói khi đăng ký  
✅ Thanh toán qua PayOS  
✅ Webhook tự động cập nhật subscription  
✅ Navigate theo plan (Free/Normal/Pro)  
✅ Payment history tracking  
✅ Admin payment management

## 📁 Files Changed

**Backend:**

- `backend_ai/models.py` - Added Payment model, subscription fields
- `backend_ai/schemas.py` - Payment schemas
- `backend_ai/payos_client.py` - PayOS integration (NEW)
- `backend_ai/main.py` - Payment endpoints
- `backend_ai/migrate_payments.py` - Database migration (NEW)

**Frontend:**

- `app/register/plan-page.tsx` - Registration with plan selection (NEW)
- `app/payment/success/page.tsx` - Success page (NEW)
- `app/payment/cancel/page.tsx` - Cancel page (NEW)
- `lib/auth-context.tsx` - Handle subscription_plan
- `lib/api-client.ts` - Updated UserResponse
- `components/dashboard/dashboard-sidebar.tsx` - Show plan badge

## 🔧 Troubleshooting

**Error: PayOS credentials not configured**
→ Kiểm tra `.env` có đủ 3 keys: CLIENT_ID, API_KEY, CHECKSUM_KEY

**Webhook không nhận được**
→ Sử dụng ngrok để expose local: `ngrok http 8002`

**Payment không cập nhật user**
→ Check logs webhook, hoặc gọi manual: `/payments/verify/{order_code}`

## 📞 Support

- PayOS Docs: https://payos.vn/docs
- PayOS Support: support@payos.vn

---

Made with ❤️ for ConstructionIQ
