# Quick script to run SonarQube analysis now
# This will upload the coverage to SonarQube

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Running SonarQube Analysis" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if coverage file exists
if (-not (Test-Path "coverage\lcov.info")) {
    Write-Host "❌ Coverage file not found! Running tests first..." -ForegroundColor Red
    npm run test:coverage
    Write-Host ""
}

# Check for SonarQube token
if (-not $env:SONAR_TOKEN) {
    Write-Host "⚠️  SONAR_TOKEN not set!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To get your token:" -ForegroundColor Cyan
    Write-Host "1. Go to http://localhost:9000" -ForegroundColor White
    Write-Host "2. Login → My Account → Security" -ForegroundColor White
    Write-Host "3. Generate a token" -ForegroundColor White
    Write-Host ""
    $token = Read-Host "Enter your SonarQube token (or press Enter to skip)"
    if ($token) {
        $env:SONAR_TOKEN = $token
    } else {
        Write-Host "Skipping SonarQube analysis..." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "Running SonarQube scanner..." -ForegroundColor Green
Write-Host ""

# Run sonar-scanner
sonar-scanner -Dsonar.login=$env:SONAR_TOKEN

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Analysis completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "View results at: http://localhost:9000" -ForegroundColor Cyan
    Write-Host "Project: Coach AI Frontend" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Coverage should now show ~29% instead of 0%!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Analysis failed. Check the error messages above." -ForegroundColor Red
}

