# Deploy to EC2 Script - ZIP Method
# Server: 44.222.156.122
# Make sure you have SSH access configured

$EC2_IP = "44.222.156.122"
$EC2_USER = "ubuntu"
$PROJECT_PATH = "/home/ubuntu/constructioniq"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$ZIP_NAME = "deploy_$TIMESTAMP.zip"

Write-Host "=== Creating deployment package ===" -ForegroundColor Green

# Create temporary directory for files to zip
$TEMP_DIR = ".\deploy_temp"
if (Test-Path $TEMP_DIR) {
    Remove-Item $TEMP_DIR -Recurse -Force
}
New-Item -ItemType Directory -Path $TEMP_DIR | Out-Null

# Copy backend files
Write-Host "`nCopying backend files..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path "$TEMP_DIR\backend_ai" -Force | Out-Null
Copy-Item "backend_ai\main.py" "$TEMP_DIR\backend_ai\"
Copy-Item "backend_ai\gemini_client.py" "$TEMP_DIR\backend_ai\"
Copy-Item "backend_ai\prompt.py" "$TEMP_DIR\backend_ai\"

# Copy frontend files
Write-Host "Copying frontend files..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path "$TEMP_DIR\app\dashboard\blueprint" -Force | Out-Null
Copy-Item "app\dashboard\blueprint\page.tsx" "$TEMP_DIR\app\dashboard\blueprint\"

New-Item -ItemType Directory -Path "$TEMP_DIR\components\dashboard" -Force | Out-Null
Copy-Item "components\dashboard\dashboard-sidebar.tsx" "$TEMP_DIR\components\dashboard\"

New-Item -ItemType Directory -Path "$TEMP_DIR\lib" -Force | Out-Null
Copy-Item "lib\api-client.ts" "$TEMP_DIR\lib\"

# Copy .env file
Write-Host "Copying .env file..." -ForegroundColor Cyan
Copy-Item ".env" "$TEMP_DIR\"

# Copy deployment script
Copy-Item "ec2-setup-commands.sh" "$TEMP_DIR\"

# Create ZIP file
Write-Host "`nCreating ZIP package: $ZIP_NAME" -ForegroundColor Cyan
Compress-Archive -Path "$TEMP_DIR\*" -DestinationPath $ZIP_NAME -Force

# Clean up temp directory
Remove-Item $TEMP_DIR -Recurse -Force

Write-Host "`n=== Uploading to EC2 ===" -ForegroundColor Green
scp $ZIP_NAME ${EC2_USER}@${EC2_IP}:/home/ubuntu/

Write-Host "`n=== Package uploaded successfully ===" -ForegroundColor Green
Write-Host "`nZIP file: $ZIP_NAME" -ForegroundColor Yellow
Write-Host "`nNext steps - SSH to EC2 and run:" -ForegroundColor Yellow
Write-Host "ssh ${EC2_USER}@${EC2_IP}" -ForegroundColor White
Write-Host "cd ~" -ForegroundColor White
Write-Host "unzip -o $ZIP_NAME -d $PROJECT_PATH" -ForegroundColor White
Write-Host "cd $PROJECT_PATH" -ForegroundColor White
Write-Host "bash ec2-setup-commands.sh" -ForegroundColor White

Write-Host "`nOr run this one-liner:" -ForegroundColor Yellow
Write-Host "ssh ${EC2_USER}@${EC2_IP} 'cd ~ && unzip -o $ZIP_NAME -d $PROJECT_PATH && cd $PROJECT_PATH && bash ec2-setup-commands.sh'" -ForegroundColor Cyan
