# Script PowerShell pour mettre a jour les emails des utilisateurs selon leur role
# Usage: .\update_user_emails.ps1

Write-Host ""
Write-Host "=== MISE A JOUR DES EMAILS UTILISATEURS ===" -ForegroundColor Green
Write-Host ""
Write-Host "Ce script met a jour les emails des utilisateurs existants selon leur role:" -ForegroundColor Cyan
Write-Host "  - Etudiants (USER): @etud" -ForegroundColor White
Write-Host "  - Formateurs (TRAINER): @form" -ForegroundColor White
Write-Host "  - Administrateurs (ADMIN): @adm" -ForegroundColor White

# Configuration PostgreSQL
$dbName = "coach_virtual"
$dbUser = "postgres"
$dbHost = "localhost"
$dbPort = "5432"
$sqlFile = "backend\sql\update_user_emails.sql"
$useTcpIp = $false  # Variable globale pour savoir si on utilise TCP/IP

# Fonction pour tester la connexion PostgreSQL
function Test-PostgreSQLConnection {
    param(
        [string]$User,
        [string]$Database = "",
        [string]$Host = "",
        [string]$Port = "5432",
        [string]$Password = ""
    )
    
    if ($Password) {
        $env:PGPASSWORD = $Password
    }
    
    $testQuery = "SELECT 1;"
    
    # Essayer d'abord sans -h pour connexion locale (socket Unix/Windows)
    $psqlArgs = @("-U", $User)
    if ($Database) {
        $psqlArgs += @("-d", $Database)
    }
    $psqlArgs += @("-c", $testQuery)
    
    $result = & psql $psqlArgs 2>&1
    if ($LASTEXITCODE -eq 0) {
        return @{Success = $true; Result = $result; UseTcpIp = $false; Host = ""; Port = ""}
    }
    
    # Si ça échoue, essayer avec -h localhost (TCP/IP)
    if ($Host) {
        $psqlArgs = @("-U", $User, "-h", $Host, "-p", $Port)
        if ($Database) {
            $psqlArgs += @("-d", $Database)
        }
        $psqlArgs += @("-c", $testQuery)
        
        $result = & psql $psqlArgs 2>&1
        if ($LASTEXITCODE -eq 0) {
            return @{Success = $true; Result = $result; UseTcpIp = $true; Host = $Host; Port = $Port}
        }
    }
    
    return @{Success = $false; Result = $result; UseTcpIp = $false; Host = ""; Port = ""}
}

# Fonction pour construire les arguments psql
function Get-PsqlArgs {
    param(
        [string]$User,
        [string]$Database = "",
        [bool]$UseTcpIp = $false,
        [string]$Host = "localhost",
        [string]$Port = "5432",
        [string]$Command = "",
        [string]$File = ""
    )
    
    $args = @("-U", $User)
    
    if ($UseTcpIp) {
        $args += @("-h", $Host, "-p", $Port)
    }
    
    if ($Database) {
        $args += @("-d", $Database)
    }
    
    if ($File) {
        $args += @("-f", $File)
    } elseif ($Command) {
        $args += @("-c", $Command)
    }
    
    return $args
}

