# ⚡ Szybka checklista testowania API

## 🚀 Szybki start

### 1. POST /api/Auth/register
```
URL: http://localhost:5112/api/Auth/register
Method: POST
Headers: Content-Type: application/json
Body (raw JSON):
{
  "firstName": "Jan",
  "lastName": "Kowalski",
  "email": "jan.kowalski@example.com",
  "password": "Test123"
}
```
✅ Oczekiwany status: **201 Created**

---

### 2. POST /api/Auth/login
```
URL: http://localhost:5112/api/Auth/login
Method: POST
Headers: Content-Type: application/json
Body (raw JSON):
{
  "email": "jan.kowalski@example.com",
  "password": "Test123"
}
```
✅ Oczekiwany status: **200 OK**  
✅ Sprawdź zakładkę **Cookies** - powinien być cookie `.AspNetCore.Identity.Application`

---

### 3. GET /api/Auth/me
```
URL: http://localhost:5112/api/Auth/me
Method: GET
Headers: (brak - cookie automatycznie)
Body: (brak)
```
✅ Oczekiwany status: **200 OK**  
✅ Sprawdź czy zwrócone dane są poprawne

---

### 4. POST /api/Auth/logout
```
URL: http://localhost:5112/api/Auth/logout
Method: POST
Headers: (brak - cookie automatycznie)
Body: (brak)
```
✅ Oczekiwany status: **200 OK**  
✅ Sprawdź czy cookie został usunięty

---

## 📋 Testy błędów

### Test 1: Rejestracja z istniejącym emailem
```
POST /api/Auth/register
Body: {
  "firstName": "Test",
  "lastName": "User",
  "email": "jan.kowalski@example.com",  // już istnieje
  "password": "Test123"
}
```
✅ Oczekiwany status: **400 Bad Request**  
✅ Oczekiwany komunikat: "Użytkownik z tym adresem email już istnieje"

---

### Test 2: Logowanie z nieprawidłowym hasłem
```
POST /api/Auth/login
Body: {
  "email": "jan.kowalski@example.com",
  "password": "ZleHaslo"
}
```
✅ Oczekiwany status: **401 Unauthorized**  
✅ Oczekiwany komunikat: "Nieprawidłowy adres email lub hasło"

---

### Test 3: Dostęp do /me bez logowania
```
GET /api/Auth/me
```
✅ Oczekiwany status: **401 Unauthorized**

---

### Test 4: Rejestracja z za krótkim hasłem
```
POST /api/Auth/register
Body: {
  "firstName": "Test",
  "lastName": "User",
  "email": "test2@example.com",
  "password": "123"  // < 6 znaków
}
```
✅ Oczekiwany status: **400 Bad Request**  
✅ Oczekiwany komunikat: "Hasło musi mieć co najmniej 6 znaków"

---

### Test 5: Rejestracja z nieprawidłowym emailem
```
POST /api/Auth/register
Body: {
  "firstName": "Test",
  "lastName": "User",
  "email": "nieprawidlowy-email",  // brak @
  "password": "Test123"
}
```
✅ Oczekiwany status: **400 Bad Request**  
✅ Oczekiwany komunikat: "Nieprawidłowy format email"

---

## 🔄 Pełny flow testowy

1. ✅ **Rejestracja** → 201 Created
2. ✅ **Logowanie** → 200 OK (sprawdź cookie)
3. ✅ **Pobranie danych** → 200 OK (sprawdź dane)
4. ✅ **Wylogowanie** → 200 OK (sprawdź czy cookie usunięty)
5. ✅ **Próba pobrania danych po wylogowaniu** → 401 Unauthorized

---

## 💡 Wskazówki

- **Cookies:** Sprawdź zakładkę **Cookies** w Postman po każdym logowaniu
- **Zmienne:** Użyj zmiennej `{{baseUrl}}` dla łatwiejszego przełączania środowisk
- **Kolekcja:** Zapisz wszystkie requesty jako kolekcję w Postman
- **Testy:** Dodaj automatyczne testy w zakładce **Tests** w Postman

---

**Szczegółowy przewodnik:** Zobacz `TESTING_GUIDE.md` 📖

