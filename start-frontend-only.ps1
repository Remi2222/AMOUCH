# Demarrage FRONTEND UNIQUEMENT - Mode Demo

Write-Host "=== Demarrage AMOUCH - Mode DEMO (Frontend uniquement) ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "[INFO] Ce mode demarre uniquement le frontend" -ForegroundColor Yellow
Write-Host "[INFO] Aucune connexion base de donnees requise" -ForegroundColor Yellow
Write-Host "[INFO] Les fonctionnalites backend ne fonctionneront pas" -ForegroundColor Yellow
Write-Host ""

# Verifier Node.js
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Node.js non installe!" -ForegroundColor Red
    Write-Host "Telechargez: https://nodejs.org" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Installation des dependances frontend..." -ForegroundColor Yellow
Set-Location frontend

if (-not (Test-Path "node_modules")) {
    npm install
} else {
    Write-Host "[OK] Dependances deja installees" -ForegroundColor Green
}

Write-Host ""
Write-Host "Demarrage du frontend..." -ForegroundColor Cyan
Write-Host ""
Write-Host "[OK] Le frontend va s'ouvrir sur http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "[INFO] Appuyez sur Ctrl+C pour arreter" -ForegroundColor Yellow
Write-Host ""

npm start


