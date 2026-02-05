import os
import io
import base64
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from backend_ai.main import app

client = TestClient(app)

def create_dummy_image():
    """Create a minimal dummy image (1x1 PNG)"""
    # Minimal 1x1 PNG image
    return b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'

def test_chat_image():
    image_content = create_dummy_image()
    
    with patch("backend_ai.main.chat_with_image") as mock_chat_image:
        mock_chat_image.return_value = "This is a construction blueprint showing foundation details."
        
        files = {"image": ("test.png", image_content, "image/png")}
        data = {"query": "Analyze this blueprint"}
        
        response = client.post("/chat-image", files=files, data=data)
        
        assert response.status_code == 200
        assert response.json()["reply"] == "This is a construction blueprint showing foundation details."
        
        # Verify chat_with_image was called
        mock_chat_image.assert_called_once()
        args, kwargs = mock_chat_image.call_args
        assert kwargs["user_query"] == "Analyze this blueprint"
        assert kwargs["system_prompt"] is None  # Default
        print("[PASS] chat_image endpoint")

def test_chat_image_with_custom_prompt():
    image_content = create_dummy_image()
    
    with patch("backend_ai.main.chat_with_image") as mock_chat_image:
        mock_chat_image.return_value = "Custom analysis result"
        
        files = {"image": ("test.png", image_content, "image/png")}
        data = {
            "query": "What is this?",
            "system_prompt": "You are a helpful assistant"
        }
        
        response = client.post("/chat-image", files=files, data=data)
        
        assert response.status_code == 200
        assert response.json()["reply"] == "Custom analysis result"
        
        # Verify custom system_prompt was passed
        args, kwargs = mock_chat_image.call_args
        assert kwargs["system_prompt"] == "You are a helpful assistant"
        print("[PASS] chat_image with custom system_prompt")

def test_chat_image_inline():
    """Test the /chat/image/inline endpoint with base64 image"""
    image_content = create_dummy_image()
    image_base64 = base64.b64encode(image_content).decode('utf-8')
    
    with patch("backend_ai.main.chat_inline_image") as mock_chat_inline:
        mock_chat_inline.return_value = "Analysis of base64 image"
        
        response = client.post(
            "/chat/image/inline",
            json={
                "query": "What's in this image?",
                "image_base64": image_base64
            }
        )
        
        assert response.status_code == 200
        assert response.json()["reply"] == "Analysis of base64 image"
        
        # Verify arguments
        args, kwargs = mock_chat_inline.call_args
        assert kwargs["user_query"] == "What's in this image?"
        assert kwargs["image_base64"] == image_base64
        assert kwargs["system_prompt"] is None
        print("[PASS] chat_image_inline endpoint")

if __name__ == "__main__":
    try:
        test_chat_image()
        test_chat_image_with_custom_prompt()
        test_chat_image_inline()
        print("\n✅ All chat-image verification tests passed!")

    except AssertionError as e:
        print(f"\n❌ [FAIL] Verification failed: {e}")
    except Exception as e:
        print(f"\n❌ [ERROR] An error occurred: {e}")
