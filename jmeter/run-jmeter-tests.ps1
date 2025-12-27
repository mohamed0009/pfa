# PowerShell script to run JMeter tests for Coach AI
# Usage: .\run-jmeter-tests.ps1

param(
    [string]$TestPlan = "Coach_AI_Test_Plan.jmx",
    [int]$Users = 10,
    [int]$RampUp = 5,
    [int]$Duration = 60,
    [string]$OutputDir = "jmeter-results"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "JMeter Performance Testing - Coach AI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if JMeter is installed
$jmeterPath = Get-Command jmeter -ErrorAction SilentlyContinue
if (-not $jmeterPath) {
    Write-Host "❌ JMeter not found in PATH!" -ForegroundColor Red
    Write-Host "Please install JMeter or add it to PATH" -ForegroundColor Yellow
    Write-Host "Download from: https://jmeter.apache.org/download_jmeter.cgi" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ JMeter found: $($jmeterPath.Source)" -ForegroundColor Green
Write-Host ""

# Check if test plan exists
if (-not (Test-Path $TestPlan)) {
    Write-Host "❌ Test plan not found: $TestPlan" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Test Plan: $TestPlan" -ForegroundColor Cyan
Write-Host "👥 Users: $Users" -ForegroundColor Cyan
Write-Host "⏱️  Ramp-up: $RampUp seconds" -ForegroundColor Cyan
Write-Host "⏳ Duration: $Duration seconds" -ForegroundColor Cyan
Write-Host ""

# Create output directory
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$resultsDir = "$OutputDir\$timestamp"
New-Item -ItemType Directory -Force -Path $resultsDir | Out-Null

Write-Host "📁 Results will be saved to: $resultsDir" -ForegroundColor Green
Write-Host ""

# Check if backend is running
Write-Host "🔍 Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/api/auth/test" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend is running!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Warning: Could not connect to backend at http://localhost:8081" -ForegroundColor Yellow
    Write-Host "   Make sure the backend is running before starting tests" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 0
    }
}

Write-Host ""
Write-Host "🚀 Starting JMeter tests..." -ForegroundColor Green
Write-Host ""

# Run JMeter in non-GUI mode
$jtlFile = "$resultsDir\results.jtl"
$htmlReport = "$resultsDir\html-report"

jmeter -n -t $TestPlan `
    -l $jtlFile `
    -e -o $htmlReport `
    -JBASE_URL=http://localhost:8081 `
    -JUSER_EMAIL=test@etud.com `
    -JUSER_PASSWORD=password123

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Tests completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Results:" -ForegroundColor Cyan
    Write-Host "   JTL File: $jtlFile" -ForegroundColor White
    Write-Host "   HTML Report: $htmlReport\index.html" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Opening HTML report..." -ForegroundColor Cyan
    
    # Open HTML report in default browser
    Start-Process "$htmlReport\index.html"
} else {
    Write-Host ""
    Write-Host "❌ Tests failed! Check the error messages above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

