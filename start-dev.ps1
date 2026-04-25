# Script de demarrage AMOUCH - Mode developpement

Write-Host "=== Demarrage de AMOUCH - Plateforme Veterinaire ===" -ForegroundColor Cyan
Write-Host ""

# Verifier si Node.js est installe
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js installe: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Node.js n'est pas installe!" -ForegroundColor Red
    Write-Host "Telechargez Node.js depuis: https://nodejs.org" -ForegroundColor Yellow
    exit
}

# Verifier si MySQL est en cours d'execution
Write-Host ""
Write-Host "Verification de MySQL..." -ForegroundColor Yellow
$mysqlRunning = Get-Process mysqld -ErrorAction SilentlyContinue
if ($mysqlRunning) {
    Write-Host "[OK] MySQL est en cours d'execution" -ForegroundColor Green
} else {
    Write-Host "[ATTENTION] MySQL ne semble pas en cours d'execution" -ForegroundColor Yellow
    Write-Host "Assurez-vous que MySQL est demarre avant de continuer" -ForegroundColor Yellow
    $continue = Read-Host "Continuer quand meme? (o/n)"
    if ($continue -ne "o") {
        exit
    }
}

Write-Host ""
Write-Host "Installation des dependances..." -ForegroundColor Cyan

# Frontend
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
if (-not (Test-Path "node_modules")) {
    npm install
}
Set-Location ..

# Services
$services = @("animals", "veterinary", "adoptions", "awareness", "reservations", "stocks", "appointments", "messages", "auth")
foreach ($service in $services) {
    Write-Host "Installing $service service dependencies..." -ForegroundColor Yellow
    Set-Location "services/$service"
    if (-not (Test-Path "node_modules")) {
        npm install
    }
    Set-Location ../..
}

Write-Host ""
Write-Host "[OK] Toutes les dependances sont installees!" -ForegroundColor Green
Write-Host ""
Write-Host "Demarrage des services..." -ForegroundColor Cyan
Write-Host ""

# Demarrer les services en arriere-plan
Write-Host "Demarrage du service Animaux (port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services/animals; npm start"

Start-Sleep -Seconds 2

Write-Host "Demarrage du service Veterinaire (port 3002)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services/veterinary; npm start"

Start-Sleep -Seconds 2

Write-Host "Demarrage du service Adoptions (port 3003)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services/adoptions; npm start"

Start-Sleep -Seconds 2

Write-Host "Demarrage du service Sensibilisation (port 3004)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services/awareness; npm start"

Start-Sleep -Seconds 2

Write-Host "Demarrage du service Reservations (port 3005)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services/reservations; npm start"

Start-Sleep -Seconds 2

Write-Host "Demarrage du service Stocks (port 3006)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services/stocks; npm start"

Start-Sleep -Seconds 2

Write-Host "Demarrage du service Rendez-vous (port 3007)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services/appointments; npm start"

Start-Sleep -Seconds 2

Write-Host "Demarrage du service Messages (port 3008)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services/messages; npm start"

Start-Sleep -Seconds 2

Write-Host "Demarrage du service Authentification (port 3009)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services/auth; npm start"

Start-Sleep -Seconds 3

Write-Host "Demarrage du Frontend React (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"

Write-Host ""
Write-Host "[OK] Tous les services sont en cours de demarrage!" -ForegroundColor Green
Write-Host ""
Write-Host "L'application sera disponible dans quelques secondes sur:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Services API:" -ForegroundColor Cyan
Write-Host "   Animaux:          http://localhost:3001" -ForegroundColor White
Write-Host "   Veterinaire:      http://localhost:3002" -ForegroundColor White
Write-Host "   Adoptions:        http://localhost:3003" -ForegroundColor White
Write-Host "   Sensibilisation:  http://localhost:3004" -ForegroundColor White
Write-Host "   Reservations:     http://localhost:3005" -ForegroundColor White
Write-Host "   Stocks:           http://localhost:3006" -ForegroundColor White
Write-Host "   Rendez-vous:      http://localhost:3007" -ForegroundColor White
Write-Host "   Messages:         http://localhost:3008" -ForegroundColor White
Write-Host "   Authentification: http://localhost:3009" -ForegroundColor White
Write-Host ""
Write-Host "[ATTENTION] Pour arreter tous les services, fermez toutes les fenetres PowerShell ouvertes" -ForegroundColor Yellow
Write-Host ""
