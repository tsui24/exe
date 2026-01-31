import boto3
import os
import json

region = os.getenv('AWS_REGION', 'ap-southeast-2')
model_id = os.getenv('BEDROCK_EMBEDDING_MODEL_ID', 'amazon.titan-embed-text-v1:0')

print(f'Testing embedding model: {model_id}')
print(f'Region: {region}')

client = boto3.client('bedrock-runtime', region_name=region)

try:
    body = json.dumps({"inputText": "test"})
    response = client.invoke_model(modelId=model_id, body=body)
    print('✅ Embedding model is valid!')
except Exception as e:
    print(f'❌ Error: {e}')
