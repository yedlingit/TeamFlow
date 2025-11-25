# 🧪 Przewodnik testowania endpointów API w Postman

## 📋 Spis treści
1. [Przygotowanie](#przygotowanie)
2. [Testowanie endpointów](#testowanie-endpointów)
3. [Scenariusze testowe](#scenariusze-testowe)
4. [Troubleshooting](#troubleshooting)

---

## 🔧 Przygotowanie

### Krok 1: Upewnij się, że aplikacja działa
```powershell
# Sprawdź czy aplikacja działa
curl http://localhost:5112/openapi/v1.json
```

### Krok 2: Utwórz środowisko w Postman (opcjonalne)
1. Kliknij **Environments** (lewy panel)
2. **+** (Create Environment)
3. Nazwa: `TeamFlow Local`
4. Dodaj zmienną:
   - **Variable:** `baseUrl`
   - **Initial Value:** `http://localhost:5112`
   - **Current Value:** `http://localhost:5112`
5. **Save**

### Krok 3: Włącz cookies w Postman
1. **Settings** (ikona koła zębatego)
2. **General** → **Cookies**
3. Upewnij się, że **Automatically manage cookies** jest włączone ✅

---

## 🎯 Testowanie endpointów

### 1️⃣ POST /api/Auth/register - Rejestracja użytkownika

#### Konfiguracja requestu:
- **Method:** `POST`
- **URL:** `http://localhost:5112/api/Auth/register`
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

#### Przykładowe requesty:

**✅ Prawidłowy request:**
```json
{
  "firstName": "Anna",
  "lastName": "Nowak",
  "email": "anna.nowak@example.com",
  "password": "Haslo123"
}
```

**Oczekiwana odpowiedź (201 Created):**
```json
{
  "userId": "abc123-def456-ghi789",
  "email": "anna.nowak@example.com",
  "message": "Registration successful"
}
```

**❌ Błędny request - brakujące pole:**
```json
{
  "firstName": "Jan",
  "lastName": "Kowalski",
  "email": "jan@example.com"
  // brakuje "password"
}
```

**Oczekiwana odpowiedź (400 Bad Request):**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Password": ["Hasło jest wymagane"]
  }
}
```

**❌ Błędny request - nieprawidłowy email:**
```json
{
  "firstName": "Jan",
  "lastName": "Kowalski",
  "email": "nieprawidlowy-email",
  "password": "Test123"
}
```

**Oczekiwana odpowiedź (400 Bad Request):**
```json
{
  "errors": {
    "Email": ["Nieprawidłowy format email"]
  }
}
```

**❌ Błędny request - hasło za krótkie:**
```json
{
  "firstName": "Jan",
  "lastName": "Kowalski",
  "email": "jan@example.com",
  "password": "123"  // za krótkie (min 6 znaków)
}
```

**Oczekiwana odpowiedź (400 Bad Request):**
```json
{
  "errors": {
    "Password": ["Hasło musi mieć co najmniej 6 znaków"]
  }
}
```

**❌ Błędny request - użytkownik już istnieje:**
```json
{
  "firstName": "Jan",
  "lastName": "Kowalski",
  "email": "anna.nowak@example.com",  // ten sam email co wcześniej
  "password": "Test123"
}
```

**Oczekiwana odpowiedź (400 Bad Request):**
```json
{
  "error": "Użytkownik z tym adresem email już istnieje"
}
```

---

### 2️⃣ POST /api/Auth/login - Logowanie użytkownika

#### Konfiguracja requestu:
- **Method:** `POST`
- **URL:** `http://localhost:5112/api/Auth/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body:**
  - Wybierz **raw**
  - Wybierz **JSON**
  - Wklej:
  ```json
  {
    "email": "anna.nowak@example.com",
    "password": "Haslo123"
  }
  ```

#### Przykładowe requesty:

**✅ Prawidłowy request:**
```json
{
  "email": "anna.nowak@example.com",
  "password": "Haslo123"
}
```

**Oczekiwana odpowiedź (200 OK):**
```json
{
  "userId": "abc123-def456-ghi789",
  "email": "anna.nowak@example.com",
  "firstName": "Anna",
  "lastName": "Nowak",
  "organizationId": null,
  "organizationName": null,
  "role": "Member",
  "isActive": true
}
```

**⚠️ WAŻNE:** Po udanym logowaniu Postman automatycznie zapisze cookie z sesją. Sprawdź w zakładce **Cookies** (pod requestem).

**❌ Błędny request - nieprawidłowe dane:**
```json
{
  "email": "anna.nowak@example.com",
  "password": "ZleHaslo"
}
```

**Oczekiwana odpowiedź (401 Unauthorized):**
```json
{
  "error": "Nieprawidłowy adres email lub hasło"
}
```

**❌ Błędny request - użytkownik nie istnieje:**
```json
{
  "email": "nieistniejacy@example.com",
  "password": "Test123"
}
```

**Oczekiwana odpowiedź (401 Unauthorized):**
```json
{
  "error": "Nieprawidłowy adres email lub hasło"
}
```

**❌ Błędny request - brakujące pole:**
```json
{
  "email": "anna.nowak@example.com"
  // brakuje "password"
}
```

**Oczekiwana odpowiedź (400 Bad Request):**
```json
{
  "errors": {
    "Password": ["Hasło jest wymagane"]
  }
}
```

---

### 3️⃣ GET /api/Auth/me - Pobranie danych zalogowanego użytkownika

#### Konfiguracja requestu:
- **Method:** `GET`
- **URL:** `http://localhost:5112/api/Auth/me`
- **Headers:** (brak - cookie jest automatycznie wysyłany)
- **Body:** (brak)

#### ⚠️ WAŻNE:
Ten endpoint wymaga **autoryzacji** (musisz być zalogowany). Postman automatycznie wyśle cookie z sesją, jeśli wcześniej się zalogowałeś.

#### Przykładowe requesty:

**✅ Prawidłowy request (po zalogowaniu):**
- Najpierw wykonaj **POST /api/Auth/login**
- Następnie wykonaj **GET /api/Auth/me**

**Oczekiwana odpowiedź (200 OK):**
```json
{
  "userId": "abc123-def456-ghi789",
  "email": "anna.nowak@example.com",
  "firstName": "Anna",
  "lastName": "Nowak",
  "organizationId": null,
  "organizationName": null,
  "role": "Member",
  "isActive": true
}
```

**❌ Błędny request - brak autoryzacji:**
- Wykonaj request **BEZ** wcześniejszego logowania
- LUB usuń cookies w Postman

**Oczekiwana odpowiedź (401 Unauthorized):**
```json
{
  "error": "Użytkownik nie jest zalogowany"
}
```

**Jak sprawdzić cookies w Postman:**
1. Kliknij zakładkę **Cookies** (pod requestem)
2. Powinieneś zobaczyć cookie: `.AspNetCore.Identity.Application`
3. Jeśli nie ma - wykonaj najpierw login

---

### 4️⃣ POST /api/Auth/logout - Wylogowanie użytkownika

#### Konfiguracja requestu:
- **Method:** `POST`
- **URL:** `http://localhost:5112/api/Auth/logout`
- **Headers:** (brak - cookie jest automatycznie wysyłany)
- **Body:** (brak)

#### ⚠️ WAŻNE:
Ten endpoint wymaga **autoryzacji** (musisz być zalogowany).

#### Przykładowe requesty:

**✅ Prawidłowy request (po zalogowaniu):**
- Najpierw wykonaj **POST /api/Auth/login**
- Następnie wykonaj **POST /api/Auth/logout**

**Oczekiwana odpowiedź (200 OK):**
```json
{
  "message": "Wylogowano pomyślnie"
}
```

**Po wylogowaniu:**
- Cookie zostanie usunięty
- Kolejne requesty do `/api/Auth/me` zwrócą 401 Unauthorized

**❌ Błędny request - brak autoryzacji:**
- Wykonaj request **BEZ** wcześniejszego logowania

**Oczekiwana odpowiedź (401 Unauthorized):**
```json
{
  "type": "https://tools.ietf.org/html/rfc7235#section-3.1",
  "title": "Unauthorized",
  "status": 401
}
```

---

## 📝 Scenariusze testowe

### Scenariusz 1: Pełny flow rejestracji i logowania

1. **Rejestracja nowego użytkownika**
   ```
   POST /api/Auth/register
   Body: {
     "firstName": "Test",
     "lastName": "User",
     "email": "test.user@example.com",
     "password": "Test123"
   }
   ```
   ✅ Oczekiwany status: **201 Created**

2. **Logowanie**
   ```
   POST /api/Auth/login
   Body: {
     "email": "test.user@example.com",
     "password": "Test123"
   }
   ```
   ✅ Oczekiwany status: **200 OK**
   ✅ Sprawdź czy cookie został zapisany

3. **Pobranie danych użytkownika**
   ```
   GET /api/Auth/me
   ```
   ✅ Oczekiwany status: **200 OK**
   ✅ Sprawdź czy zwrócone dane są poprawne

4. **Wylogowanie**
   ```
   POST /api/Auth/logout
   ```
   ✅ Oczekiwany status: **200 OK**

5. **Próba pobrania danych po wylogowaniu**
   ```
   GET /api/Auth/me
   ```
   ✅ Oczekiwany status: **401 Unauthorized**

---

### Scenariusz 2: Walidacja danych wejściowych

1. **Test pustych pól**
   - Wyślij request z pustym `firstName`
   - Wyślij request z pustym `email`
   - Wyślij request z pustym `password`
   - ✅ Oczekiwany status: **400 Bad Request**

2. **Test nieprawidłowego formatu email**
   ```
   {
     "email": "nieprawidlowy-email",
     ...
   }
   ```
   ✅ Oczekiwany status: **400 Bad Request**

3. **Test za krótkiego hasła**
   ```
   {
     "password": "123",
     ...
   }
   ```
   ✅ Oczekiwany status: **400 Bad Request**

4. **Test za długich pól**
   ```
   {
     "firstName": "A".repeat(101),  // > 100 znaków
     ...
   }
   ```
   ✅ Oczekiwany status: **400 Bad Request**

---

### Scenariusz 3: Bezpieczeństwo

1. **Próba rejestracji z istniejącym emailem**
   ```
   POST /api/Auth/register
   Body: {
     "email": "anna.nowak@example.com",  // już istnieje
     ...
   }
   ```
   ✅ Oczekiwany status: **400 Bad Request**

2. **Próba logowania z nieprawidłowym hasłem**
   ```
   POST /api/Auth/login
   Body: {
     "email": "anna.nowak@example.com",
     "password": "ZleHaslo"
   }
   ```
   ✅ Oczekiwany status: **401 Unauthorized**

3. **Próba dostępu do chronionego endpointu bez logowania**
   ```
   GET /api/Auth/me
   ```
   ✅ Oczekiwany status: **401 Unauthorized**

---

## 🔍 Troubleshooting

### Problem: Cookie nie jest zapisywany po logowaniu

**Rozwiązanie:**
1. Sprawdź ustawienia Postman → Settings → Cookies
2. Upewnij się, że **Automatically manage cookies** jest włączone
3. Sprawdź czy w odpowiedzi z logowania jest nagłówek `Set-Cookie`
4. Sprawdź zakładkę **Cookies** w Postman

### Problem: 401 Unauthorized mimo logowania

**Rozwiązanie:**
1. Sprawdź czy cookie został zapisany (zakładka **Cookies**)
2. Upewnij się, że wykonujesz requesty w tej samej sesji Postman
3. Sprawdź czy cookie nie wygasł (domyślnie 7 dni)
4. Spróbuj zalogować się ponownie

### Problem: 400 Bad Request z niejasnym komunikatem

**Rozwiązanie:**
1. Sprawdź zakładkę **Body** - upewnij się, że wybrałeś **raw** i **JSON**
2. Sprawdź czy JSON jest poprawny (użyj JSON validator)
3. Sprawdź czy wszystkie wymagane pola są wypełnione
4. Sprawdź format email i długość hasła

### Problem: Aplikacja nie odpowiada

**Rozwiązanie:**
1. Sprawdź czy aplikacja działa: `http://localhost:5112/openapi/v1.json`
2. Sprawdź logi aplikacji w terminalu
3. Sprawdź czy port 5112 nie jest zajęty
4. Uruchom aplikację ponownie

---

## 📊 Checklist testowania

### Endpoint: POST /api/Auth/register
- [ ] Prawidłowa rejestracja (201)
- [ ] Brakujące pole firstName (400)
- [ ] Brakujące pole lastName (400)
- [ ] Brakujące pole email (400)
- [ ] Brakujące pole password (400)
- [ ] Nieprawidłowy format email (400)
- [ ] Hasło za krótkie < 6 znaków (400)
- [ ] Użytkownik już istnieje (400)
- [ ] Za długie pola > maxLength (400)

### Endpoint: POST /api/Auth/login
- [ ] Prawidłowe logowanie (200)
- [ ] Nieprawidłowe hasło (401)
- [ ] Użytkownik nie istnieje (401)
- [ ] Brakujące pole email (400)
- [ ] Brakujące pole password (400)
- [ ] Nieprawidłowy format email (400)
- [ ] Cookie zapisany po logowaniu ✅

### Endpoint: GET /api/Auth/me
- [ ] Pobranie danych po logowaniu (200)
- [ ] Próba dostępu bez logowania (401)
- [ ] Próba dostępu po wylogowaniu (401)
- [ ] Zwrócone dane są poprawne ✅

### Endpoint: POST /api/Auth/logout
- [ ] Wylogowanie po logowaniu (200)
- [ ] Próba wylogowania bez logowania (401)
- [ ] Cookie usunięty po wylogowaniu ✅

---

## 💡 Wskazówki

1. **Używaj zmiennych Postman** dla baseUrl - łatwiej zmienić środowisko
2. **Zapisz requesty jako kolekcję** - łatwiejsze zarządzanie
3. **Używaj testów automatycznych** w Postman - możesz dodać skrypty testowe
4. **Zapisuj przykładowe odpowiedzi** - przydatne dla dokumentacji
5. **Testuj edge cases** - puste pola, bardzo długie stringi, specjalne znaki

---

## 🎯 Przykładowe skrypty testowe w Postman

Możesz dodać skrypty testowe do każdego requestu:

### Test dla POST /api/Auth/register:
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has userId", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('userId');
});

pm.test("Response has email", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('email');
});
```

### Test dla POST /api/Auth/login:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has user data", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('userId');
    pm.expect(jsonData).to.have.property('email');
    pm.expect(jsonData).to.have.property('firstName');
});

pm.test("Cookie is set", function () {
    pm.expect(pm.cookies.has('.AspNetCore.Identity.Application')).to.be.true;
});
```

---

**Gotowe! Teraz możesz przetestować wszystkie endpointy! 🚀**

