from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .openai_client import chat_with_model


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


app = FastAPI(
    title="backend-ai",
    description="Simple FastAPI service that proxies requests to OpenAI ChatGPT.",
    version="0.1.0",
)


@app.get("/health", tags=["system"])
async def health_check() -> dict:
    """
    Simple healthcheck endpoint so orchestration tools can verify the service.
    """
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse, tags=["chat"])
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Chat endpoint that forwards the user message (và context nếu có) tới OpenAI.
    """
    try:
        # `chat_with_model` là hàm đồng bộ, nên gọi trực tiếp không dùng `await`.
        reply = chat_with_model(
            user_message=request.message,
        )
    except RuntimeError as exc:
        # Lỗi cấu hình (ví dụ thiếu API key)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - catch-all
        raise HTTPException(status_code=500, detail="Internal error") from exc

    return ChatResponse(reply=reply)


def main() -> None:
    """
    Entrypoint để chạy dev server trực tiếp bằng `python -m backend_ai.main`.
    """
    import uvicorn

    uvicorn.run("backend_ai.main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()
