# Skrypt do uruchamiania aplikacji TeamFlow API

Write-Host "Zatrzymywanie istniejących procesów..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*TeamFlow*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

Write-Host "Budowanie projektu..." -ForegroundColor Cyan
dotnet build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nUruchamianie aplikacji..." -ForegroundColor Green
    Write-Host "Aplikacja będzie dostępna pod:" -ForegroundColor Yellow
    Write-Host "  - http://localhost:5112" -ForegroundColor White
    Write-Host "  - https://localhost:7017" -ForegroundColor White
    Write-Host "`nOpenAPI dokumentacja:" -ForegroundColor Yellow
    Write-Host "  - http://localhost:5112/openapi/v1.json" -ForegroundColor White
    Write-Host "`nNaciśnij Ctrl+C aby zatrzymać aplikację`n" -ForegroundColor Gray
    dotnet run
} else {
    Write-Host "`nBłąd kompilacji! Sprawdź błędy powyżej." -ForegroundColor Red
    exit 1
}

