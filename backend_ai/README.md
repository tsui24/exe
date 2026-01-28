## backend_ai – FastAPI + OpenAI service

Service backend nhỏ dùng FastAPI để proxy request từ frontend tới OpenAI ChatGPT.

### 1. Yêu cầu môi trường

- **Python**: `>= 3.13` (theo `pyproject.toml`)
- **OpenAI API key**: thiết lập biến môi trường `OPENAI_API_KEY`

Ví dụ (bash/zsh):

```bash
export OPENAI_API_KEY="sk-..."
# (Tuỳ chọn) đổi model nếu muốn
export OPENAI_MODEL="gpt-4o-mini"
```

### 2. Cài đặt dependencies

Trong thư mục gốc project:

```bash
cd backend_ai
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Cài đặt theo các dependency đã khai báo trong pyproject.toml
pip install fastapi "uvicorn[standard]" "openai>=1.0.0" "pydantic>=2.0.0"
```

Hoặc nếu bạn dùng công cụ quản lý như `uv` / `poetry`, có thể cấu hình để đọc dependencies từ `pyproject.toml`.

### 3. Chạy service FastAPI

 uv run -m backend_ai.main


Lệnh này sẽ chạy `uvicorn` với cấu hình mặc định:

- host: `0.0.0.0`
- port: `8000`
- reload: `True` (phù hợp cho dev)

### 4. Các endpoint chính

- **GET `/health`**
  - Mục đích: healthcheck đơn giản.
  - Trả về: `{"status": "ok"}`

- **POST `/chat`**
  - Body JSON:

    ```json
    {
      "message": "Nội dung câu hỏi của người dùng",
      "context": "Ngữ cảnh bổ sung (optional, có thể bỏ qua)"
    }
    ```

  - Trả về:

    ```json
    {
      "reply": "Câu trả lời từ mô hình OpenAI"
    }
    ```

### 5. Cấu trúc module `backend_ai`

- `main.py`: Khởi tạo `FastAPI` app, định nghĩa endpoint `/health`, `/chat` và hàm `main()` để chạy server.
- `openai_client.py`: Client wrapper gọi tới OpenAI ChatGPT (dùng `OPENAI_API_KEY`, `OPENAI_MODEL`).
- `prompt.py`: Định nghĩa system prompt mặc định và hàm build `messages` cho Chat Completions API.
- `__init__.py`: Đánh dấu thư mục là Python package.

Bạn có thể mở rộng thêm các endpoint / logic tuỳ ý (logging, auth, lưu lịch sử chat, v.v.) dựa trên khung sẵn có này.

