# 🚀 Szybki Start - TeamFlow API

## Uruchomienie aplikacji

### Opcja 1: Skrypt PowerShell (zalecane)
```powershell
cd backend\TeamFlow.API
.\run.ps1
```

### Opcja 2: Ręcznie
```powershell
cd backend\TeamFlow.API
dotnet run
```

### Opcja 3: Zatrzymaj istniejący proces i uruchom ponownie
```powershell
# Zatrzymaj wszystkie procesy TeamFlow
Get-Process | Where-Object {$_.ProcessName -like "*TeamFlow*"} | Stop-Process -Force

# Uruchom aplikację
cd backend\TeamFlow.API
dotnet run
```

---

## 🌐 Adresy aplikacji

Po uruchomieniu aplikacja będzie dostępna pod:

- **HTTP:** `http://localhost:5112`
- **HTTPS:** `https://localhost:7017`

---

## 📖 Dokumentacja API

### OpenAPI JSON
- `http://localhost:5112/openapi/v1.json`

### Swagger UI (online)
1. Otwórz https://editor.swagger.io/
2. Skopiuj zawartość z `http://localhost:5112/openapi/v1.json`
3. Wklej do edytora

---

## 🧪 Testowanie endpointów

### Przykład: Rejestracja
```bash
curl -X POST http://localhost:5112/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jan","lastName":"Kowalski","email":"test@test.com","password":"test123"}'
```

### Przykład: Logowanie
```bash
curl -X POST http://localhost:5112/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' \
  -c cookies.txt
```

### Przykład: Pobranie danych użytkownika
```bash
curl -X GET http://localhost:5112/api/auth/me \
  -b cookies.txt
```

---

## ⚠️ Rozwiązywanie problemów

### Problem: "Port already in use"
**Rozwiązanie:** Zmień port w `Properties/launchSettings.json`

### Problem: "File is locked by another process"
**Rozwiązanie:** 
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*TeamFlow*"} | Stop-Process -Force
```

### Problem: "Connection refused"
**Rozwiązanie:**
1. Sprawdź czy aplikacja działa (czy widzisz "Now listening on...")
2. Sprawdź zmienną środowiskową: `$env:ASPNETCORE_ENVIRONMENT="Development"`
3. Sprawdź firewall

---

## 📝 Uwagi

- Aplikacja automatycznie tworzy bazę danych SQLite (`teamflow.db`)
- Migracje są automatycznie aplikowane przy starcie
- W trybie Development OpenAPI jest dostępne pod `/openapi/v1.json`

