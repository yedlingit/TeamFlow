# 🔧 Rozwiązywanie problemów - Swagger

## Problem: Swagger nie uruchamia się / localhost odrzuca połączenie

### Rozwiązanie 1: Sprawdź porty

Aplikacja uruchamia się na:
- **HTTP:** `http://localhost:5112`
- **HTTPS:** `https://localhost:7017`

OpenAPI dostępny pod:
- `http://localhost:5112/openapi/v1.json` - JSON schema
- Możesz użyć https://editor.swagger.io/ aby zobaczyć interfejs Swagger UI (wklej zawartość JSON)

### Rozwiązanie 2: Sprawdź czy aplikacja działa

1. Uruchom aplikację:
```bash
cd backend/TeamFlow.API
dotnet run
```

2. Sprawdź w konsoli czy widzisz:
```
Now listening on: http://localhost:5112
Now listening on: https://localhost:7017
```

### Rozwiązanie 3: Sprawdź zmienną środowiskową

Upewnij się, że `ASPNETCORE_ENVIRONMENT=Development` jest ustawione.

W Visual Studio: Properties → launchSettings.json → environmentVariables

W terminalu:
```bash
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet run
```

### Rozwiązanie 4: Sprawdź czy port nie jest zajęty

Jeśli port jest zajęty, zmień go w `launchSettings.json`:
```json
"applicationUrl": "http://localhost:5000"
```

### Rozwiązanie 5: Sprawdź logi błędów

Sprawdź konsolę aplikacji - mogą być błędy związane z:
- Migracjami bazy danych
- Konfiguracją Identity
- Connection string

### Rozwiązanie 6: Wyłącz HTTPS redirection w Development

W `Program.cs` HTTPS redirection jest już wyłączone w Development mode.

### Rozwiązanie 7: Sprawdź firewall

Upewnij się, że firewall nie blokuje połączeń na portach 5112/7017.

---

## Szybki test

1. Uruchom aplikację:
```bash
cd backend/TeamFlow.API
dotnet run
```

2. Otwórz w przeglądarce:
   - `http://localhost:5112/openapi/v1.json`
   - LUB skopiuj zawartość i wklej do https://editor.swagger.io/

3. Jeśli nadal nie działa, sprawdź:
   - Czy widzisz błędy w konsoli?
   - Czy port jest zajęty?
   - Czy zmienna środowiskowa jest ustawiona?

---

## Alternatywa: Użyj Postman/Thunder Client

Jeśli Swagger nie działa, możesz testować API przez:
- Postman
- Thunder Client (VS Code extension)
- curl

Przykład curl:
```bash
curl -X POST http://localhost:5112/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jan","lastName":"Kowalski","email":"test@test.com","password":"test123"}'
```

