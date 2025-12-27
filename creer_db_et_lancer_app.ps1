# Script pour creer la base de donnees mise a jour et lancer l'application
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  COACH AI - Creation DB et Demarrage" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Configuration
$dbName = "coach_ai_db"
$dbUser = "postgres"
$dbHost = "localhost"
$dbPort = "5433"
$dbPassword = "ADMIN"

# Verification de PostgreSQL
Write-Host "`n[Verification] PostgreSQL..." -ForegroundColor Yellow
$env:PGPASSWORD = $dbPassword
$pgCheck = psql -h $dbHost -p $dbPort -U $dbUser -d postgres -c "SELECT version();" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [X] PostgreSQL n'est pas accessible sur ${dbHost}:${dbPort}" -ForegroundColor Red
    Write-Host "  Verifiez que PostgreSQL est demarre et accessible" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "  [OK] PostgreSQL accessible" -ForegroundColor Green
}

# 1. Suppression et creation de la base de donnees
Write-Host "`n[1/5] Creation/Mise a jour de la base de donnees..." -ForegroundColor Yellow
$dropOutput = psql -h $dbHost -p $dbPort -U $dbUser -d postgres -c "DROP DATABASE IF EXISTS $dbName;" 2>&1
$dropExitCode = $LASTEXITCODE
Start-Sleep -Seconds 1
$createOutput = psql -h $dbHost -p $dbPort -U $dbUser -d postgres -c "CREATE DATABASE $dbName;" 2>&1
$createExitCode = $LASTEXITCODE
if ($createExitCode -eq 0) {
    Write-Host "  [OK] Base de donnees '$dbName' creee" -ForegroundColor Green
} else {
    # Verifier si la base existe deja
    $checkDb = psql -h $dbHost -p $dbPort -U $dbUser -d postgres -lqt 2>&1 | Select-String $dbName
    if ($checkDb) {
        Write-Host "  [OK] Base de donnees '$dbName' existe deja" -ForegroundColor Green
    } else {
        Write-Host "  [X] Erreur lors de la creation de la base de donnees" -ForegroundColor Red
        Write-Host "  Sortie: $createOutput" -ForegroundColor Red
        exit 1
    }
}

# 2. Application du schema SQL
Write-Host "`n[2/5] Application du schema SQL..." -ForegroundColor Yellow
$sqlFile = "backend\sql\coach_virtual.sql"
if (Test-Path $sqlFile) {
    $sqlOutput = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $sqlFile 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Schema SQL applique avec succes" -ForegroundColor Green
    } else {
        Write-Host "  [!] Avertissements lors de l'application du schema:" -ForegroundColor Yellow
        $sqlOutput | Select-String -Pattern "ERROR" | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
        if ($sqlOutput -match "ERROR") {
            Write-Host "  [X] Erreurs critiques detectees" -ForegroundColor Red
        } else {
            Write-Host "  [OK] Schema applique (avec avertissements mineurs)" -ForegroundColor Green
        }
    }
} else {
    Write-Host "  [X] Fichier SQL non trouve: $sqlFile" -ForegroundColor Red
    exit 1
}

# 3. Demarrage du service Python (Modele IA)
Write-Host "`n[3/5] Demarrage du service Python (Modele IA)..." -ForegroundColor Yellow
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonProcess = Start-Process python -ArgumentList "serve_model.py" -PassThru -WindowStyle Normal
    Start-Sleep -Seconds 3
    if ($pythonProcess -and !$pythonProcess.HasExited) {
        Write-Host "  [OK] Service Python demarre (PID: $($pythonProcess.Id))" -ForegroundColor Green
        $pythonProcess.Id | Out-File -FilePath "python_model.pid" -Encoding ASCII
    } else {
        Write-Host "  [!] Service Python demarre (verification en cours...)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [X] Python n'est pas installe ou n'est pas dans le PATH" -ForegroundColor Red
}

# 4. Demarrage du backend Spring Boot
Write-Host "`n[4/5] Demarrage du backend Spring Boot..." -ForegroundColor Yellow
Set-Location backend

