# Clean empty files from Git
Write-Host "Cleaning empty files from Git..." -ForegroundColor Green

# Find empty files (excluding node_modules and .git)
$emptyFiles = Get-ChildItem -Recurse -File | Where-Object { 
    $_.Length -eq 0 -and 
    $_.FullName -notlike "*node_modules*" -and
    $_.FullName -notlike "*\.git*"
}

if ($emptyFiles.Count -eq 0) {
    Write-Host "No empty files found!" -ForegroundColor Green
} else {
    Write-Host "Found $($emptyFiles.Count) empty files:" -ForegroundColor Yellow
    $emptyFiles | ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor Red
    }
    
    $response = Read-Host "Do you want to remove these empty files? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        $emptyFiles | Remove-Item -Force
        Write-Host "Removed $($emptyFiles.Count) empty files!" -ForegroundColor Green
    }
}

# Check .gitignore
Write-Host "`nChecking .gitignore..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    $content = Get-Content ".gitignore"
    if ($content -notcontains "node_modules/") {
        Add-Content ".gitignore" "`nnode_modules/"
        Write-Host "Added node_modules/ to .gitignore" -ForegroundColor Green
    }
} else {
    "node_modules/`n*.log`n.env`n.DS_Store`nThumbs.db" | Out-File ".gitignore" -Encoding UTF8
    Write-Host "Created .gitignore file" -ForegroundColor Green
}

Write-Host "`nDone! Now you can:" -ForegroundColor Green
Write-Host "1. Open Git Desktop" -ForegroundColor White
Write-Host "2. Uncheck empty files in Changes tab" -ForegroundColor White
Write-Host "3. Commit only files with content" -ForegroundColor White 