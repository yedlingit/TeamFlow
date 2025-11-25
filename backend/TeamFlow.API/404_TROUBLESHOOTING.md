# 🔍 Rozwiązywanie problemu 404 - POST /api/Auth/register

## ⚠️ Problem: 404 Not Found przy POST /api/Auth/register

---

## ✅ Rozwiązanie 1: Sprawdź wielkość liter w URL

ASP.NET Core routing jest **case-sensitive** (wrażliwy na wielkość liter)!

### ❌ Nieprawidłowe URL:
```
POST http://localhost:5112/api/auth/register  (mała litera 'a')
POST http://localhost:5112/Api/Auth/register  (duża litera 'A' w Api)
```

### ✅ Prawidłowe URL:
```
POST http://localhost:5112/api/Auth/register  (duża litera 'A' w Auth)
```

**Kontroler ma route:** `[Route("api/[controller]")]`  
**Nazwa kontrolera:** `AuthController`  
**Więc route to:** `/api/Auth` (z dużą literą A!)

---

## ✅ Rozwiązanie 2: Sprawdź czy aplikacja działa

1. **Sprawdź czy aplikacja jest uruchomiona:**
   ```
   http://localhost:5112/openapi/v1.json
   ```
   Powinieneś zobaczyć JSON z OpenAPI.

2. **Sprawdź logi aplikacji:**
   - Otwórz terminal gdzie działa aplikacja
   - Sprawdź czy są błędy

---

## ✅ Rozwiązanie 3: Sprawdź konfigurację w Postman

### Prawidłowa konfiguracja:
- **Method:** `POST`
- **URL:** `http://localhost:5112/api/Auth/register` (z dużą literą A!)
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body:**
  - Wybierz **raw**
  - Wybierz **JSON** (z listy rozwijanej)
  - Wklej:
  ```json
  {
    "firstName": "Jan",
    "lastName": "Kowalski",
    "email": "jan.kowalski@example.com",
    "password": "Test123"
  }
  ```

---

## ✅ Rozwiązanie 4: Włącz case-insensitive routing (opcjonalne)

Jeśli chcesz, żeby routing był case-insensitive, możesz to skonfigurować w `Program.cs`:

```csharp
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        // Case-insensitive routing
    });

// LUB w pipeline:
app.UseRouting();
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
});
```

Ale lepiej używać prawidłowej wielkości liter w URL.

---

## 🔍 Diagnoza problemu

### Krok 1: Sprawdź dokładny URL w Postman
- Czy używasz `/api/Auth/register` (z dużą literą A)?
- Czy nie ma dodatkowych slashy na końcu?

### Krok 2: Sprawdź czy endpoint istnieje
Otwórz w przeglądarce:
```
http://localhost:5112/openapi/v1.json
```
Wyszukaj `"/api/Auth/register"` - powinien istnieć.

### Krok 3: Sprawdź logi aplikacji
- Otwórz terminal gdzie działa aplikacja
- Sprawdź czy są błędy przy starcie
- Sprawdź czy kontroler jest zarejestrowany

---

## 📋 Checklist

- [ ] URL używa `/api/Auth/register` (z dużą literą A)
- [ ] Aplikacja jest uruchomiona (sprawdź `http://localhost:5112/openapi/v1.json`)
- [ ] Method to `POST` (nie GET)
- [ ] Header `Content-Type: application/json` jest ustawiony
- [ ] Body jest w formacie JSON (raw → JSON)
- [ ] Port to `5112` (sprawdź w logach aplikacji)

---

## 🎯 Najczęstsze przyczyny 404

1. **❌ Nieprawidłowa wielkość liter:** `/api/auth/register` zamiast `/api/Auth/register`
2. **❌ Aplikacja nie działa:** Sprawdź czy proces działa
3. **❌ Nieprawidłowy port:** Sprawdź w logach aplikacji jaki port jest używany
4. **❌ Błąd w routingu:** Sprawdź czy kontroler jest poprawnie zarejestrowany

---

## 💡 Szybki test

Wklej to w Postman:

```
POST http://localhost:5112/api/Auth/register
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@test.com",
  "password": "test123"
}
```

**Upewnij się, że:**
- URL ma dużą literę **A** w `Auth`
- Port to `5112` (lub sprawdź w logach aplikacji)
- Method to `POST`

---

## 🆘 Jeśli nadal nie działa

1. **Sprawdź logi aplikacji** - mogą być błędy przy starcie
2. **Sprawdź czy kontroler jest w namespace:** `TeamFlow.API.Controllers`
3. **Sprawdź czy `app.MapControllers()` jest w `Program.cs`**
4. **Spróbuj zrestartować aplikację**

---

**Najczęstsza przyczyna:** Wielkość liter w URL! Użyj `/api/Auth/register` z dużą literą A! ✅

