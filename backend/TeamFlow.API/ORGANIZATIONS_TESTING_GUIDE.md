# 🧪 Przewodnik testowania endpointów Organizacji

## 📋 Spis treści
1. [Przygotowanie](#przygotowanie)
2. [Testowanie endpointów](#testowanie-endpointów)
3. [Scenariusze testowe](#scenariusze-testowe)
4. [Troubleshooting](#troubleshooting)

---

## 🔧 Przygotowanie

### Krok 1: Upewnij się, że aplikacja działa
```
http://localhost:5112/openapi/v1.json
```

### Krok 2: Zaloguj się (lub zarejestruj nowego użytkownika)

**POST /api/Auth/login**
```
URL: http://localhost:5112/api/Auth/login
Method: POST
Headers: Content-Type: application/json
Body:
{
  "email": "jan.kowalski@example.com",
  "password": "Test123"
}
```

✅ Po zalogowaniu powinieneś mieć cookie w Postman.

---

## 🎯 Testowanie endpointów

### 1️⃣ POST /api/Organizations - Utworzenie organizacji

#### Konfiguracja requestu:
- **Method:** `POST`
- **URL:** `http://localhost:5112/api/Organizations`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "name": "Moja Firma Sp. z o.o.",
    "description": "Opis mojej organizacji"
  }
  ```

#### Przykładowe requesty:

**✅ Prawidłowy request:**
```json
{
  "name": "Tech Solutions",
  "description": "Firma zajmująca się rozwiązaniami IT"
}
```

**Oczekiwana odpowiedź (201 Created):**
```json
{
  "id": 1,
  "name": "Tech Solutions",
  "description": "Firma zajmująca się rozwiązaniami IT",
  "invitationCode": "ABC12345",
  "createdAt": "2025-11-25T00:00:00Z"
}
```

**⚠️ WAŻNE:** 
- Użytkownik zostanie automatycznie przypisany jako **Administrator**
- Kod zaproszenia (`invitationCode`) jest generowany automatycznie (8 znaków)

**❌ Błędny request - użytkownik już należy do organizacji:**
```json
{
  "name": "Nowa Organizacja",
  "description": "Test"
}
```

**Oczekiwana odpowiedź (400 Bad Request):**
```json
{
  "error": "Użytkownik już należy do organizacji"
}
```

**❌ Błędny request - brakujące pole:**
```json
{
  "description": "Test"
  // brakuje "name"
}
```

**Oczekiwana odpowiedź (400 Bad Request):**
```json
{
  "errors": {
    "Name": ["Nazwa organizacji jest wymagana"]
  }
}
```

---

### 2️⃣ POST /api/Organizations/join - Dołączenie do organizacji

#### Konfiguracja requestu:
- **Method:** `POST`
- **URL:** `http://localhost:5112/api/Organizations/join`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "invitationCode": "ABC12345"
  }
  ```

#### ⚠️ WAŻNE:
- Musisz być zalogowany jako użytkownik, który **NIE** należy do żadnej organizacji
- Użyj kodu zaproszenia z utworzonej organizacji

#### Przykładowe requesty:

**✅ Prawidłowy request:**
```json
{
  "invitationCode": "ABC12345"
}
```

**Oczekiwana odpowiedź (200 OK):**
```json
{
  "organizationId": 1,
  "organizationName": "Tech Solutions",
  "message": "Successfully joined organization"
}
```

**⚠️ WAŻNE:** 
- Użytkownik zostanie przypisany jako **Member** (nie Administrator)
- Użytkownik zostanie przypisany do organizacji

**❌ Błędny request - nieprawidłowy kod:**
```json
{
  "invitationCode": "NIEPRAWIDLOWY"
}
```

**Oczekiwana odpowiedź (404 Not Found):**
```json
{
  "error": "Nieprawidłowy kod zaproszenia"
}
```

**❌ Błędny request - użytkownik już należy do organizacji:**
```json
{
  "invitationCode": "ABC12345"
}
```

**Oczekiwana odpowiedź (400 Bad Request):**
```json
{
  "error": "Użytkownik już należy do organizacji"
}
```

---

### 3️⃣ GET /api/Organizations/current - Pobranie organizacji użytkownika

#### Konfiguracja requestu:
- **Method:** `GET`
- **URL:** `http://localhost:5112/api/Organizations/current`
- **Headers:** (brak - cookie automatycznie)
- **Body:** (brak)

#### Przykładowe requesty:

**✅ Prawidłowy request (po dołączeniu do organizacji):**
- Najpierw utwórz organizację LUB dołącz do organizacji
- Następnie wykonaj GET request

**Oczekiwana odpowiedź (200 OK):**
```json
{
  "id": 1,
  "name": "Tech Solutions",
  "description": "Firma zajmująca się rozwiązaniami IT",
  "invitationCode": "ABC12345",
  "createdAt": "2025-11-25T00:00:00Z",
  "memberCount": 2,
  "projectCount": 0
}
```

**❌ Błędny request - użytkownik nie należy do organizacji:**
- Wykonaj request **BEZ** wcześniejszego utworzenia/dołączenia do organizacji

**Oczekiwana odpowiedź (404 Not Found):**
```json
{
  "error": "Użytkownik nie należy do żadnej organizacji"
}
```

---

### 4️⃣ GET /api/Organizations/{id} - Pobranie szczegółów organizacji

#### Konfiguracja requestu:
- **Method:** `GET`
- **URL:** `http://localhost:5112/api/Organizations/1` (zastąp `1` ID organizacji)
- **Headers:** (brak - cookie automatycznie)
- **Body:** (brak)

#### Przykładowe requesty:

**✅ Prawidłowy request (użytkownik należy do organizacji):**
```
GET http://localhost:5112/api/Organizations/1
```

**Oczekiwana odpowiedź (200 OK):**
```json
{
  "id": 1,
  "name": "Tech Solutions",
  "description": "Firma zajmująca się rozwiązaniami IT",
  "invitationCode": "ABC12345",
  "createdAt": "2025-11-25T00:00:00Z",
  "memberCount": 2,
  "projectCount": 0
}
```

**❌ Błędny request - użytkownik nie należy do tej organizacji:**
```
GET http://localhost:5112/api/Organizations/999
```

**Oczekiwana odpowiedź (403 Forbidden):**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.3",
  "title": "Forbidden",
  "status": 403
}
```

**❌ Błędny request - organizacja nie istnieje:**
```
GET http://localhost:5112/api/Organizations/999
```
(jeśli użytkownik należy do organizacji 1, ale próbuje dostać się do 999)

**Oczekiwana odpowiedź (404 Not Found):**
```json
{
  "error": "Organizacja nie została znaleziona"
}
```

---

### 5️⃣ PUT /api/Organizations/{id} - Aktualizacja organizacji

#### Konfiguracja requestu:
- **Method:** `PUT`
- **URL:** `http://localhost:5112/api/Organizations/1`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "name": "Nowa Nazwa",
    "description": "Zaktualizowany opis"
  }
  ```

#### ⚠️ WAŻNE:
- Tylko **Administrator** organizacji może aktualizować
- Musisz być zalogowany jako Administrator

#### Przykładowe requesty:

**✅ Prawidłowy request (jako Administrator):**
```json
{
  "name": "Tech Solutions - Zaktualizowane",
  "description": "Nowy opis organizacji"
}
```

**Oczekiwana odpowiedź (200 OK):**
```json
{
  "id": 1,
  "name": "Tech Solutions - Zaktualizowane",
  "description": "Nowy opis organizacji",
  "invitationCode": "ABC12345",
  "createdAt": "2025-11-25T00:00:00Z"
}
```

**❌ Błędny request - brak uprawnień (Member zamiast Administrator):**
- Zaloguj się jako użytkownik, który dołączył przez kod (Member)
- Spróbuj zaktualizować organizację

**Oczekiwana odpowiedź (403 Forbidden):**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.3",
  "title": "Forbidden",
  "status": 403
}
```

