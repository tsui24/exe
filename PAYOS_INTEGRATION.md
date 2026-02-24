# Hướng Dẫn Tích Hợp Thanh Toán PayOS

## Tổng Quan

Hệ thống đã được tích hợp với PayOS để xử lý thanh toán cho các gói subscription (Normal và Pro). Người dùng có thể chọn gói khi đăng ký và thanh toán qua PayOS.

## Các Thay Đổi Đã Thực Hiện

### 1. Backend Changes

#### Models (`backend_ai/models.py`)
- Thêm enum `SubscriptionPlan`: free, normal, pro
- Thêm enum `PaymentStatus`: pending, completed, failed, cancelled
- Cập nhật model `User`:
  - `subscription_plan`: Gói hiện tại của user
  - `subscription_expires_at`: Ngày hết hạn gói
- Thêm model `Payment`: Lưu thông tin thanh toán

#### Schemas (`backend_ai/schemas.py`)
- Thêm `SubscriptionPlanEnum` và `PaymentStatusEnum`
- Cập nhật `UserResponse` với subscription fields
- Thêm payment schemas: `PaymentCreate`, `PaymentResponse`, `PaymentLinkResponse`, `PaymentWebhook`

#### PayOS Client (`backend_ai/payos_client.py`)
- Class `PayOSClient`: Xử lý tích hợp với PayOS API
  - `create_payment_link()`: Tạo link thanh toán
  - `get_payment_info()`: Kiểm tra trạng thái thanh toán
  - `verify_webhook_signature()`: Xác thực webhook từ PayOS
  - `cancel_payment()`: Hủy thanh toán
- `SUBSCRIPTION_PLANS`: Cấu hình các gói với giá và tính năng

#### API Endpoints (`backend_ai/main.py`)

**Payment Endpoints:**
- `GET /payments/plans` - Lấy danh sách gói subscription
- `POST /payments/create` - Tạo payment link
- `POST /payments/webhook` - Webhook từ PayOS (xử lý khi thanh toán thành công)
- `GET /payments/verify/{order_code}` - Xác minh trạng thái thanh toán
- `GET /payments/my-payments` - Lịch sử thanh toán của user
- `GET /admin/payments` - Quản lý tất cả thanh toán (Admin only)

### 2. Frontend Changes

#### Registration Flow (`app/register/plan-page.tsx`)
- Step 1: Nhập thông tin tài khoản
- Step 2: Chọn gói subscription (Free, Normal, Pro)
- Sau khi đăng ký:
  - Free plan: Redirect đến dashboard
  - Normal/Pro plan: Redirect đến PayOS để thanh toán

#### Payment Result Pages
- `app/payment/success/page.tsx`: Hiển thị khi thanh toán thành công
- `app/payment/cancel/page.tsx`: Hiển thị khi user hủy thanh toán

#### Auth Context Updates (`lib/auth-context.tsx`)
- Cập nhật để sử dụng `subscription_plan` từ API
- Map plan vào user object

#### Dashboard Sidebar (`components/dashboard/dashboard-sidebar.tsx`)
- Hiển thị gói hiện tại của user
- Hiển thị icon Crown cho Pro users
- Lọc menu items dựa trên plan:
  - Free/Normal: Chỉ "Hỏi Đáp AI"
  - Pro: Tất cả tính năng bao gồm "Phân Tích Bản Vẽ"

## Cấu Hình PayOS

### Bước 1: Đăng Ký Tài Khoản PayOS

1. Truy cập https://payos.vn
2. Đăng ký tài khoản merchant
3. Hoàn thành xác thực

### Bước 2: Lấy API Credentials

1. Đăng nhập vào PayOS Dashboard
2. Vào phần **Cài đặt > API Keys**
3. Lấy các thông tin:
   - Client ID
   - API Key
   - Checksum Key

### Bước 3: Cấu Hình Environment Variables

Cập nhật file `.env` với thông tin PayOS:

```env
# PayOS Configuration
PAYOS_CLIENT_ID=your_client_id_here
PAYOS_API_KEY=your_api_key_here
PAYOS_CHECKSUM_KEY=your_checksum_key_here

# Frontend URL for payment callbacks
FRONTEND_URL=http://localhost:3000
```

### Bước 4: Cấu Hình Webhook (Production)

1. Trong PayOS Dashboard, vào **Cài đặt > Webhook**
2. Thêm webhook URL: `https://your-domain.com/api/payments/webhook`
3. Chọn events: `Payment Completed`, `Payment Failed`