# Verifier si le fichier SQL existe
if (-not (Test-Path $sqlFile)) {
    Write-Host ""
    Write-Host "[ERREUR] Le fichier SQL n'existe pas: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[1/4] Verification de PostgreSQL..." -ForegroundColor Yellow

# Verifier et demarrer le service PostgreSQL
$pgServices = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if (-not $pgServices) {
    Write-Host "[ERREUR] Aucun service PostgreSQL trouve." -ForegroundColor Red
    Write-Host "Veuillez installer PostgreSQL ou demarrer le service manuellement." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pour demarrer PostgreSQL manuellement:" -ForegroundColor Cyan
    Write-Host "  - Ouvrez Services (services.msc)" -ForegroundColor White
    Write-Host "  - Trouvez le service PostgreSQL" -ForegroundColor White
    Write-Host "  - Cliquez droit > Demarrer" -ForegroundColor White
    exit 1
}

# Trouver le service PostgreSQL actif
$pgService = $pgServices | Where-Object { $_.Status -eq "Running" } | Select-Object -First 1

if (-not $pgService) {
    Write-Host "[ATTENTION] Aucun service PostgreSQL en cours d'execution." -ForegroundColor Yellow
    Write-Host "Tentative de demarrage du service PostgreSQL..." -ForegroundColor Yellow
    
    # Essayer de demarrer le premier service PostgreSQL trouve
    $pgService = $pgServices | Select-Object -First 1
    
    try {
        Write-Host "Demarrage du service: $($pgService.Name)" -ForegroundColor Cyan
        Start-Service -Name $pgService.Name -ErrorAction Stop
        Write-Host "Attente du demarrage complet (10 secondes)..." -ForegroundColor Cyan
        Start-Sleep -Seconds 10
        
        # Verifier que le service est bien demarre
        $pgService = Get-Service -Name $pgService.Name
        if ($pgService.Status -ne "Running") {
            Write-Host "[ERREUR] Le service n'a pas pu demarrer." -ForegroundColor Red
            Write-Host "Veuillez demarrer PostgreSQL manuellement." -ForegroundColor Yellow
            exit 1
        }
        Write-Host "[OK] Service PostgreSQL demarre avec succes." -ForegroundColor Green
    } catch {
        Write-Host "[ERREUR] Impossible de demarrer le service PostgreSQL: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Veuillez demarrer PostgreSQL manuellement:" -ForegroundColor Yellow
        Write-Host "  1. Ouvrez Services (Win+R, tapez: services.msc)" -ForegroundColor White
        Write-Host "  2. Trouvez le service PostgreSQL" -ForegroundColor White
        Write-Host "  3. Cliquez droit > Demarrer" -ForegroundColor White
        Write-Host "  4. Reessayez ce script" -ForegroundColor White
        exit 1
    }
} else {
    Write-Host "[OK] Service PostgreSQL en cours d'execution: $($pgService.Name)" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/4] Verification de la connexion a la base de donnees..." -ForegroundColor Yellow

# Demander le mot de passe PostgreSQL
Write-Host "Entrez le mot de passe PostgreSQL pour l'utilisateur '$dbUser':" -ForegroundColor Cyan
$password = Read-Host "Mot de passe (ou appuyez sur Entree si aucun)"

# Test de connexion - essayer d'abord sans host (connexion locale)
Write-Host "Test de connexion a PostgreSQL (connexion locale)..." -ForegroundColor Cyan
$connectionInfo = Test-PostgreSQLConnection -User $dbUser -Password $password

if (-not $connectionInfo.Success) {
    Write-Host "[ATTENTION] Connexion locale echouee. Essai avec TCP/IP..." -ForegroundColor Yellow
    
    # Essayer avec différents ports courants
    $commonPorts = @("5432", "5433", "5434")
    $connectionInfo = $null
    
    foreach ($port in $commonPorts) {
        Write-Host "Essai sur le port $port..." -ForegroundColor Cyan
        $testConnection = Test-PostgreSQLConnection -User $dbUser -Host $dbHost -Port $port -Password $password
        if ($testConnection.Success) {
            $connectionInfo = $testConnection
            $dbPort = $port
            Write-Host "[OK] Connexion reussie sur le port $port" -ForegroundColor Green
            break
        }
    }
    
    if (-not $connectionInfo -or -not $connectionInfo.Success) {
        $connectionInfo = @{Success = $false; Result = "Tous les essais de connexion ont echoue"}
    }
}

$useTcpIp = $connectionInfo.UseTcpIp
if ($connectionInfo.Host) {
    $dbHost = $connectionInfo.Host
}
if ($connectionInfo.Port) {
    $dbPort = $connectionInfo.Port
}

if (-not $connectionInfo.Success) {
    Write-Host "[ERREUR] Impossible de se connecter a PostgreSQL." -ForegroundColor Red
        Write-Host "Details: $($connectionInfo.Result)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Solutions possibles:" -ForegroundColor Yellow
    Write-Host "  1. Verifiez que PostgreSQL est bien demarre" -ForegroundColor White
    Write-Host "  2. Verifiez le mot de passe de l'utilisateur 'postgres'" -ForegroundColor White
    Write-Host "  3. Essayez de vous connecter manuellement avec:" -ForegroundColor White
    Write-Host "     psql -U postgres" -ForegroundColor Cyan
    Write-Host "     ou" -ForegroundColor White
    Write-Host "     psql -U postgres -h localhost" -ForegroundColor Cyan
    Write-Host "  4. Verifiez le fichier pg_hba.conf pour autoriser les connexions" -ForegroundColor White
    Write-Host "  5. Redemarrez le service PostgreSQL" -ForegroundColor White
    exit 1
}

Write-Host "[OK] Connexion a PostgreSQL reussie." -ForegroundColor Green

# Verifier si la base de donnees existe
Write-Host "Verification de l'existence de la base de donnees '$dbName'..." -ForegroundColor Cyan

try {
    $dbCheckQuery = "SELECT 1 FROM pg_database WHERE datname = '$dbName';"
    $psqlArgs = Get-PsqlArgs -User $dbUser -UseTcpIp $useTcpIp -Host $dbHost -Port $dbPort -Command $dbCheckQuery
    $psqlArgs += @("-t", "-A")
    
    $dbExists = & psql $psqlArgs 2>&1
    
    if ($LASTEXITCODE -ne 0 -or -not $dbExists -or $dbExists.ToString().Trim() -ne "1") {
        Write-Host "[ATTENTION] La base de donnees '$dbName' n'existe pas." -ForegroundColor Yellow
        Write-Host "Creation de la base de donnees..." -ForegroundColor Cyan
        
        $createDbQuery = "CREATE DATABASE $dbName;"
        $psqlArgs = Get-PsqlArgs -User $dbUser -UseTcpIp $useTcpIp -Host $dbHost -Port $dbPort -Command $createDbQuery
        
        $createResult = & psql $psqlArgs 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Base de donnees creee avec succes." -ForegroundColor Green
        } else {
            Write-Host "[ERREUR] Impossible de creer la base de donnees." -ForegroundColor Red
            Write-Host "Details: $createResult" -ForegroundColor Red
            Write-Host ""
            Write-Host "Vous pouvez creer la base manuellement avec:" -ForegroundColor Yellow
            if ($useTcpIp) {
                Write-Host "  psql -U postgres -h $dbHost -p $dbPort -c `"CREATE DATABASE $dbName;`"" -ForegroundColor Cyan
            } else {
                Write-Host "  psql -U postgres -c `"CREATE DATABASE $dbName;`"" -ForegroundColor Cyan
            }
            exit 1
        }
    } else {
        Write-Host "[OK] Base de donnees '$dbName' existe." -ForegroundColor Green
    }
    
    # Test de connexion a la base de donnees
    $testQuery = "SELECT 1;"
    $psqlArgs = Get-PsqlArgs -User $dbUser -Database $dbName -UseTcpIp $useTcpIp -Host $dbHost -Port $dbPort -Command $testQuery
    
    $testResult = & psql $psqlArgs 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERREUR] Impossible de se connecter a la base de donnees '$dbName'." -ForegroundColor Red
        Write-Host "Details: $testResult" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "[OK] Connexion a la base de donnees reussie." -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Erreur lors de la verification de connexion: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[3/4] Execution du script SQL..." -ForegroundColor Yellow

