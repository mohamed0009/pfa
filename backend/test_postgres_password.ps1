# Script pour tester le mot de passe PostgreSQL
Write-Host "=== Test du mot de passe PostgreSQL ===" -ForegroundColor Cyan
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
    Write-Host "❌ PostgreSQL non trouvé. Veuillez installer PostgreSQL." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Mots de passe à tester :" -ForegroundColor Yellow
$passwords = @("root", "postgres", "admin", "IDRISSI@2001", "")

foreach ($pwd in $passwords) {
    Write-Host "  Test avec : " -NoNewline
    if ($pwd -eq "") {
        Write-Host "(mot de passe vide)" -ForegroundColor Gray
    } else {
        Write-Host $pwd -ForegroundColor Gray
    }
    
    $env:PGPASSWORD = $pwd
    $result = & $psqlPath -U postgres -d postgres -c "SELECT version();" 2>&1
    $env:PGPASSWORD = $null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ SUCCÈS ! Le mot de passe est : " -NoNewline -ForegroundColor Green
        if ($pwd -eq "") {
            Write-Host "(vide)" -ForegroundColor Green
        } else {
            Write-Host $pwd -ForegroundColor Green
        }
        Write-Host ""
        Write-Host "Mettez à jour application.properties avec ce mot de passe." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "❌ Aucun mot de passe testé n'a fonctionné." -ForegroundColor Red
Write-Host ""
Write-Host "Options :" -ForegroundColor Yellow
Write-Host "1. Entrez manuellement le mot de passe PostgreSQL" -ForegroundColor White
Write-Host "2. Réinitialisez le mot de passe PostgreSQL via pgAdmin" -ForegroundColor White
Write-Host "3. Utilisez l'authentification Windows si configurée" -ForegroundColor White
Write-Host ""
$manualPassword = Read-Host "Entrez votre mot de passe PostgreSQL (ou appuyez sur Entrée pour quitter)"
if ($manualPassword) {
    $env:PGPASSWORD = $manualPassword
    $result = & $psqlPath -U postgres -d postgres -c "SELECT version();" 2>&1
    $env:PGPASSWORD = $null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ SUCCÈS ! Le mot de passe fonctionne : $manualPassword" -ForegroundColor Green
        Write-Host ""
        Write-Host "Mettez à jour application.properties avec :" -ForegroundColor Yellow
        Write-Host "spring.datasource.password=$manualPassword" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Ce mot de passe ne fonctionne pas non plus." -ForegroundColor Red
    }
}

