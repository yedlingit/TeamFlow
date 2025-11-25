# 📬 Jak zaimportować OpenAPI do Postman - Krok po kroku

## ⚠️ Problem: "Invalid curl request"

Jeśli Postman pokazuje błąd "invalid curl request", oznacza to, że Postman próbuje zinterpretować URL jako curl command zamiast OpenAPI.

---

## ✅ ROZWIĄZANIE: Import z pliku

### Krok 1: Pobierz plik OpenAPI

Plik został już pobrany i znajduje się w:
```
backend/TeamFlow.API/openapi.json
```

**LUB pobierz ręcznie:**
1. Otwórz w przeglądarce: `http://localhost:5112/openapi/v1.json`
2. Skopiuj całą zawartość (Ctrl+A, Ctrl+C)
3. Zapisz jako `openapi.json`

### Krok 2: Import do Postman

1. **Otwórz Postman**
2. **Kliknij "Import"** (lewy górny róg, przycisk z ikoną folderu)
3. **Wybierz zakładkę "File"** (NIE "Link"!)
4. **Kliknij "Upload Files"** lub przeciągnij plik
5. **Wybierz plik:** `backend/TeamFlow.API/openapi.json`
6. **Kliknij "Import"**

### Krok 3: Sprawdź wynik

Po imporcie powinieneś zobaczyć:
- ✅ Kolekcję "TeamFlow.API"
- ✅ Folder "Auth" z endpointami:
  - POST register
  - POST login
  - POST logout
  - GET me

---

## 🔄 Alternatywa: Import przez Raw Text

Jeśli import z pliku nie działa:

1. **Otwórz plik** `openapi.json` w edytorze tekstu
2. **Skopiuj całą zawartość** (Ctrl+A, Ctrl+C)
3. **W Postman:**
   - Kliknij **Import**
   - Wybierz zakładkę **"Raw text"**
   - Wklej zawartość JSON
   - Postman automatycznie wykryje format OpenAPI
   - Kliknij **Continue** → **Import**

---

## 🎯 Szybka instrukcja (TL;DR)

```
1. Postman → Import
2. File (NIE Link!)
3. Wybierz: backend/TeamFlow.API/openapi.json
4. Import
5. Gotowe! ✅
```

---

## 🔍 Dlaczego "Link" nie działa?

Postman może mieć problemy z:
- Lokalnymi URL (localhost)
- CORS (jeśli aplikacja nie pozwala)
- Formatem odpowiedzi

**Rozwiązanie:** Zawsze używaj importu z **pliku** zamiast **linku**.

---

## 📋 Co zawiera plik openapi.json?

Plik zawiera:
- ✅ Wszystkie endpointy API
- ✅ Metody HTTP (GET, POST, PUT, DELETE)
- ✅ Schematy danych (DTOs)
- ✅ Walidację
- ✅ Przykłady requestów

**Rozmiar:** ~8KB
**Format:** OpenAPI 3.0.1
**Status:** ✅ Gotowy do importu

---

## 🧪 Testowanie po imporcie

Po zaimportowaniu możesz od razu testować:

1. **POST /api/Auth/register**
   - Body → raw → JSON
   - Wklej:
   ```json
   {
     "firstName": "Jan",
     "lastName": "Kowalski",
     "email": "test@test.com",
     "password": "test123"
   }
   ```
   - Send

2. **POST /api/Auth/login**
   - Body → raw → JSON
   - Wklej:
   ```json
   {
     "email": "test@test.com",
     "password": "test123"
   }
   ```
   - Send (zapamięta cookie)

3. **GET /api/Auth/me**
   - Send (użyje cookie z logowania)

---

## 💡 Wskazówki

- ✅ **Zapisz plik `openapi.json`** w repo - przyda się dla frontendu
- ✅ **Aktualizuj plik** po dodaniu nowych endpointów
- ✅ **Użyj zmiennych Postman** dla base URL (`{{baseUrl}}`)
- ✅ **Utwórz środowisko** w Postman z `baseUrl = http://localhost:5112`

---

## 🆘 Jeśli nadal nie działa

1. **Sprawdź format JSON:**
   - Otwórz `openapi.json` w edytorze
   - Sprawdź czy zaczyna się od `{"openapi":"3.0.1",...}`
   - Użyj JSON validator online

2. **Spróbuj innej metody:**
   - Import → Raw text → wklej JSON
   - LUB użyj narzędzia online: https://www.postman.com/openapi-to-postman

3. **Ręczne utworzenie:**
   - Utwórz nową kolekcję "TeamFlow API"
   - Dodaj requesty ręcznie (przykłady w `POSTMAN_IMPORT_GUIDE.md`)

---

**Plik gotowy do importu:** `backend/TeamFlow.API/openapi.json` ✅

