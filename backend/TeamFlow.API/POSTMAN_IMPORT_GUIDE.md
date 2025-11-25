# 📬 Import OpenAPI do Postman - Przewodnik

## Problem: "Invalid curl request" w Postman

Jeśli Postman pokazuje błąd "invalid curl request" przy imporcie z URL, oto rozwiązania:

---

## ✅ Rozwiązanie 1: Import z pliku (najłatwiejsze)

### Krok 1: Pobierz plik OpenAPI
1. Otwórz w przeglądarce: `http://localhost:5112/openapi/v1.json`
2. Skopiuj całą zawartość (Ctrl+A, Ctrl+C)
3. Zapisz jako plik `openapi.json` (lub użyj pliku w `backend/TeamFlow.API/openapi.json`)

### Krok 2: Import do Postman
1. Otwórz Postman
2. Kliknij **Import** (lewy górny róg)
3. Wybierz **File** (nie Link!)
4. Wybierz plik `openapi.json`
5. Kliknij **Import**

---

## ✅ Rozwiązanie 2: Import z URL (jeśli nie działa)

### Sprawdź czy aplikacja działa
1. Upewnij się, że aplikacja jest uruchomiona
2. Otwórz w przeglądarce: `http://localhost:5112/openapi/v1.json`
3. Jeśli widzisz JSON - aplikacja działa

### Import w Postman
1. Postman → **Import**
2. Wybierz **Link** (nie Raw text!)
3. Wklej: `http://localhost:5112/openapi/v1.json`
4. **Continue** → **Import**

### Jeśli nadal nie działa:
- Sprawdź czy nie ma problemów z CORS
- Spróbuj użyć `https://localhost:7017/openapi/v1.json` (jeśli HTTPS działa)
- Użyj Rozwiązania 1 (import z pliku)

---

## ✅ Rozwiązanie 3: Import przez Raw text

1. Otwórz `http://localhost:5112/openapi/v1.json` w przeglądarce
2. Skopiuj całą zawartość JSON (Ctrl+A, Ctrl+C)
3. W Postman: **Import** → **Raw text**
4. Wklej zawartość JSON
5. Postman automatycznie wykryje format OpenAPI
6. Kliknij **Continue** → **Import**

---

## 🔍 Diagnoza problemu

### Sprawdź format OpenAPI
Otwórz `http://localhost:5112/openapi/v1.json` i sprawdź czy:
- ✅ Zaczyna się od `{"openapi":"3.0.1",...}`
- ✅ Zawiera sekcję `"paths"` z endpointami
- ✅ Zawiera sekcję `"components"` ze schematami

### Sprawdź czy Postman rozpoznaje format
- Postman powinien automatycznie wykryć format OpenAPI 3.0
- Jeśli nie, użyj opcji "Raw text" i wklej JSON

---

## 📋 Alternatywne metody importu

### Metoda 1: Postman Collection JSON
Możesz ręcznie utworzyć kolekcję Postman na podstawie OpenAPI:

1. Otwórz `openapi.json`
2. Użyj narzędzia online: https://www.postman.com/openapi-to-postman
3. Wklej zawartość OpenAPI
4. Pobierz kolekcję Postman
5. Import do Postman

### Metoda 2: Postman CLI
```bash
# Zainstaluj Postman CLI
npm install -g postman-cli

# Import OpenAPI
postman collection import openapi.json
```

### Metoda 3: Ręczne utworzenie requestów
Jeśli import nie działa, możesz ręcznie utworzyć requesty w Postman:

#### POST /api/auth/register
- **Method:** POST
- **URL:** `http://localhost:5112/api/auth/register`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "firstName": "Jan",
  "lastName": "Kowalski",
  "email": "test@test.com",
  "password": "test123"
}
```

#### POST /api/auth/login
- **Method:** POST
- **URL:** `http://localhost:5112/api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "email": "test@test.com",
  "password": "test123"
}
```

#### GET /api/auth/me
- **Method:** GET
- **URL:** `http://localhost:5112/api/auth/me`
- **Cookies:** Automatycznie (po zalogowaniu)

---

## 🛠️ Rozwiązywanie problemów

### Problem: "Invalid curl request"
**Przyczyna:** Postman myśli, że to curl command zamiast OpenAPI

**Rozwiązanie:**
1. Użyj **File** zamiast **Link**
2. LUB użyj **Raw text** i wklej JSON
3. Upewnij się, że plik zaczyna się od `{"openapi":...}`

### Problem: "Unable to fetch from URL"
**Przyczyna:** Aplikacja nie działa lub CORS blokuje

**Rozwiązanie:**
1. Sprawdź czy aplikacja działa: `http://localhost:5112/openapi/v1.json`
2. Użyj importu z pliku zamiast URL
3. Sprawdź firewall

### Problem: "Invalid OpenAPI format"
**Przyczyna:** Format OpenAPI może być niekompletny

**Rozwiązanie:**
1. Sprawdź czy JSON jest poprawny (użyj JSON validator)
2. Upewnij się, że zawiera sekcje: `openapi`, `info`, `paths`, `components`

---

## 📝 Szybki test

1. **Pobierz plik:**
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:5112/openapi/v1.json" -OutFile "openapi.json"
   ```

2. **Import w Postman:**
   - Import → File → wybierz `openapi.json`

3. **Sprawdź:**
   - Powinieneś zobaczyć kolekcję "TeamFlow.API"
   - Z folderami: Auth, Organizations, Projects, Tasks, etc.
   - Z wszystkimi endpointami gotowymi do użycia

---

## 💡 Wskazówki

- ✅ **Zawsze używaj importu z pliku** jeśli URL nie działa
- ✅ **Zapisz plik `openapi.json`** w repo dla łatwego dostępu
- ✅ **Zaktualizuj plik** po dodaniu nowych endpointów
- ✅ **Użyj wersjonowania** jeśli zmieniasz API (v1, v2, etc.)

---

## 🎯 Podsumowanie

**Najlepsza metoda importu:**
1. Pobierz plik `openapi.json` z `http://localhost:5112/openapi/v1.json`
2. W Postman: **Import** → **File** → wybierz `openapi.json`
3. Gotowe! ✅

**Alternatywa:**
- Skopiuj zawartość JSON
- Postman → **Import** → **Raw text** → wklej JSON

