# ConstructionIQ - AI Assistant for Construction

## 📁 Project Structure

```
├── app/                          # Next.js application pages
│   ├── login/                   # Login page
│   ├── register/                # Registration page
│   ├── dashboard/               # User dashboard
│   └── admin/                   # Admin panel
├── backend_ai/                   # FastAPI backend
│   ├── main.py                  # Main application
│   ├── database.py              # Database configuration
│   ├── models.py                # SQLAlchemy models
│   ├── schemas.py               # Pydantic schemas
│   ├── auth.py                  # Authentication utilities
│   ├── openai_client.py         # OpenAI integration
│   └── prompt.py                # AI prompts
├── components/                   # React components
├── lib/                         # Utility libraries
│   ├── api-client.ts           # API client
│   ├── auth-context.tsx        # Auth context
│   └── utils.ts                # Helper functions
├── public/                      # Static files
└── styles/                      # CSS styles

## Configuration Files
├── .env.local.example           # Frontend environment template
├── .env.production.example      # Backend environment template
├── nginx.conf                   # Nginx configuration
├── deploy.sh                    # Deployment script
├── constructioniq-backend.service    # Systemd backend service
├── constructioniq-frontend.service   # Systemd frontend service
└── pyproject.toml              # Python dependencies
```

## 🔧 Technologies

### Frontend

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - UI components
- **Shadcn/ui** - Component library

### Backend

- **FastAPI** - Python web framework
- **SQLAlchemy** - ORM
- **MySQL** - Database
- **PyMySQL** - MySQL driver
- **Python-Jose** - JWT authentication
- **Passlib** - Password hashing
- **OpenAI API** - AI integration

### Infrastructure

- **Nginx** - Reverse proxy
- **Systemd** - Process management
- **Let's Encrypt** - SSL certificates

## 🚀 Features

### Authentication

- ✅ User registration with email validation
- ✅ Secure login with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ Token-based authentication
- ✅ Admin role support

### AI Chat

- ✅ Integration with OpenAI GPT models
- ✅ Real-time chat interface
- ✅ Context-aware responses
- ✅ Construction industry focused

### User Management

- ✅ User profiles
- ✅ Account settings
- ✅ Admin dashboard
- ✅ User permissions

## 📚 API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user info

### Chat

- `POST /chat` - Send message to AI

### Health Check

- `GET /health` - Check backend status

## 🔐 Environment Variables

### Backend (.env.production)

```env
DATABASE_URL=mysql+pymysql://user:pass@host/db
SECRET_KEY=your-secret-key
OPENAI_API_KEY=sk-your-key
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_AI_BACKEND_URL=http://localhost:8002
```

## 📖 Documentation

- [QUICKSTART.md](QUICKSTART.md) - Local development setup
- [DEPLOYMENT.md](DEPLOYMENT.md) - AWS EC2 deployment guide
- [backend_ai/AUTH_SETUP.md](backend_ai/AUTH_SETUP.md) - Authentication setup

## 🎯 Quick Start

1. **Local Development**

   ```bash
   # See QUICKSTART.md for detailed instructions
   ```

2. **Production Deployment**
   ```bash
   # See DEPLOYMENT.md for AWS EC2 deployment
   ./deploy.sh
   ```

## 🛠️ Development Commands

### Frontend

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run linter
```

### Backend

```bash
python -m backend_ai.main     # Start backend server
pip install -e .              # Install dependencies
```

## 📝 Database Schema

### Users Table

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔍 Testing

### Test API Endpoints

```bash
# Health check
curl http://localhost:8002/health

# Register
curl -X POST http://localhost:8002/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'

# Login
curl -X POST http://localhost:8002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📊 Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Nginx     │ (Port 80/443)
└──────┬──────┘
       │
       ├─────────────┐
       ▼             ▼
┌─────────────┐  ┌──────────────┐
│  Next.js    │  │   FastAPI    │
│  Frontend   │  │   Backend    │
│ (Port 3000) │  │ (Port 8002)  │
└─────────────┘  └──────┬───────┘
                        │
                        ▼
                 ┌─────────────┐
                 │    MySQL    │
                 │  Database   │
                 └─────────────┘
                        │
                        ▼
                 ┌─────────────┐
                 │   OpenAI    │
                 │     API     │
                 └─────────────┘
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is proprietary and confidential.

## 👥 Team

- Full-stack development
- AI integration
- DevOps & deployment

## 🔗 Links

- Frontend: http://localhost:3000
- Backend API: http://localhost:8002
- API Docs: http://localhost:8002/docs
