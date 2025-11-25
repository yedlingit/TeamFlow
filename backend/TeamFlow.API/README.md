# TeamFlow API - Instrukcja uruchomienia

## 🚀 Szybki start

### 1. Uruchom aplikację

```bash
cd backend/TeamFlow.API
dotnet run
```

### 2. Sprawdź porty

Aplikacja uruchamia się na:
- **HTTP:** `http://localhost:5112`
- **HTTPS:** `https://localhost:7017`

### 3. Otwórz OpenAPI

W .NET 9 używamy wbudowanego OpenAPI. Dokumentacja dostępna pod:
- `http://localhost:5112/openapi/v1.json` - JSON schema
- LUB użyj narzędzia jak Swagger UI online: https://editor.swagger.io/ (wklej zawartość z `/openapi/v1.json`)

**Alternatywa:** Możesz użyć VS Code extension "REST Client" lub Postman do testowania API.

---

## 🔧 Rozwiązywanie problemów

### Problem: "Connection refused" / localhost odrzuca połączenie

**Rozwiązanie 1:** Sprawdź czy aplikacja działa
- Uruchom `dotnet run` i sprawdź czy widzisz w konsoli:
  ```
  Now listening on: http://localhost:5112
  Now listening on: https://localhost:7017
  ```

**Rozwiązanie 2:** Sprawdź czy port nie jest zajęty
- Jeśli port jest zajęty, zmień go w `Properties/launchSettings.json`

**Rozwiązanie 3:** Sprawdź zmienną środowiskową
- Upewnij się, że `ASPNETCORE_ENVIRONMENT=Development`
- W PowerShell:
  ```powershell
  $env:ASPNETCORE_ENVIRONMENT="Development"
  dotnet run
  ```

**Rozwiązanie 4:** Sprawdź firewall
- Upewnij się, że firewall nie blokuje portów 5112/7017

**Rozwiązanie 5:** Sprawdź logi błędów
- Sprawdź konsolę aplikacji - mogą być błędy związane z:
  - Migracjami bazy danych
  - Konfiguracją Identity
  - Connection string

---

## 📋 Endpointy API

### Autoryzacja
- `POST /api/auth/register` - Rejestracja
- `POST /api/auth/login` - Logowanie
- `POST /api/auth/logout` - Wylogowanie (wymaga autoryzacji)
- `GET /api/auth/me` - Dane użytkownika (wymaga autoryzacji)

---

## 🗄️ Baza danych

Baza danych SQLite jest automatycznie tworzona w pliku `teamflow.db` w katalogu projektu.

Migracje są automatycznie aplikowane przy starcie aplikacji.

---

## 🧪 Testowanie

### Przez OpenAPI
1. Uruchom aplikację
2. Otwórz `http://localhost:5112/openapi/v1.json` w przeglądarce
3. Skopiuj zawartość JSON
4. Wklej do https://editor.swagger.io/ aby zobaczyć interfejs Swagger UI
5. LUB użyj Postman/Thunder Client do importu z `/openapi/v1.json`

### Przez curl
```bash
# Rejestracja
curl -X POST http://localhost:5112/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jan","lastName":"Kowalski","email":"test@test.com","password":"test123"}'

# Logowanie
curl -X POST http://localhost:5112/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' \
  -c cookies.txt

# Me (z cookie)
curl -X GET http://localhost:5112/api/auth/me \
  -b cookies.txt
```

---

## 📝 Uwagi

- Swagger jest dostępny tylko w trybie Development
- Cookie Authentication wymaga `credentials: 'include'` w frontendzie
- CORS jest skonfigurowany dla `localhost:3000` i `localhost:5173`

