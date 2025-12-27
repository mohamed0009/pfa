# Script de démarrage complet de l'application Coach AI
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  COACH AI - Démarrage Complet" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Configuration
$dbName = "coach_ai_db"
$dbUser = "postgres"
$dbHost = "localhost"
$dbPort = "5433"
$dbPassword = "ADMIN"

# 1. Création de la base de données
Write-Host "`n[1/5] Création de la base de données..." -ForegroundColor Yellow
$env:PGPASSWORD = $dbPassword
$checkDb = psql -h $dbHost -p $dbPort -U $dbUser -d postgres -lqt 2>&1 | Select-String $dbName
if ($checkDb) {
    Write-Host "  ✓ Base de données existe déjà" -ForegroundColor Green
} else {
    psql -h $dbHost -p $dbPort -U $dbUser -d postgres -c "CREATE DATABASE $dbName;" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Base de données créée" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Erreur création base de données" -ForegroundColor Red
        exit 1
    }
}

# 2. Application du schéma SQL
Write-Host "`n[2/5] Application du schéma SQL..." -ForegroundColor Yellow
$sqlFile = "backend\sql\coach_virtual.sql"
if (Test-Path $sqlFile) {
    psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $sqlFile 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Schéma SQL appliqué" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Erreur application schéma SQL" -ForegroundColor Red
    }
} else {
    Write-Host "  ✗ Fichier SQL non trouvé: $sqlFile" -ForegroundColor Red
}

# 3. Démarrage du service Python (Modèle IA)
Write-Host "`n[3/5] Démarrage du service Python (Modèle IA)..." -ForegroundColor Yellow
$pythonProcess = Start-Process python -ArgumentList "serve_model.py" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 3
if ($pythonProcess -and !$pythonProcess.HasExited) {
    Write-Host "  ✓ Service Python démarré (PID: $($pythonProcess.Id))" -ForegroundColor Green
    $pythonProcess.Id | Out-File -FilePath "python_model.pid" -Encoding ASCII
} else {
    Write-Host "  ✗ Erreur démarrage service Python" -ForegroundColor Red
}

# 4. Démarrage du backend Spring Boot
Write-Host "`n[4/5] Démarrage du backend Spring Boot..." -ForegroundColor Yellow
Set-Location backend
if (Test-Path "target\coach-ai-0.0.1-SNAPSHOT.jar") {
    $backendProcess = Start-Process java -ArgumentList "-jar", "target\coach-ai-0.0.1-SNAPSHOT.jar" -PassThru -WindowStyle Hidden
} else {
    $backendProcess = Start-Process mvn -ArgumentList "spring-boot:run" -PassThru -WindowStyle Hidden
}
Start-Sleep -Seconds 5
Set-Location ..
if ($backendProcess -and !$backendProcess.HasExited) {
    Write-Host "  ✓ Backend démarré (PID: $($backendProcess.Id))" -ForegroundColor Green
    $backendProcess.Id | Out-File -FilePath "backend.pid" -Encoding ASCII
} else {
    Write-Host "  ✗ Erreur démarrage backend" -ForegroundColor Red
}

# 5. Démarrage du frontend Angular
Write-Host "`n[5/5] Démarrage du frontend Angular..." -ForegroundColor Yellow
Set-Location coach_ai_frontend
if (-not (Test-Path "node_modules")) {
    Write-Host "  Installation des dépendances npm..." -ForegroundColor Gray
    npm install
}
$frontendProcess = Start-Process npm -ArgumentList "start" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 5
Set-Location ..
if ($frontendProcess -and !$frontendProcess.HasExited) {
    Write-Host "  ✓ Frontend démarré (PID: $($frontendProcess.Id))" -ForegroundColor Green
    $frontendProcess.Id | Out-File -FilePath "frontend.pid" -Encoding ASCII
} else {
    Write-Host "  ✗ Erreur démarrage frontend" -ForegroundColor Red
}

# Vérification des services
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Vérification des services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host "`nService Python (Port 8000):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  ✓ Actif" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Non accessible" -ForegroundColor Red
}

Write-Host "`nBackend Spring Boot (Port 8081):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/api/public/formations" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  ✓ Actif" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Non accessible" -ForegroundColor Red
}

Write-Host "`nFrontend Angular (Port 4200):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4200" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  ✓ Actif" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Non accessible" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  URLs d'accès:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Frontend:    http://localhost:4200" -ForegroundColor White
Write-Host "Backend API: http://localhost:8081/api" -ForegroundColor White
Write-Host "Modèle IA:   http://localhost:8000" -ForegroundColor White
Write-Host "`nAppuyez sur une touche pour arrêter les services..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