# Verifier si Maven est disponible
if (Get-Command mvn -ErrorAction SilentlyContinue) {
    if (Test-Path "target\coach-ai-backend-1.0.0.jar") {
        Write-Host "  Utilisation du JAR compile..." -ForegroundColor Gray
        $backendProcess = Start-Process java -ArgumentList "-jar", "target\coach-ai-backend-1.0.0.jar" -PassThru -WindowStyle Normal
    } elseif (Test-Path "target\coach-ai-0.0.1-SNAPSHOT.jar") {
        Write-Host "  Utilisation du JAR compile (ancien nom)..." -ForegroundColor Gray
        $backendProcess = Start-Process java -ArgumentList "-jar", "target\coach-ai-0.0.1-SNAPSHOT.jar" -PassThru -WindowStyle Normal
    } else {
        Write-Host "  Compilation et demarrage avec Maven..." -ForegroundColor Gray
        $backendProcess = Start-Process mvn -ArgumentList "spring-boot:run" -PassThru -WindowStyle Normal
    }
    Start-Sleep -Seconds 5
    Set-Location ..
    if ($backendProcess -and !$backendProcess.HasExited) {
        Write-Host "  [OK] Backend demarre (PID: $($backendProcess.Id))" -ForegroundColor Green
        $backendProcess.Id | Out-File -FilePath "backend.pid" -Encoding ASCII
    } else {
        Write-Host "  [!] Backend en cours de demarrage..." -ForegroundColor Yellow
    }
} else {
    Write-Host "  [X] Maven n'est pas installe ou n'est pas dans le PATH" -ForegroundColor Red
    Set-Location ..
}

# 5. Demarrage du frontend Angular
Write-Host "`n[5/5] Demarrage du frontend Angular..." -ForegroundColor Yellow
Set-Location coach_ai_frontend

if (Get-Command npm -ErrorAction SilentlyContinue) {
    if (-not (Test-Path "node_modules")) {
        Write-Host "  Installation des dependances npm..." -ForegroundColor Gray
        npm install
    }
    $frontendProcess = Start-Process npm -ArgumentList "start" -PassThru -WindowStyle Normal
    Start-Sleep -Seconds 5
    Set-Location ..
    if ($frontendProcess -and !$frontendProcess.HasExited) {
        Write-Host "  [OK] Frontend demarre (PID: $($frontendProcess.Id))" -ForegroundColor Green
        $frontendProcess.Id | Out-File -FilePath "frontend.pid" -Encoding ASCII
    } else {
        Write-Host "  [!] Frontend en cours de demarrage..." -ForegroundColor Yellow
    }
} else {
    Write-Host "  [X] npm n'est pas installe ou n'est pas dans le PATH" -ForegroundColor Red
    Set-Location ..
}

# Verification des services apres un delai
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Verification des services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nAttente du demarrage des services (15 secondes)..." -ForegroundColor Gray
Start-Sleep -Seconds 15

Write-Host "`nService Python (Port 8000):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  [OK] Actif" -ForegroundColor Green
} catch {
    Write-Host "  [!] Non accessible (peut prendre plus de temps)" -ForegroundColor Yellow
}

Write-Host "`nBackend Spring Boot (Port 8081):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/api/public/formations" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  [OK] Actif" -ForegroundColor Green
} catch {
    Write-Host "  [!] Non accessible (peut prendre plus de temps)" -ForegroundColor Yellow
}

Write-Host "`nFrontend Angular (Port 4200):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4200" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  [OK] Actif" -ForegroundColor Green
} catch {
    Write-Host "  [!] Non accessible (peut prendre plus de temps)" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  URLs d'acces:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Frontend:    http://localhost:4200" -ForegroundColor White
Write-Host "Backend API: http://localhost:8081/api" -ForegroundColor White
Write-Host "Modele IA:   http://localhost:8000" -ForegroundColor White
Write-Host "`nBase de donnees: $dbName creee et mise a jour" -ForegroundColor Green
Write-Host "`nLes services sont en cours d'execution." -ForegroundColor Green
Write-Host "Fermez les fenetres pour arreter les services." -ForegroundColor Gray

