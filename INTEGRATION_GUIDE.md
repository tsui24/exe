# Tích hợp Backend APIs - ConstructionIQ

## Tổng quan

Đã tích hợp thành công các API từ thư mục `be-pro` vào dự án frontend Next.js.

## Các API đã tích hợp

### 1. Upload Service (Port 8000)

**Base URL:** `http://localhost:8000`

#### Endpoints:

- **POST /api/auth/register** - Đăng ký người dùng mới

  ```json
  {
    "username": "string",
    "phone": "string",
    "password": "string"
  }
  ```

- **POST /api/auth/login** - Đăng nhập

  ```json
  {
    "phone": "string",
    "password": "string"
  }
  ```

- **POST /api/document/upload** - Upload nhiều tài liệu
  - Form Data:
    - `files[]`: File array
    - `user_id`: string
    - `max_workers`: number (optional)
  - Response: Trả về `conversation_id` và thông tin xử lý

- **GET /api/conversation/conversations/user/{user_id}** - Lấy danh sách hội thoại
- **GET /api/conversation/conversations/{conversation_id}** - Chi tiết hội thoại

### 2. Query Service (Port 8001)

**Base URL:** `http://localhost:8001`

#### Endpoints:

- **POST /chat** - Gửi câu hỏi và nhận phản hồi từ AI
  ```json
  {
    "message": "string",
    "chat_history": [{"role": "user|assistant", "content": "string"}],
    "conversation_id": number (optional)
  }
  ```

## Các thay đổi trong Frontend

### 1. API Client Layer (`lib/api-client.ts`)

Tạo module mới để quản lý tất cả các API calls:

- `authApi`: Register & Login
- `documentApi`: Upload documents
- `conversationApi`: Manage conversations
- `chatApi`: Chat with AI

### 2. Auth Context (`lib/auth-context.tsx`)

**Thay đổi:**

- Chuyển từ mock auth sang real API authentication
- Thêm `id` và `phone` vào User interface
- `login()` method giờ là async và gọi API thật
- Admin login vẫn dùng hardcoded credentials (`admin/admin`)

**Lưu ý:** User interface hiện có:

```typescript
interface User {
  id: number;
  username: string;
  phone: string;
  role: UserRole;
  plan: UserPlan;
  name: string;
}
```

### 3. Login Page (`app/login/page.tsx`)

**Thay đổi:**

- Đổi từ `username` sang `phone` field
- Gọi API thật thông qua `authApi.login()`
- Error handling cho API failures
- Async form submission

### 4. Register Page (`app/register/page.tsx`)

**Thay đổi:**

- Thay email bằng phone number
- Gọi `authApi.register()` để tạo user mới
- Auto-login sau khi đăng ký thành công
- Validation cho phone number (min 10 digits)

### 5. Dashboard Page (`app/dashboard/page.tsx`)

**Thay đổi:**

- Tích hợp `documentApi.upload()` cho file uploads
- Lưu `conversation_id` từ response
- Gọi `chatApi.sendMessage()` với conversation context
- Error handling và fallback cho API failures
- Upload progress tracking thông qua API response

**Flow mới:**

1. User upload files → `documentApi.upload()`
2. Backend tạo conversation và xử lý files
3. Frontend nhận `conversation_id`
4. User chat → `chatApi.sendMessage()` với `conversation_id`
5. Backend cập nhật conversation history tự động

### 6. Chat-Only Component (`components/dashboard/chat-only.tsx`)

**Thay đổi:**

- Gọi `chatApi.sendMessage()` thay vì mock responses
- Fallback về mock responses nếu API fails
- Hiển thị warning khi dùng fallback

## Cấu hình

### Environment Variables

Tạo file `.env.local`:

```env
NEXT_PUBLIC_UPLOAD_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_QUERY_SERVICE_URL=http://localhost:8001
```

### Database Setup (Backend)

Backend yêu cầu PostgreSQL. Xem `be-pro/upload/infra/db/db.py`:

```bash
# Default connection (có thể override với DATABASE_URL)
POSTGRES_ENDPOINT=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=semantic-chunking
```

## Chạy ứng dụng

### 1. Start Backend Services

**Upload Service:**

```bash
cd be-pro/upload
python main.py  # Port 8000
```

**Query Service:**

```bash
cd be-pro/query
python main.py  # Port 8001
```

### 2. Start Frontend

```bash
pnpm install
pnpm dev  # Port 3000
```

### 3. Setup Database

Cần PostgreSQL running. Backend sẽ tự động tạo tables:

- `users`
- `conversations`
- `documents`

## Testing

### Test Flow

1. **Register:**
   - Đi đến `/register`
   - Nhập: Full Name, Phone (10 digits), Username, Password
   - Chọn plan (Normal/Pro)
   - Submit → Auto redirect to `/dashboard`

2. **Login:**
   - Đi đến `/login`
   - Phone + Password
   - Admin: `admin/admin` → `/admin`
   - Regular user → `/dashboard`

3. **Upload (Pro users only):**
   - Drag & drop hoặc click để upload files
   - Backend xử lý và tạo conversation
   - Documents hiện trong sidebar

4. **Chat:**
   - Normal users: Chat trực tiếp
   - Pro users: Chat với document context
   - Tất cả messages được lưu vào conversation

## Lưu ý quan trọng

### 1. CORS

Backend đã enable CORS cho tất cả origins (`allow_origins=['*']`). Production nên restrict lại.

### 2. Authentication

- Hiện tại chưa có JWT tokens
- Login chỉ trả về user info, không có session management
- Frontend lưu user vào localStorage
- Production cần implement proper JWT/session

### 3. File Upload

- Backend hỗ trợ multiple files
- Có parallel processing với workers
- Tự động tạo embeddings cho RAG

### 4. Conversation Management

- Mỗi upload session tạo 1 conversation mới
- History được lưu dưới dạng JSON string
- Frontend có thể query conversation history

## Dependencies Mới

Đã thêm vào frontend:

- Không có dependencies mới (chỉ dùng built-in fetch API)

Backend yêu cầu (xem `be-pro/*/requirements.txt`):

- FastAPI
- SQLAlchemy
- PostgreSQL driver (psycopg2)
- Passlib (password hashing)
- Các dependencies cho RAG/embeddings

## Troubleshooting

### API Connection Failed

- Kiểm tra backend services đang chạy
- Verify ports 8000 và 8001 available
- Check CORS settings nếu có lỗi

### Database Errors

- Đảm bảo PostgreSQL running
- Check connection string trong backend
- Verify database `semantic-chunking` exists

### Upload Fails

- Check file size limits
- Verify backend có write permissions
- Check logs trong backend terminal

## Next Steps

Có thể cải thiện:

1. Implement JWT authentication
2. Add refresh token logic
3. Better error messages từ API
4. Loading states cho tất cả API calls
5. Retry logic cho failed requests
6. File upload progress tracking
7. Conversation list UI
8. Document management UI
