import os
import io
import base64
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from backend_ai.main import app

client = TestClient(app)

def create_dummy_pdf():
    # Create a minimal valid PDF-like byte structure or just random bytes
    # For mocking purposes, random bytes are fine as we mock the Gemini SDK
    return b"%PDF-1.4 header dummy content %%EOF"

def test_chat_inline_pdf():
    pdf_content = create_dummy_pdf()
    pdf_base64 = base64.b64encode(pdf_content).decode("utf-8")
    
    with patch("backend_ai.main.chat_inline_pdf") as mock_chat:
        mock_chat.return_value = "This is a summarized text from inline PDF."
        
        response = client.post(
            "/chat/pdf/inline",
            json={"message": "Summarize this", "pdf_base64": pdf_base64}
        )
        
        assert response.status_code == 200
        assert response.json()["reply"] == "This is a summarized text from inline PDF."
        print("[PASS] chat_inline_pdf")

def test_upload_and_chat_file():
    pdf_content = create_dummy_pdf()
    
    # 1. Test Upload
    with patch("backend_ai.main.upload_file_to_gemini") as mock_upload:
        mock_upload.return_value = "https://generativelanguage.googleapis.com/v1beta/files/12345"
        
        files = {"file": ("test.pdf", pdf_content, "application/pdf")}
        response = client.post("/upload/pdf", files=files)
        
        assert response.status_code == 200
        file_uri = response.json()["file_uri"]
        assert file_uri == "https://generativelanguage.googleapis.com/v1beta/files/12345"
        print("[PASS] upload_pdf")

    # 2. Test Chat with File URI
    with patch("backend_ai.main.chat_with_file_api") as mock_chat_file:
        mock_chat_file.return_value = "This is a summarized text from uploaded file."
        
        response = client.post(
            "/chat/pdf/file",
            json={"message": "Summarize this", "file_uri": file_uri}
        )
        
        assert response.status_code == 200
        assert response.json()["reply"] == "This is a summarized text from uploaded file."
        print("[PASS] chat_with_file_api")

def test_chat_smart_pdf():
    pdf_content = create_dummy_pdf()
    
    # Mock chat_smart_pdf to ensure it's called with system_instruction
    with patch("backend_ai.main.chat_smart_pdf") as mock_smart:
        mock_smart.return_value = "Smart chat response"
        
        from backend_ai.prompt import SYSTEM_PROMPT
        
        files = {"file": ("test.pdf", pdf_content, "application/pdf")}
        response = client.post("/chat/pdf", data={"message": "Smart prompt"}, files=files)
        
        assert response.status_code == 200
        assert response.json()["reply"] == "Smart chat response"
        
        # Verify arguments
        mock_smart.assert_called_once()
        args, kwargs = mock_smart.call_args
        assert kwargs["prompt"] == "Smart prompt"
        assert kwargs["system_instruction"] == SYSTEM_PROMPT
        print("[PASS] chat_smart_pdf")

if __name__ == "__main__":
    try:
        test_chat_inline_pdf()
        test_upload_and_chat_file()
        test_chat_smart_pdf()
        print("\nAll verification tests passed!")

    except AssertionError as e:
        print(f"\n[FAIL] Verification failed: {e}")
    except Exception as e:
        print(f"\n[ERROR] An error occurred: {e}")