## Database Migration

Chạy lệnh sau để cập nhật database schema:

```bash
# Backend sẽ tự động tạo tables khi start
cd backend_ai
python -m backend_ai.main
```

Hoặc nếu cần force recreate:

```python
from backend_ai.database import Base, engine
Base.metadata.drop_all(bind=engine)  # Cẩn thận: Xóa tất cả data
Base.metadata.create_all(bind=engine)
```

## Testing Payment Flow

### Local Testing

1. **Start Backend:**
   ```bash
   cd backend_ai
   python -m backend_ai.main
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Test Registration:**
   - Mở http://localhost:3000/register
   - Điền thông tin tài khoản
   - Chọn gói Normal hoặc Pro
   - Click "Tiếp tục thanh toán"
   - Sẽ redirect đến PayOS payment page

4. **Test Payment (Sandbox):**
   - PayOS cung cấp sandbox mode cho testing
   - Sử dụng test cards được cung cấp bởi PayOS
   - Sau khi thanh toán, user sẽ redirect về `/payment/success`

### Webhook Testing (Development)

Sử dụng ngrok hoặc localtunnel để expose local webhook:

```bash
# Install ngrok
npm install -g ngrok

# Expose backend port
ngrok http 8002

# Use the ngrok URL for webhook in PayOS dashboard
# Example: https://abc123.ngrok.io/payments/webhook
```

## Payment Plans Configuration

Các gói được định nghĩa trong `backend_ai/payos_client.py`:

```python
SUBSCRIPTION_PLANS = {
    "normal": {
        "name": "Normal",
        "price": 99000,  # 99,000 VND
        "duration_days": 30,
        "features": [...]
    },
    "pro": {
        "name": "Pro",
        "price": 199000,  # 199,000 VND
        "duration_days": 30,
        "features": [...]
    }
}
```

Để thay đổi giá hoặc tính năng, cập nhật dictionary này.

## API Usage Examples

### 1. Get Available Plans

```bash
curl http://localhost:8002/payments/plans
```

Response:
```json
{
  "plans": [
    {
      "id": "normal",
      "name": "Normal",
      "price": 99000,
      "duration_days": 30,
      "features": [...]
    },
    {
      "id": "pro",
      "name": "Pro",
      "price": 199000,
      "duration_days": 30,
      "features": [...]
    }
  ]
}
```

### 2. Create Payment

```bash
curl -X POST http://localhost:8002/payments/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subscription_plan": "normal"}'
```

Response:
```json
{
  "payment_url": "https://pay.payos.vn/...",
  "order_code": "1234567890",
  "qr_code": "data:image/png;base64,...",
  "amount": 99000,
  "subscription_plan": "normal"
}
```

### 3. Verify Payment

```bash
curl http://localhost:8002/payments/verify/1234567890 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Get Payment History

```bash
curl http://localhost:8002/payments/my-payments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### PayOS Connection Error

```
ValueError: PayOS credentials not configured
```

**Solution:** Kiểm tra `.env` file có đầy đủ PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY

### Webhook Not Receiving Events

**Solutions:**
1. Kiểm tra webhook URL trong PayOS dashboard
2. Nếu local development, sử dụng ngrok để expose
3. Kiểm tra signature verification trong code

### Payment Not Updating User Subscription

**Solutions:**
1. Kiểm tra webhook có được gọi không (check logs)
2. Verify signature trong webhook
3. Kiểm tra database có record payment không
4. Manual trigger: Gọi `/payments/verify/{order_code}` endpoint

## Security Notes

1. **API Keys:** Không commit API keys vào git
2. **Webhook Signature:** Luôn verify signature từ PayOS
3. **Payment Verification:** Luôn verify payment status từ PayOS trước khi activate subscription
4. **HTTPS:** Production phải dùng HTTPS cho webhook

## Admin Panel

Admin có thể xem tất cả payments qua endpoint:
```
GET /admin/payments
```

Cần login với admin account để truy cập.

## Support

- PayOS Documentation: https://payos.vn/docs
- PayOS Support: support@payos.vn
- Test Cards: https://payos.vn/docs/test-cards

## Next Steps

1. [ ] Thêm email notification khi thanh toán thành công
2. [ ] Thêm page "Nâng cấp gói" trong dashboard settings
3. [ ] Thêm auto-renewal cho subscriptions
4. [ ] Thêm invoice generation
5. [ ] Thêm refund functionality
