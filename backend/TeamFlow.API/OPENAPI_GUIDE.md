# 📖 Przewodnik po OpenAPI

## Co to jest OpenAPI?

**OpenAPI** (dawniej Swagger) to standardowy format opisu interfejsów API REST. Jest to specyfikacja w formacie JSON/YAML, która opisuje:
- Wszystkie dostępne endpointy
- Metody HTTP (GET, POST, PUT, DELETE, etc.)
- Parametry wejściowe
- Format odpowiedzi
- Modele danych (DTOs)
- Przykłady requestów i odpowiedzi

---

## 🔍 Jak działa OpenAPI w .NET 9?

W .NET 9 Microsoft wprowadził **wbudowane wsparcie dla OpenAPI** (bez dodatkowych pakietów jak Swashbuckle).

### Endpoint OpenAPI
- **URL:** `http://localhost:5112/openapi/v1.json`
- **Format:** JSON
- **Zawartość:** Pełna specyfikacja API w formacie OpenAPI 3.0

### Automatyczne generowanie
.NET 9 automatycznie generuje dokumentację OpenAPI na podstawie:
- Kontrolerów API (`[ApiController]`)
- Atrybutów routingu (`[Route]`, `[HttpGet]`, `[HttpPost]`, etc.)
- DTOs (Data Transfer Objects)
- Atrybutów walidacji (`[Required]`, `[EmailAddress]`, etc.)
- Komentarzy XML (opcjonalnie)

---

## 🛠️ Jak używać OpenAPI?

### 1. **Wyświetlanie dokumentacji (Swagger UI)**

#### Opcja A: Swagger Editor Online (najłatwiejsze)
1. Otwórz https://editor.swagger.io/
2. Skopiuj zawartość z `http://localhost:5112/openapi/v1.json`
3. Wklej do edytora
4. Zobacz interfejs Swagger UI z możliwością testowania

#### Opcja B: Swagger UI lokalnie
Możesz zainstalować Swagger UI lokalnie lub użyć Docker:
```bash
docker run -p 8080:8080 -e SWAGGER_JSON=/openapi.json -v $(pwd):/usr/share/nginx/html swaggerapi/swagger-ui
```

### 2. **Import do Postman**

Postman może automatycznie zaimportować endpointy z OpenAPI:

1. Otwórz Postman
2. Kliknij **Import**
3. Wybierz **Link**
4. Wklej: `http://localhost:5112/openapi/v1.json`
5. Kliknij **Continue** → **Import**

Postman automatycznie utworzy:
- ✅ Wszystkie endpointy
- ✅ Przykładowe requesty
- ✅ Modele danych
- ✅ Walidację

### 3. **Import do innych narzędzi**

#### Thunder Client (VS Code)
1. Otwórz Thunder Client w VS Code
2. Kliknij **Collections** → **Import**
3. Wybierz **OpenAPI**
4. Wklej URL: `http://localhost:5112/openapi/v1.json`

#### Insomnia
1. Otwórz Insomnia
2. **Application** → **Preferences** → **Data** → **Import/Export**
3. Wybierz **OpenAPI 3.0**
4. Wklej zawartość z `http://localhost:5112/openapi/v1.json`

#### curl / HTTPie
Możesz użyć OpenAPI do generowania przykładowych komend:
```bash
# Pobierz specyfikację
curl http://localhost:5112/openapi/v1.json > openapi.json

# Użyj narzędzi jak openapi-generator do generowania klientów
```

---

## 📋 Co zawiera OpenAPI JSON?

Przykładowa struktura:

```json
{
  "openapi": "3.0.1",
  "info": {
    "title": "TeamFlow.API",
    "version": "1.0.0"
  },
  "paths": {
    "/api/auth/register": {
      "post": {
        "summary": "Rejestracja nowego użytkownika",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/RegisterDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Created",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RegisterResponseDto"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "RegisterDto": {
        "type": "object",
        "properties": {
          "firstName": { "type": "string" },
          "lastName": { "type": "string" },
          "email": { "type": "string", "format": "email" },
          "password": { "type": "string", "minLength": 6 }
        },
        "required": ["firstName", "lastName", "email", "password"]
      }
    }
  }
}
```

