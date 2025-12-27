# Script PowerShell pour exécuter les tests Selenium

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tests Selenium - Coach AI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que le frontend est démarré
Write-Host "Vérification du frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4200" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Frontend est démarré" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Frontend non démarré sur http://localhost:4200" -ForegroundColor Yellow
    Write-Host "   Démarrez le frontend avec: cd coach_ai_frontend && npm start" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continuer quand même? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Vérifier que le backend est démarré
Write-Host "Vérification du backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/api/auth/test" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Backend est démarré" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend non démarré sur http://localhost:8081" -ForegroundColor Yellow
    Write-Host "   Démarrez le backend avec: cd backend && mvn spring-boot:run" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continuer quand même? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

Write-Host ""
Write-Host "Exécution des tests..." -ForegroundColor Cyan
Write-Host ""

# Créer les dossiers nécessaires
New-Item -ItemType Directory -Force -Path reports, screenshots | Out-Null

# Exécuter les tests
python run_tests.py

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tests terminés!" -ForegroundColor Cyan
Write-Host "Rapport HTML: reports\report.html" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

