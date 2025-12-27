# Script de diagnostic pour l'application Coach AI
Write-Host ""
Write-Host "=== DIAGNOSTIC DE L'APPLICATION COACH AI ===" -ForegroundColor Green
Write-Host ""

# 1. Vérification PostgreSQL
Write-Host "[1/5] Verification de PostgreSQL..." -ForegroundColor Yellow
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq "Running" } | Select-Object -First 1
if ($pgService) {
    Write-Host "  [OK] PostgreSQL en cours d'execution: $($pgService.Name)" -ForegroundColor Green
} else {
    Write-Host "  [ERREUR] PostgreSQL n'est pas demarre!" -ForegroundColor Red
    Write-Host "  Demarrage de PostgreSQL..." -ForegroundColor Yellow
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($pgService) {
        Start-Service -Name $pgService.Name
        Start-Sleep -Seconds 5
        Write-Host "  [OK] PostgreSQL demarre" -ForegroundColor Green
    } else {
        Write-Host "  [ERREUR] Impossible de trouver PostgreSQL!" -ForegroundColor Red
    }
}

# 2. Vérification Backend
Write-Host ""
Write-Host "[2/5] Verification du Backend (Port 8081)..." -ForegroundColor Yellow
$port8081 = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue
if ($port8081) {
    Write-Host "  [OK] Port 8081 est actif" -ForegroundColor Green
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8081/api/auth/test" -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "  [OK] API Backend repond: $($response.Content)" -ForegroundColor Green
    } catch {
        Write-Host "  [ATTENTION] API Backend ne repond pas: $_" -ForegroundColor Yellow
        Write-Host "  Le backend est peut-etre encore en cours de demarrage..." -ForegroundColor Yellow
    }
} else {
    Write-Host "  [ERREUR] Port 8081 n'est pas actif" -ForegroundColor Red
    Write-Host "  Le backend n'est pas demarre!" -ForegroundColor Red
    Write-Host "  Pour demarrer le backend:" -ForegroundColor Yellow
    Write-Host "    cd backend" -ForegroundColor White
    Write-Host "    mvn spring-boot:run" -ForegroundColor White
}

# 3. Vérification Frontend
Write-Host ""
Write-Host "[3/5] Verification du Frontend (Port 4200)..." -ForegroundColor Yellow
$port4200 = Get-NetTCPConnection -LocalPort 4200 -ErrorAction SilentlyContinue
if ($port4200) {
    Write-Host "  [OK] Port 4200 est actif" -ForegroundColor Green
    Write-Host "  Frontend accessible sur: http://localhost:4200" -ForegroundColor Cyan
} else {
    Write-Host "  [ERREUR] Port 4200 n'est pas actif" -ForegroundColor Red
    Write-Host "  Le frontend n'est pas demarre!" -ForegroundColor Red
    Write-Host "  Pour demarrer le frontend:" -ForegroundColor Yellow
    Write-Host "    cd coach_ai_frontend" -ForegroundColor White
    Write-Host "    npm start" -ForegroundColor White
}

# 4. Vérification Base de données
Write-Host ""
Write-Host "[4/5] Verification de la base de donnees..." -ForegroundColor Yellow
$env:PGPASSWORD = "ADMIN"
try {
    $dbCheck = & psql -h localhost -p 5433 -U postgres -d coach_ai_db -c "SELECT COUNT(*) FROM users;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Base de donnees accessible" -ForegroundColor Green
        Write-Host "  $dbCheck" -ForegroundColor White
    } else {
        Write-Host "  [ATTENTION] Probleme avec la base de donnees" -ForegroundColor Yellow
        Write-Host "  $dbCheck" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  [ATTENTION] Impossible de verifier la base de donnees" -ForegroundColor Yellow
}

# 5. Processus en cours
Write-Host ""
Write-Host "[5/5] Processus en cours..." -ForegroundColor Yellow
$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
$pythonProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue

Write-Host "  Java (Backend): $($javaProcesses.Count) processus" -ForegroundColor $(if ($javaProcesses) { "Green" } else { "Red" })
Write-Host "  Node (Frontend): $($nodeProcesses.Count) processus" -ForegroundColor $(if ($nodeProcesses) { "Green" } else { "Red" })
Write-Host "  Python (IA): $($pythonProcesses.Count) processus" -ForegroundColor $(if ($pythonProcesses) { "Green" } else { "Red" })

Write-Host ""
Write-Host "=== RESUME ===" -ForegroundColor Green
Write-Host ""
Write-Host "URLs de l'application:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:4200" -ForegroundColor White
Write-Host "  Backend:  http://localhost:8081" -ForegroundColor White
Write-Host "  API Test: http://localhost:8081/api/auth/test" -ForegroundColor White
Write-Host ""
Write-Host "Pour tester:" -ForegroundColor Yellow
Write-Host "  1. Ouvrez http://localhost:4200/signup" -ForegroundColor White
Write-Host "  2. Remplissez le formulaire avec un email valide:" -ForegroundColor White
Write-Host "     - Etudiant: *@etud.com" -ForegroundColor Green
Write-Host "     - Formateur: *@form.com" -ForegroundColor Green
Write-Host "     - Admin: *@adm.com" -ForegroundColor Green
Write-Host "  3. Ouvrez la console du navigateur (F12) pour voir les erreurs" -ForegroundColor White
Write-Host ""

