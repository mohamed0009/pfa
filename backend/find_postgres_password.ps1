# Script simple pour trouver le mot de passe PostgreSQL
Write-Host "=== Recherche du mot de passe PostgreSQL ===" -ForegroundColor Cyan
Write-Host ""

# Chercher psql
$psqlPath = $null
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\18\bin\psql.exe",
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        Write-Host "✅ PostgreSQL trouvé : $path" -ForegroundColor Green
        break
    }
}

if (-not $psqlPath) {
    Write-Host "❌ PostgreSQL non trouvé." -ForegroundColor Red
    Write-Host "Veuillez installer PostgreSQL ou vérifier le chemin." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Mots de passe courants à tester :" -ForegroundColor Yellow
$passwords = @("root", "postgres", "admin", "IDRISSI@2001", "password", "")

$found = $false
foreach ($pwd in $passwords) {
    Write-Host "  Test : " -NoNewline
    if ($pwd -eq "") {
        Write-Host "(vide)" -NoNewline -ForegroundColor Gray
    } else {
        Write-Host $pwd -NoNewline -ForegroundColor Gray
    }
    
    $env:PGPASSWORD = $pwd
    $result = & $psqlPath -U postgres -d postgres -c "SELECT 1;" 2>&1 | Out-Null
    $env:PGPASSWORD = $null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅ SUCCÈS !" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎯 Mot de passe trouvé : " -NoNewline -ForegroundColor Green
        if ($pwd -eq "") {
            Write-Host "(vide - pas de mot de passe)" -ForegroundColor Green
        } else {
            Write-Host $pwd -ForegroundColor Green
        }
        Write-Host ""
        Write-Host "Mettez à jour application.properties avec :" -ForegroundColor Yellow
        Write-Host "spring.datasource.password=$pwd" -ForegroundColor Cyan
        $found = $true
        break
    } else {
        Write-Host " ❌" -ForegroundColor Red
    }
}

if (-not $found) {
    Write-Host ""
    Write-Host "❌ Aucun mot de passe testé n'a fonctionné." -ForegroundColor Red
    Write-Host ""
    Write-Host "Veuillez entrer votre mot de passe PostgreSQL manuellement :" -ForegroundColor Yellow
    $manualPassword = Read-Host "Mot de passe (ou Entrée pour quitter)"
    
    if ($manualPassword) {
        $env:PGPASSWORD = $manualPassword
        $result = & $psqlPath -U postgres -d postgres -c "SELECT 1;" 2>&1 | Out-Null
        $env:PGPASSWORD = $null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ SUCCÈS ! Le mot de passe fonctionne : $manualPassword" -ForegroundColor Green
            Write-Host ""
            Write-Host "Mettez à jour application.properties avec :" -ForegroundColor Yellow
            Write-Host "spring.datasource.password=$manualPassword" -ForegroundColor Cyan
        } else {
            Write-Host ""
            Write-Host "❌ Ce mot de passe ne fonctionne pas." -ForegroundColor Red
            Write-Host ""
            Write-Host "Options :" -ForegroundColor Yellow
            Write-Host "1. Vérifiez le mot de passe dans pgAdmin" -ForegroundColor White
            Write-Host "2. Réinitialisez le mot de passe PostgreSQL" -ForegroundColor White
            Write-Host "3. Vérifiez si PostgreSQL utilise l'authentification Windows" -ForegroundColor White
        }
    }
}


