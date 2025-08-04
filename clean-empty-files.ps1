# Script để loại bỏ file trống khỏi Git staging area
Write-Host "=== Kiểm tra và loại bỏ file trống khỏi Git ===" -ForegroundColor Green

# 1. Kiểm tra file trống (không bao gồm node_modules)
Write-Host "`n1. Tìm file trống trong project..." -ForegroundColor Yellow
$emptyFiles = Get-ChildItem -Recurse -File | Where-Object { 
    $_.Length -eq 0 -and 
    $_.FullName -notlike "*node_modules*" -and
    $_.FullName -notlike "*\.git*"
}

if ($emptyFiles.Count -eq 0) {
    Write-Host "Không tìm thấy file trống nào!" -ForegroundColor Green
} else {
    Write-Host "Tìm thấy $($emptyFiles.Count) file trống:" -ForegroundColor Red
    $emptyFiles | ForEach-Object {
        Write-Host "  - $($_.FullName)" -ForegroundColor Red
    }
    
    # 2. Hỏi người dùng có muốn xóa không
    $response = Read-Host "`nBạn có muốn xóa các file trống này không? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        $emptyFiles | Remove-Item -Force
        Write-Host "Đã xóa $($emptyFiles.Count) file trống!" -ForegroundColor Green
    } else {
        Write-Host "Đã hủy xóa file trống." -ForegroundColor Yellow
    }
}

# 3. Kiểm tra .gitignore
Write-Host "`n2. Kiểm tra .gitignore..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore"
    $hasNodeModules = $gitignoreContent -contains "node_modules/"
    $hasEmptyFiles = $gitignoreContent -contains "# Empty files"
    
    if (-not $hasNodeModules) {
        Write-Host "Cảnh báo: node_modules/ chưa có trong .gitignore!" -ForegroundColor Red
    }
    
    if (-not $hasEmptyFiles) {
        Write-Host "Thêm rule cho file trống vào .gitignore..." -ForegroundColor Yellow
        Add-Content ".gitignore" "`n# Empty files`n*.empty`n"
        Write-Host "Đã thêm rule cho file trống!" -ForegroundColor Green
    }
} else {
    Write-Host "Tạo file .gitignore..." -ForegroundColor Yellow
    @"
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Empty files
*.empty

# Logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
"@ | Out-File ".gitignore" -Encoding UTF8
    Write-Host "Đã tạo file .gitignore!" -ForegroundColor Green
}

# 4. Hướng dẫn sử dụng Git Desktop
Write-Host "`n3. Hướng dẫn cho Git Desktop:" -ForegroundColor Yellow
Write-Host "   - Mở Git Desktop" -ForegroundColor White
Write-Host "   - Trong tab 'Changes', bỏ chọn các file trống" -ForegroundColor White
Write-Host "   - Hoặc sử dụng lệnh: git reset HEAD <tên_file>" -ForegroundColor White
Write-Host "   - Commit chỉ những file có nội dung" -ForegroundColor White

Write-Host "`n=== Hoàn thành! ===" -ForegroundColor Green 