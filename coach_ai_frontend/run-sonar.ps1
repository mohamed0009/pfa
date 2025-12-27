# PowerShell script to run tests and SonarQube analysis
# Usage: .\run-sonar.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SonarQube Analysis for Coach AI Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if SONAR_TOKEN environment variable is set
if (-not $env:SONAR_TOKEN) {
    Write-Host "⚠️  SONAR_TOKEN environment variable not set!" -ForegroundColor Yellow
    Write-Host "Please set it using: `$env:SONAR_TOKEN = 'your-token-here'" -ForegroundColor Yellow
    Write-Host "Or pass it as: .\run-sonar.ps1 -Token 'your-token-here'" -ForegroundColor Yellow
    Write-Host ""
    
    $token = Read-Host "Enter your SonarQube token (or press Enter to skip SonarQube analysis)"
    if ($token) {
        $env:SONAR_TOKEN = $token
    } else {
        Write-Host "Skipping SonarQube analysis. Only running tests..." -ForegroundColor Yellow
    }
}

# Step 1: Generate test coverage
Write-Host "Step 1: Running tests with coverage..." -ForegroundColor Green
npm test -- --code-coverage --watch=false

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Tests failed! Fix errors before running SonarQube analysis." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Tests completed successfully!" -ForegroundColor Green
Write-Host ""

# Check if coverage file exists
if (Test-Path "coverage\lcov.info") {
    Write-Host "✅ Coverage file generated: coverage\lcov.info" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: Coverage file not found at coverage\lcov.info" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Run SonarQube analysis
if ($env:SONAR_TOKEN) {
    Write-Host "Step 2: Running SonarQube analysis..." -ForegroundColor Green
    
    # Check if sonar-scanner is available
    $scannerCmd = Get-Command sonar-scanner -ErrorAction SilentlyContinue
    if (-not $scannerCmd) {
        Write-Host "⚠️  sonar-scanner not found. Trying npx..." -ForegroundColor Yellow
        npx sonarqube-scanner -Dsonar.login=$env:SONAR_TOKEN
    } else {
        sonar-scanner -Dsonar.login=$env:SONAR_TOKEN
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ SonarQube analysis completed successfully!" -ForegroundColor Green
        Write-Host "View results at: http://localhost:9000" -ForegroundColor Cyan
    } else {
        Write-Host "❌ SonarQube analysis failed!" -ForegroundColor Red
    }
} else {
    Write-Host "ℹ️  Skipping SonarQube analysis (no token provided)" -ForegroundColor Yellow
    Write-Host "To run analysis, set SONAR_TOKEN and run this script again" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Analysis Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