# Executer le script SQL
try {
    Write-Host "Execution de: $sqlFile" -ForegroundColor Cyan
    
    $psqlArgs = Get-PsqlArgs -User $dbUser -Database $dbName -UseTcpIp $useTcpIp -Host $dbHost -Port $dbPort -File $sqlFile
    
    $result = & psql $psqlArgs 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Script SQL execute avec succes." -ForegroundColor Green
        Write-Host ""
        Write-Host "Resultats:" -ForegroundColor Cyan
        Write-Host $result -ForegroundColor White
    } else {
        Write-Host "[ERREUR] Erreur lors de l'execution du script SQL." -ForegroundColor Red
        Write-Host "Details: $result" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERREUR] Erreur lors de l'execution du script: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[4/4] Verification des resultats..." -ForegroundColor Yellow

# Verifier les resultats
try {
    $checkQuery = "SELECT role, COUNT(*) as total, COUNT(CASE WHEN email LIKE '%@etud' THEN 1 END) as etud_count, COUNT(CASE WHEN email LIKE '%@form' THEN 1 END) as form_count, COUNT(CASE WHEN email LIKE '%@adm' THEN 1 END) as adm_count FROM users GROUP BY role ORDER BY role;"
    
    Write-Host ""
    Write-Host "Statistiques des emails par role:" -ForegroundColor Cyan
    
    $psqlArgs = Get-PsqlArgs -User $dbUser -Database $dbName -UseTcpIp $useTcpIp -Host $dbHost -Port $dbPort -Command $checkQuery
    
    $checkResult = & psql $psqlArgs 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host $checkResult -ForegroundColor White
    } else {
        Write-Host "[ATTENTION] Impossible de recuperer les statistiques." -ForegroundColor Yellow
    }
} catch {
    Write-Host "[ATTENTION] Erreur lors de la verification: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== MISE A JOUR TERMINEE ===" -ForegroundColor Green
Write-Host ""
Write-Host "Les emails ont ete mis a jour selon les regles suivantes:" -ForegroundColor Cyan
Write-Host "  - USER (Etudiants): @etud" -ForegroundColor White
Write-Host "  - TRAINER (Formateurs): @form" -ForegroundColor White
Write-Host "  - ADMIN (Administrateurs): @adm" -ForegroundColor White
Write-Host ""
Write-Host "Vous pouvez maintenant tester la page de signup!" -ForegroundColor Green
