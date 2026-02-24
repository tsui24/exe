import os
import base64
from typing import Optional
from google import genai
from google.genai import types
from .prompt import SYSTEM_PROMPT, IMAGE_SYSTEM_PROMPT
from dotenv import load_dotenv

# Load .env from root project directory
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

# Use a global client or create one per request depending on best practices.
def get_gemini_client(api_key: str = None) -> genai.Client:
    """Gets the Gemini client."""
    return genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))


def chat_inline_pdf(prompt: str, pdf_data_base64: str, model: str = "gemini-3-flash-preview", system_instruction: str = None) -> str:
    """
    Sends a chat request with an inline PDF (Base64 encoded).
    """
    client = get_gemini_client()
    try:
        pdf_bytes = base64.b64decode(pdf_data_base64)
    except Exception as e:
        raise ValueError(f"Invalid base64 data: {e}")

    config = None
    if system_instruction:
        config = types.GenerateContentConfig(system_instruction=system_instruction)

    response = client.models.generate_content(
        model=model,
        contents=[
            types.Part.from_bytes(
                data=pdf_bytes,
                mime_type='application/pdf',
            ),
            prompt
        ],
        config=config
    )
    return response.text


def upload_file_to_gemini(file_path: str = None, file_bytes: bytes = None, mime_type: str = "application/pdf") -> str:
    """
    Uploads a file to Gemini Files API.
    """
    client = get_gemini_client()
    if file_path:
        uploaded_file = client.files.upload(path=file_path)
    elif file_bytes:
        import io
        file_obj = io.BytesIO(file_bytes)
        uploaded_file = client.files.upload(file=file_obj, config=types.UploadFileConfig(mime_type=mime_type))
    else:
        raise ValueError("Must provide file_path or file_bytes")
    return uploaded_file.uri


def chat_with_file_api(prompt: str, file_uri: str, model: str = "gemini-3-flash-preview", system_instruction: str = None) -> str:
    """
    Sends a chat request using a file already uploaded to Gemini (via Files API).
    """
    client = get_gemini_client()
    config = None
    if system_instruction:
        config = types.GenerateContentConfig(system_instruction=system_instruction)

    part = types.Part.from_uri(file_uri=file_uri, mime_type="application/pdf")
    response = client.models.generate_content(
        model=model,
        contents=[part, prompt],
        config=config
    )
    return response.text


def chat_smart_pdf(prompt: str, file_bytes: bytes, model: str = "gemini-3-flash-preview", system_instruction: str = SYSTEM_PROMPT) -> str:
    """
    Automatically chooses between Inline Data and Files API based on file size.
    """
    SIZE_THRESHOLD = 15 * 1024 * 1024
    file_size = len(file_bytes)
    if file_size < SIZE_THRESHOLD:
        pdf_base64 = base64.b64encode(file_bytes).decode('utf-8')
        return chat_inline_pdf(prompt=prompt, pdf_data_base64=pdf_base64, model=model, system_instruction=system_instruction)
    else:
        file_uri = upload_file_to_gemini(file_bytes=file_bytes, mime_type="application/pdf")
        return chat_with_file_api(prompt=prompt, file_uri=file_uri, model=model, system_instruction=system_instruction)


def chat_pdf_from_path(
    prompt: str,
    pdf_path: str,
    model: str = "gemini-3-flash-preview",
    system_instruction: str = SYSTEM_PROMPT
) -> str:
    with open(pdf_path, 'rb') as f:
        file_bytes = f.read()
    return chat_smart_pdf(prompt, file_bytes, model, system_instruction)


def chat_with_image(
    image_path: str,
    user_query: str,
    system_prompt: Optional[str] = None,
    model: str = "gemini-3-flash-preview"
) -> str:
    client = get_gemini_client()
    if system_prompt is None:
        system_prompt = IMAGE_SYSTEM_PROMPT
    uploaded_file = client.files.upload(file=image_path)
    config = types.GenerateContentConfig(system_instruction=system_prompt)
    response = client.models.generate_content(
        model=model,
        contents=[uploaded_file, user_query],
        config=config
    )
    return response.text


def chat_inline_image(
    user_query: str,
    image_base64: str,
    system_prompt: Optional[str] = None,
    model: str = "gemini-3-flash-preview"
) -> str:
    client = get_gemini_client()
    if system_prompt is None:
        system_prompt = IMAGE_SYSTEM_PROMPT
    try:
        image_bytes = base64.b64decode(image_base64)
    except Exception as e:
        raise ValueError(f"Invalid base64 image data: {e}")
    config = types.GenerateContentConfig(system_instruction=system_prompt)
    mime_type = "image/jpeg"
    if image_base64.startswith("iVBOR"):
        mime_type = "image/png"
    elif image_base64.startswith("/9j/"):
        mime_type = "image/jpeg"
    response = client.models.generate_content(
        model=model,
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            user_query
        ],
        config=config
    )
    return response.text
