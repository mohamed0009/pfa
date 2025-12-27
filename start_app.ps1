# Script de démarrage Coach AI
Write-Host "=== CREATION BASE DE DONNEES ===" -ForegroundColor Cyan
$env:PGPASSWORD = "ADMIN"
psql -h localhost -p 5433 -U postgres -d postgres -c "DROP DATABASE IF EXISTS coach_ai_db;"
psql -h localhost -p 5433 -U postgres -d postgres -c "CREATE DATABASE coach_ai_db;"
Write-Host "Base de donnees creee" -ForegroundColor Green

Write-Host "`n=== APPLICATION SCHEMA SQL ===" -ForegroundColor Cyan
psql -h localhost -p 5433 -U postgres -d coach_ai_db -f backend\sql\coach_virtual.sql
Write-Host "Schema SQL applique" -ForegroundColor Green

Write-Host "`n=== DEMARRAGE SERVICE PYTHON ===" -ForegroundColor Cyan
Start-Process python -ArgumentList "serve_model.py"
Start-Sleep -Seconds 2

Write-Host "`n=== DEMARRAGE BACKEND ===" -ForegroundColor Cyan
Set-Location backend
if (Test-Path "target\coach-ai-0.0.1-SNAPSHOT.jar") {
    Start-Process java -ArgumentList "-jar", "target\coach-ai-0.0.1-SNAPSHOT.jar"
} else {
    Start-Process mvn -ArgumentList "spring-boot:run"
}
Set-Location ..
Start-Sleep -Seconds 2

Write-Host "`n=== DEMARRAGE FRONTEND ===" -ForegroundColor Cyan
Set-Location coach_ai_frontend
if (-not (Test-Path "node_modules")) {
    npm install
}
Start-Process npm -ArgumentList "start"
Set-Location ..

Write-Host "`n=== SERVICES DEMARRES ===" -ForegroundColor Green
Write-Host "Frontend: http://localhost:4200" -ForegroundColor White
Write-Host "Backend:  http://localhost:8081" -ForegroundColor White
Write-Host "Modele:   http://localhost:8000" -ForegroundColor White

