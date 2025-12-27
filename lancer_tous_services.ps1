# Script pour lancer tous les services manuellement
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LANCEMENT DE TOUS LES SERVICES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Configuration
$dbName = "coach_ai_db"
$dbUser = "postgres"
$dbHost = "localhost"
$dbPort = "5433"
$dbPassword = "ADMIN"

# 1. Vérification et création de la base de données
Write-Host "`n[1/5] Base de données PostgreSQL..." -ForegroundColor Yellow
$env:PGPASSWORD = $dbPassword
$checkDb = psql -h $dbHost -p $dbPort -U $dbUser -d postgres -lqt 2>&1 | Select-String $dbName
if (-not $checkDb) {
    psql -h $dbHost -p $dbPort -U $dbUser -d postgres -c "CREATE DATABASE $dbName;" 2>&1 | Out-Null
    Write-Host "  ✅ Base de données créée" -ForegroundColor Green
} else {
    Write-Host "  ✅ Base de données existe déjà" -ForegroundColor Green
}

# Application du schéma SQL
if (Test-Path "backend\sql\coach_virtual.sql") {
    psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f backend\sql\coach_virtual.sql 2>&1 | Out-Null
    Write-Host "  ✅ Schéma SQL appliqué" -ForegroundColor Green
}

# 2. Démarrage du service Python (Modèle ML)
Write-Host "`n[2/5] Service Python (Modèle ML)..." -ForegroundColor Yellow
$pythonProcess = Start-Process python -ArgumentList "serve_model.py" -PassThru -WindowStyle Normal
Start-Sleep -Seconds 2
if ($pythonProcess -and !$pythonProcess.HasExited) {
    Write-Host "  ✅ Service Python démarré (PID: $($pythonProcess.Id))" -ForegroundColor Green
    $pythonProcess.Id | Out-File -FilePath "python_model.pid" -Encoding ASCII
} else {
    Write-Host "  ⚠️ Service Python en cours de démarrage..." -ForegroundColor Yellow
}

# 3. Démarrage du backend Spring Boot
Write-Host "`n[3/5] Backend Spring Boot..." -ForegroundColor Yellow
Set-Location backend
if (Test-Path "target\coach-ai-0.0.1-SNAPSHOT.jar") {
    $backendProcess = Start-Process java -ArgumentList "-jar", "target\coach-ai-0.0.1-SNAPSHOT.jar" -PassThru -WindowStyle Normal
} else {
    $backendProcess = Start-Process mvn -ArgumentList "spring-boot:run" -PassThru -WindowStyle Normal
}
Start-Sleep -Seconds 3
Set-Location ..
if ($backendProcess -and !$backendProcess.HasExited) {
    Write-Host "  ✅ Backend démarré (PID: $($backendProcess.Id))" -ForegroundColor Green
    $backendProcess.Id | Out-File -FilePath "backend.pid" -Encoding ASCII
} else {
    Write-Host "  ⚠️ Backend en cours de démarrage..." -ForegroundColor Yellow
}

# 4. Démarrage du frontend Angular
Write-Host "`n[4/5] Frontend Angular..." -ForegroundColor Yellow
Set-Location coach_ai_frontend
if (-not (Test-Path "node_modules")) {
    Write-Host "  Installation des dépendances npm..." -ForegroundColor Gray
    npm install
}
$frontendProcess = Start-Process npm -ArgumentList "start" -PassThru -WindowStyle Normal
Start-Sleep -Seconds 3
Set-Location ..
if ($frontendProcess -and !$frontendProcess.HasExited) {
    Write-Host "  ✅ Frontend démarré (PID: $($frontendProcess.Id))" -ForegroundColor Green
    $frontendProcess.Id | Out-File -FilePath "frontend.pid" -Encoding ASCII
} else {
    Write-Host "  ⚠️ Frontend en cours de démarrage..." -ForegroundColor Yellow
}

# 5. Résumé
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  SERVICES LANCÉS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nBase de données: $dbName" -ForegroundColor Green
Write-Host "Service Python:  Port 8000 (PID: $($pythonProcess.Id))" -ForegroundColor White
Write-Host "Backend:         Port 8081 (PID: $($backendProcess.Id))" -ForegroundColor White
Write-Host "Frontend:        Port 4200 (PID: $($frontendProcess.Id))" -ForegroundColor White
Write-Host "`nURLs d'accès:" -ForegroundColor Cyan
Write-Host "  Frontend:    http://localhost:4200" -ForegroundColor White
Write-Host "  Backend API: http://localhost:8081/api" -ForegroundColor White
Write-Host "  Modèle IA:   http://localhost:8000" -ForegroundColor White
Write-Host "`nLes services sont en cours d'exécution dans des fenêtres séparées." -ForegroundColor Gray
Write-Host "Fermez les fenêtres pour arrêter les services." -ForegroundColor Gray

