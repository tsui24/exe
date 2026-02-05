from google import genai

client = genai.Client(api_key="AIzaSyBDJho1KmrJIZfxUpJyN-qBp-_Ufl6x2bM")

response = client.models.generate_content(
    model="gemini-3-flash-preview", contents="Explain how AI works in a few words"
)
print(response.text)