---

## 🎯 Zalety OpenAPI

### 1. **Automatyczna dokumentacja**
- ✅ Zawsze aktualna (generowana z kodu)
- ✅ Nie trzeba ręcznie pisać dokumentacji
- ✅ Zmiany w kodzie = automatyczna aktualizacja

### 2. **Testowanie API**
- ✅ Swagger UI pozwala testować endpointy bezpośrednio w przeglądarce
- ✅ Postman może zaimportować wszystkie endpointy
- ✅ Automatyczne generowanie klientów API

### 3. **Współpraca Frontend-Backend**
- ✅ Frontend może wygenerować TypeScript types z OpenAPI
- ✅ Automatyczna walidacja requestów
- ✅ Type-safe API calls

### 4. **Integracja z narzędziami**
- ✅ Postman, Insomnia, Thunder Client
- ✅ Generatory klientów (OpenAPI Generator)
- ✅ Mock serwery (Prism, WireMock)

---

## 🔧 Konfiguracja w .NET 9

W `Program.cs`:

```csharp
// Dodaj OpenAPI
builder.Services.AddOpenApi();

// W pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // Tworzy endpoint /openapi/v1.json
}
```

### Dostosowanie OpenAPI

Możesz dostosować dokumentację:

```csharp
builder.Services.AddOpenApi(options =>
{
    options.DocumentName = "v1";
});

// Lub z konfiguracją
builder.Services.Configure<Microsoft.AspNetCore.OpenApi.OpenApiOptions>(options =>
{
    // Dostosuj opcje
});
```

---

## 📚 Przykłady użycia

### 1. Testowanie w Swagger Editor
1. Otwórz https://editor.swagger.io/
2. File → Import URL
3. Wklej: `http://localhost:5112/openapi/v1.json`
4. Kliknij "Try it out" przy każdym endpoincie

### 2. Import do Postman
1. Postman → Import → Link
2. URL: `http://localhost:5112/openapi/v1.json`
3. Wszystkie endpointy są teraz dostępne w Postman

### 3. Generowanie TypeScript types
```bash
# Użyj openapi-generator
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:5112/openapi/v1.json \
  -g typescript-axios \
  -o ./src/api
```

---

## 🆚 OpenAPI vs Swagger

| Termin | Znaczenie |
|--------|-----------|
| **OpenAPI** | Specyfikacja/standard (format JSON/YAML) |
| **Swagger** | Narzędzia do pracy z OpenAPI (Swagger UI, Swagger Editor) |
| **Swashbuckle** | Biblioteka .NET do generowania OpenAPI (stara) |
| **Microsoft.AspNetCore.OpenApi** | Wbudowane wsparcie w .NET 9 (nowe) |

---

## 💡 Najlepsze praktyki

1. **Dodaj komentarze XML** do kontrolerów i DTOs (będą widoczne w OpenAPI)
2. **Używaj atrybutów walidacji** - automatycznie pojawią się w OpenAPI
3. **Dodaj przykłady** w odpowiedziach (opcjonalnie)
4. **Eksportuj OpenAPI** do pliku i commit do repo (dla frontendu)

---

## 🔗 Przydatne linki

- **Swagger Editor:** https://editor.swagger.io/
- **OpenAPI Spec:** https://swagger.io/specification/
- **Postman Import:** https://learning.postman.com/docs/integrations/available-integrations/working-with-openapi/
- **OpenAPI Generator:** https://openapi-generator.tech/

---

## 📝 Podsumowanie

**OpenAPI** to standardowy sposób opisywania API, który:
- ✅ Automatycznie generuje dokumentację
- ✅ Umożliwia testowanie w Swagger UI
- ✅ Pozwala importować endpointy do Postman/Thunder Client
- ✅ Ułatwia współpracę Frontend-Backend
- ✅ Jest wbudowany w .NET 9 (bez dodatkowych pakietów)

**Twój endpoint:** `http://localhost:5112/openapi/v1.json` zawiera pełną specyfikację Twojego API! 🎉