---

### 6️⃣ DELETE /api/Organizations/{id} - Usunięcie organizacji

#### Konfiguracja requestu:
- **Method:** `DELETE`
- **URL:** `http://localhost:5112/api/Organizations/1`
- **Headers:** (brak - cookie automatycznie)
- **Body:** (brak)

#### ⚠️ WAŻNE:
- Tylko **Administrator** organizacji może usunąć
- Musisz być zalogowany jako Administrator

#### Przykładowe requesty:

**✅ Prawidłowy request (jako Administrator):**
```
DELETE http://localhost:5112/api/Organizations/1
```

**Oczekiwana odpowiedź (204 No Content):**
- Brak body, tylko status 204

**❌ Błędny request - brak uprawnień:**
- Zaloguj się jako Member
- Spróbuj usunąć organizację

**Oczekiwana odpowiedź (403 Forbidden):**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.3",
  "title": "Forbidden",
  "status": 403
}
```

---

## 📝 Scenariusze testowe

### Scenariusz 1: Pełny flow tworzenia organizacji

1. **Rejestracja nowego użytkownika**
   ```
   POST /api/Auth/register
   Body: {
     "firstName": "Jan",
     "lastName": "Kowalski",
     "email": "jan@example.com",
     "password": "Test123"
   }
   ```
   ✅ Oczekiwany status: **201 Created**

2. **Logowanie**
   ```
   POST /api/Auth/login
   Body: {
     "email": "jan@example.com",
     "password": "Test123"
   }
   ```
   ✅ Oczekiwany status: **200 OK**

3. **Utworzenie organizacji**
   ```
   POST /api/Organizations
   Body: {
     "name": "Moja Firma",
     "description": "Opis"
   }
   ```
   ✅ Oczekiwany status: **201 Created**
   ✅ Sprawdź `invitationCode` w odpowiedzi

4. **Pobranie organizacji**
   ```
   GET /api/Organizations/current
   ```
   ✅ Oczekiwany status: **200 OK**
   ✅ Sprawdź czy `memberCount` = 1

---

### Scenariusz 2: Dołączanie do organizacji

1. **Rejestracja drugiego użytkownika**
   ```
   POST /api/Auth/register
   Body: {
     "firstName": "Anna",
     "lastName": "Nowak",
     "email": "anna@example.com",
     "password": "Test123"
   }
   ```

2. **Logowanie jako drugi użytkownik**
   ```
   POST /api/Auth/login
   Body: {
     "email": "anna@example.com",
     "password": "Test123"
   }
   ```

3. **Dołączenie do organizacji (użyj kodu z Scenariusza 1)**
   ```
   POST /api/Organizations/join
   Body: {
     "invitationCode": "ABC12345"  // kod z utworzonej organizacji
   }
   ```
   ✅ Oczekiwany status: **200 OK**

4. **Pobranie organizacji**
   ```
   GET /api/Organizations/current
   ```
   ✅ Oczekiwany status: **200 OK**
   ✅ Sprawdź czy `memberCount` = 2

---

### Scenariusz 3: Testowanie uprawnień

1. **Utworzenie organizacji jako Administrator**
   ```
   POST /api/Organizations
   ```
   ✅ Status: **201 Created**

2. **Próba aktualizacji jako Member**
   - Zaloguj się jako użytkownik, który dołączył przez kod (Member)
   - Spróbuj zaktualizować organizację
   ```
   PUT /api/Organizations/1
   ```
   ✅ Oczekiwany status: **403 Forbidden**

3. **Aktualizacja jako Administrator**
   - Zaloguj się jako Administrator (twórca organizacji)
   - Zaktualizuj organizację
   ```
   PUT /api/Organizations/1
   ```
   ✅ Oczekiwany status: **200 OK**

---

## 🔍 Troubleshooting

### Problem: 401 Unauthorized

**Rozwiązanie:**
1. Sprawdź czy jesteś zalogowany
2. Sprawdź zakładkę **Cookies** w Postman
3. Wykonaj ponownie **POST /api/Auth/login**

### Problem: 403 Forbidden przy aktualizacji

**Rozwiązanie:**
1. Sprawdź czy jesteś **Administratorem** organizacji
2. Sprawdź endpoint **GET /api/Auth/me** - sprawdź `role`
3. Tylko Administrator może aktualizować/usunąć organizację

### Problem: 400 Bad Request - "Użytkownik już należy do organizacji"

**Rozwiązanie:**
1. Użytkownik może należeć tylko do jednej organizacji
2. Sprawdź endpoint **GET /api/Auth/me** - sprawdź `organizationId`
3. Jeśli chcesz dołączyć do innej organizacji, musisz najpierw opuścić obecną (funkcjonalność do zaimplementowania)

### Problem: 404 Not Found - "Nieprawidłowy kod zaproszenia"

**Rozwiązanie:**
1. Sprawdź czy kod zaproszenia jest poprawny (8 znaków alfanumerycznych)
2. Użyj kodu z odpowiedzi **POST /api/Organizations**
3. Kod jest case-sensitive (wielkość liter ma znaczenie)

---

## 📊 Checklist testowania

### Endpoint: POST /api/Organizations
- [ ] Prawidłowe utworzenie organizacji (201)
- [ ] Użytkownik przypisany jako Administrator
- [ ] Kod zaproszenia wygenerowany
- [ ] Brakujące pole name (400)
- [ ] Użytkownik już należy do organizacji (400)

### Endpoint: POST /api/Organizations/join
- [ ] Prawidłowe dołączenie (200)
- [ ] Użytkownik przypisany jako Member
- [ ] Nieprawidłowy kod (404)
- [ ] Użytkownik już należy do organizacji (400)

### Endpoint: GET /api/Organizations/current
- [ ] Pobranie organizacji (200)
- [ ] Zwrócone dane są poprawne
- [ ] Użytkownik nie należy do organizacji (404)

### Endpoint: GET /api/Organizations/{id}
- [ ] Pobranie organizacji (200)
- [ ] Użytkownik nie należy do tej organizacji (403)
- [ ] Organizacja nie istnieje (404)

### Endpoint: PUT /api/Organizations/{id}
- [ ] Aktualizacja jako Administrator (200)
- [ ] Próba aktualizacji jako Member (403)
- [ ] Brakujące pole name (400)

### Endpoint: DELETE /api/Organizations/{id}
- [ ] Usunięcie jako Administrator (204)
- [ ] Próba usunięcia jako Member (403)

---

## 💡 Wskazówki

1. **Zapisz kod zaproszenia** - przyda się do testowania dołączania
2. **Używaj dwóch kont** - jedno jako Administrator, drugie jako Member
3. **Sprawdź role** - użyj **GET /api/Auth/me** do sprawdzenia roli
4. **Testuj uprawnienia** - sprawdź czy Member nie może aktualizować/usunąć

---

**Gotowe! Teraz możesz przetestować wszystkie endpointy organizacji! 🚀**

