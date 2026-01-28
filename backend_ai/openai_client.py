"""
Thin wrapper quanh OpenAI Python SDK để gọi ChatGPT.
"""

import os
from typing import Optional

from openai import OpenAI

from .prompt import SYSTEM_PROMPT


_client: Optional[OpenAI] = None

def get_client() -> OpenAI:
    """
    Lấy singleton OpenAI client, kiểm tra API key từ biến môi trường.
    """
    global _client

    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "OPENAI_API_KEY chưa được cấu hình. "
                "Hãy export OPENAI_API_KEY trước khi chạy service."
            )

        _client = OpenAI(api_key=api_key
        ,base_url="https://mkp-api.fptcloud.com")

    return _client


def chat_with_model(
    user_message: str,
    model: Optional[str] = None,
) -> str:
    """
    Gọi tới OpenAI Chat Completions và trả về text trả lời.
    """
    # Cho phép override model qua biến môi trường hoặc tham số
    model_name = (
        model

        or "gpt-oss-120b"  # model mặc định, có thể đổi tùy nhu cầu
    )


    client = get_client()

    # OpenAI SDK v1.x với client.chat.completions.create
    response =  client.chat.completions.create(    
        model=model_name,
        messages=[{"role": "system", "content": SYSTEM_PROMPT},
         {"role": "user", "content": user_message}],
    )

    choice = response.choices[0]
    content = choice.message.content or ""
    return content
if __name__ == "__main__":
    print(chat_with_model("bạn là gì"))
