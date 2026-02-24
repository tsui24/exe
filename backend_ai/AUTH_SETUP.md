# Backend Authentication Setup

## Cài đặt Dependencies

```bash
pip install -e .
```

Hoặc nếu dùng pip thông thường:

```bash
pip install sqlalchemy pymysql python-jose[cryptography] passlib[bcrypt] python-multipart
```

## Cấu hình MySQL Database

1. **Tạo database trong MySQL:**

```sql
CREATE DATABASE ki8_exe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Cấu hình kết nối database:**

Tạo file `.env` trong thư mục `backend_ai/` (copy từ `.env.example`):

```env
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/ki8_exe
SECRET_KEY=your-secret-key-here
```

**Lưu ý:** Thay đổi các thông tin sau:

- `root`: username MySQL của bạn
- `your_password`: password MySQL của bạn
- `localhost:3306`: host và port của MySQL
- `ki8_exe`: tên database bạn đã tạo

## Chạy Backend

```bash
cd backend_ai
python -m backend_ai.main
```

Server sẽ chạy tại: `http://localhost:8002`

## API Endpoints

### 1. Register (Đăng ký)

```http
POST http://localhost:8002/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "full_name": "Full Name"
}
```

### 2. Login (Đăng nhập)

```http
POST http://localhost:8002/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 3. Get Current User (Lấy thông tin user hiện tại)

```http
GET http://localhost:8002/auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 4. Chat Endpoint (Protected - có thể thêm authentication)

```http
POST http://localhost:8002/chat
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "message": "Hello, how are you?"
}
```

## API Documentation

Sau khi chạy server, truy cập:

- Swagger UI: http://localhost:8002/docs
- ReDoc: http://localhost:8002/redoc

## Database Schema

Bảng `users` sẽ tự động được tạo với cấu trúc:

| Column          | Type        | Description            |
| --------------- | ----------- | ---------------------- |
| id              | Integer     | Primary key            |
| email           | String(255) | Unique email           |
| username        | String(100) | Unique username        |
| full_name       | String(255) | Full name (optional)   |
| hashed_password | String(255) | Bcrypt hashed password |
| is_active       | Boolean     | Account active status  |
| is_admin        | Boolean     | Admin role flag        |
| created_at      | DateTime    | Account creation time  |
| updated_at      | DateTime    | Last update time       |

## Sử dụng trong Frontend

```typescript
// Register
const register = async (userData: {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}) => {
  const response = await fetch("http://localhost:8002/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return await response.json();
};

// Login
const login = async (email: string, password: string) => {
  const response = await fetch("http://localhost:8002/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  // Lưu token
  localStorage.setItem("access_token", data.access_token);
  return data;
};

// Get current user
const getCurrentUser = async () => {
  const token = localStorage.getItem("access_token");
  const response = await fetch("http://localhost:8002/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
};
```

## Security Notes

1. **SECRET_KEY**: Phải thay đổi và sử dụng một chuỗi random mạnh trong production
2. **DATABASE_URL**: Không commit file `.env` vào git
3. **HTTPS**: Trong production, phải sử dụng HTTPS
4. **Password**: Tối thiểu 6 ký tự (có thể tăng lên trong production)
