# 🔧 Naprawa problemu 404 w Postman

## ⚠️ Problem: Podwójny slash w URL

W logach widzę, że Postman wysyła requesty z podwójnym slashem:
```
POST http://localhost:5112//api/Auth/register  ❌
```

To powoduje 404, ponieważ routing nie rozpoznaje takiego URL.

---

## ✅ Rozwiązanie

### Problem 1: Base URL z końcowym slashem

Jeśli masz ustawiony **base URL** w Postman z końcowym slashem:
```
http://localhost:5112/  ❌ (z końcowym slashem)
```

A endpoint:
```
/api/Auth/register
```

To Postman połączy je jako:
```
http://localhost:5112/ + /api/Auth/register = http://localhost:5112//api/Auth/register  ❌
```

### Rozwiązanie:

**Opcja 1: Usuń końcowy slash z base URL**
```
http://localhost:5112  ✅ (bez końcowego slasha)
```

**Opcja 2: Użyj pełnego URL bez base URL**
```
http://localhost:5112/api/Auth/register  ✅
```

---

## 📋 Instrukcja krok po kroku

### 1. Sprawdź konfigurację w Postman

#### Jeśli używasz zmiennej `{{baseUrl}}`:
1. Kliknij **Environments** (lewy panel)
2. Wybierz środowisko (np. "TeamFlow Local")
3. Sprawdź zmienną `baseUrl`
4. **Upewnij się, że NIE ma końcowego slasha:**
   ```
   ❌ http://localhost:5112/
   ✅ http://localhost:5112
   ```

#### Jeśli używasz pełnego URL:
1. W każdym requeście sprawdź URL
2. **Upewnij się, że NIE ma podwójnego slasha:**
   ```
   ❌ http://localhost:5112//api/Auth/register
   ✅ http://localhost:5112/api/Auth/register
   ```

---

### 2. Prawidłowe URL dla wszystkich endpointów

```
✅ POST http://localhost:5112/api/Auth/register
✅ POST http://localhost:5112/api/Auth/login
✅ POST http://localhost:5112/api/Auth/logout
✅ GET  http://localhost:5112/api/Auth/me
```

**WAŻNE:** 
- Bez podwójnego slasha
- Z dużą literą **A** w `Auth`
- Port `5112`

---

### 3. Test w Postman

#### POST /api/Auth/register
```
Method: POST
URL: http://localhost:5112/api/Auth/register
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "firstName": "Jan",
  "lastName": "Kowalski",
  "email": "jan.kowalski@example.com",
  "password": "Test123"
}
```

#### POST /api/Auth/login
```
Method: POST
URL: http://localhost:5112/api/Auth/login
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "email": "jan.kowalski@example.com",
  "password": "Test123"
}
```

---

## 🔍 Jak sprawdzić czy URL jest poprawny

1. **W Postman, przed wysłaniem requestu:**
   - Sprawdź zakładkę **Params** - może być tam dodatkowy slash
   - Sprawdź **URL** - powinien być dokładnie: `http://localhost:5112/api/Auth/register`

2. **Po wysłaniu requestu:**
   - Sprawdź logi aplikacji
   - Szukaj linii: `Request starting HTTP/1.1 POST http://localhost:5112...`
   - Jeśli widzisz `//api` - masz podwójny slash ❌

---

## 💡 Najlepsze praktyki

1. **Używaj zmiennej `{{baseUrl}}` bez końcowego slasha:**
   ```
   baseUrl = http://localhost:5112
   ```

2. **W endpointach używaj pełnej ścieżki zaczynającej się od `/`:**
   ```
   {{baseUrl}}/api/Auth/register
   ```

3. **Unikaj końcowych slashy:**
   ```
   ❌ {{baseUrl}}/
   ✅ {{baseUrl}}
   ```

---

## 🆘 Jeśli nadal nie działa

1. **Sprawdź logi aplikacji** - tam zobaczysz dokładny URL który przychodzi
2. **Sprawdź czy aplikacja działa:** `http://localhost:5112/openapi/v1.json`
3. **Sprawdź czy port jest poprawny:** W logach powinno być `Now listening on: http://localhost:5112`

---

**Najważniejsze:** Usuń końcowy slash z base URL w Postman! ✅

