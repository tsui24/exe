import os
import base64
from typing import Optional
from google import genai
from google.genai import types
from .prompt import SYSTEM_PROMPT, IMAGE_SYSTEM_PROMPT
from dotenv import load_dotenv
load_dotenv()

# Use a global client or create one per request depending on best practices.
# Here we'll instantiate it once if API key is in environment, or let user pass it.
# Assuming GOOGLE_API_KEY is set in environment variables for simplicity,
# or we can pass it explicitly.

def get_gemini_client(api_key: str = None) -> genai.Client:
    """Gets the Gemini client."""
    # If api_key is None, it looks for GOOGLE_API_KEY env var by default
    return genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))


def chat_inline_pdf(prompt: str, pdf_data_base64: str, model: str = "gemini-3-flash-preview", system_instruction: str = None) -> str:
    """
    Sends a chat request with an inline PDF (Base64 encoded).
    Suitable for small files.
    """
    client = get_gemini_client()
    
    # Decode base64 to bytes
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
    Can provide either a file_path or raw file_bytes.
    Returns the file URI.
    """
    client = get_gemini_client()
    
    if file_path:
        uploaded_file = client.files.upload(path=file_path)
    elif file_bytes:
        import io
        file_obj = io.BytesIO(file_bytes)
        # Note: Depending on SDK, naming might be required or handled differently.
        # But commonly file=... works.
        uploaded_file = client.files.upload(file=file_obj, config=types.UploadFileConfig(mime_type=mime_type))
    else:
        raise ValueError("Must provide file_path or file_bytes")
        
    return uploaded_file.uri


def chat_with_file_api(prompt: str, file_uri: str, model: str = "gemini-3-flash-preview", system_instruction: str = None) -> str:
    """
    Sends a chat request using a file already uploaded to Gemini (via Files API).
    Suitable for large files.
    """
    client = get_gemini_client()
    
    config = None
    if system_instruction:
        config = types.GenerateContentConfig(system_instruction=system_instruction)

    # Using types.Part.from_uri
    part = types.Part.from_uri(
        file_uri=file_uri,
        mime_type="application/pdf"
    )

    response = client.models.generate_content(
        model=model,
        contents=[
            part,
            prompt
        ],
        config=config
    )
    return response.text


def chat_smart_pdf(prompt: str, file_bytes: bytes, model: str = "gemini-3-flash-preview", system_instruction: str = SYSTEM_PROMPT) -> str:
    """
    Automatically chooses between Inline Data and Files API based on file size.
    Threshold is 15MB.
    """
    SIZE_THRESHOLD = 15 * 1024 * 1024  # 15 MB in bytes
    
    file_size = len(file_bytes)
    
    if file_size < SIZE_THRESHOLD:
        # Use Inline Data
        pdf_base64 = base64.b64encode(file_bytes).decode('utf-8')
        return chat_inline_pdf(prompt=prompt, pdf_data_base64=pdf_base64, model=model, system_instruction=system_instruction)
    else:
        # Use Files API
        file_uri = upload_file_to_gemini(file_bytes=file_bytes, mime_type="application/pdf")
        return chat_with_file_api(prompt=prompt, file_uri=file_uri, model=model, system_instruction=system_instruction)
def chat_with_image(
    image_path: str,
    user_query: str,
    system_prompt: Optional[str] = None,
    model: str = "gemini-3-flash-preview"
) -> str:
    """
    Chat with Gemini AI using an image and text query.
    
    Args:
        image_path: Path to the image file to analyze
        user_query: User's question or query about the image
        system_prompt: Optional system prompt to guide the AI's behavior.
                      If not provided, uses IMAGE_PROMPT from prompt.py
        model: Gemini model to use (default: gemini-3-flash-preview)
    
    Returns:
        str: AI's response text
    
    Raises:
        Exception: If file upload or API call fails
    """
    # Initialize Gemini client
    client = get_gemini_client()
    
    # Use default system prompt if none provided
    if system_prompt is None:
        system_prompt = IMAGE_SYSTEM_PROMPT
    
    # Upload the image file
    uploaded_file = client.files.upload(file=image_path)
    
    # Create config with system instruction
    config = types.GenerateContentConfig(system_instruction=system_prompt)
    
    # Generate content with image and user query
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
    """
    Chat with Gemini AI using a base64 encoded image.
    
    Args:
        user_query: User's question or query about the image
        image_base64: Base64 encoded image data
        system_prompt: Optional system prompt to guide the AI's behavior.
                      If not provided, uses IMAGE_PROMPT from prompt.py
        model: Gemini model to use (default: gemini-3-flash-preview)
    
    Returns:
        str: AI's response text
    
    Raises:
        ValueError: If base64 data is invalid
        Exception: If API call fails
    """
    client = get_gemini_client()
    
    # Use default system prompt if none provided
    if system_prompt is None:
        system_prompt = IMAGE_SYSTEM_PROMPT
    
    # Decode base64 to bytes
    try:
        image_bytes = base64.b64decode(image_base64)
    except Exception as e:
        raise ValueError(f"Invalid base64 image data: {e}")
    
    # Create config with system instruction
    config = types.GenerateContentConfig(system_instruction=system_prompt)
    
    # Detect mime type (simple detection based on base64 header)
    mime_type = "image/jpeg"  # default
    if image_base64.startswith("iVBOR"):
        mime_type = "image/png"
    elif image_base64.startswith("/9j/"):
        mime_type = "image/jpeg"
    
    # Generate content with inline image
    response = client.models.generate_content(
        model=model,
        contents=[
            types.Part.from_bytes(
                data=image_bytes,
                mime_type=mime_type
            ),
            user_query
        ],
        config=config
    )
    
    return response.text