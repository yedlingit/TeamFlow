# 🔍 Debugowanie błędu 500 - POST /api/Auth/register

## ⚠️ Problem: 500 Internal Server Error

Endpoint zwraca **500**, nie **404** - to znaczy, że **routing działa**, ale jest błąd w kodzie.

---

## ✅ Rozwiązanie 1: Sprawdź szczegóły błędu

Middleware został zaktualizowany, żeby w trybie Development pokazywać szczegóły błędu.

### Sprawdź odpowiedź z serwera:
W Postman, po wysłaniu requestu, sprawdź **Response Body** - powinien zawierać:
```json
{
  "error": "Szczegóły błędu",
  "stackTrace": "...",
  "innerException": "..."
}
```

---

## ✅ Rozwiązanie 2: Sprawdź logi aplikacji

1. **Otwórz terminal gdzie działa aplikacja**
2. **Sprawdź logi** - powinny być szczegóły błędu
3. **Szukaj linii z:** `An unhandled exception occurred`

---

## ✅ Rozwiązanie 3: Najczęstsze przyczyny 500

### 1. Problem z bazą danych
- Sprawdź czy migracje zostały zastosowane
- Sprawdź czy baza danych istnieje: `teamflow.db`

### 2. Problem z Identity
- Sprawdź czy `UserManager` jest poprawnie skonfigurowany
- Sprawdź czy `ApplicationUser` jest poprawnie zdefiniowany

### 3. Problem z zależnościami
- Sprawdź czy wszystkie pakiety NuGet są zainstalowane
- Sprawdź czy referencje między projektami są poprawne

---

## 🔧 Szybka diagnostyka

### Krok 1: Sprawdź czy baza danych istnieje
```powershell
cd backend\TeamFlow.API
Test-Path teamflow.db
```

### Krok 2: Sprawdź logi aplikacji
W terminalu gdzie działa aplikacja, szukaj:
- `An unhandled exception occurred`
- `Database migrations applied successfully`
- Błędy związane z `UserManager` lub `Identity`

### Krok 3: Sprawdź odpowiedź z serwera
W Postman, sprawdź **Response Body** - powinien zawierać szczegóły błędu.

---

## 📋 Checklist

- [ ] Sprawdź Response Body w Postman (szczegóły błędu)
- [ ] Sprawdź logi aplikacji w terminalu
- [ ] Sprawdź czy baza danych istnieje (`teamflow.db`)
- [ ] Sprawdź czy migracje zostały zastosowane
- [ ] Sprawdź czy aplikacja została zrestartowana po zmianach

---

## 🆘 Jeśli nadal nie działa

1. **Zrestartuj aplikację:**
   ```powershell
   # Zatrzymaj aplikację (Ctrl+C)
   # Uruchom ponownie:
   cd backend\TeamFlow.API
   dotnet run
   ```

2. **Sprawdź czy wszystkie pakiety są zainstalowane:**
   ```powershell
   cd backend\TeamFlow.API
   dotnet restore
   ```

3. **Sprawdź czy projekt się kompiluje:**
   ```powershell
   cd backend\TeamFlow.API
   dotnet build
   ```

---

**Najważniejsze:** Sprawdź **Response Body** w Postman i **logi aplikacji** - tam będą szczegóły błędu! 🔍

