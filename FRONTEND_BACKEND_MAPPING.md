# Mapowanie Frontend → Backend API

## 📋 Przegląd

Ten dokument mapuje komponenty frontendowe do odpowiednich endpointów API backendu.

---

## 🔐 Autoryzacja

### `components/auth/LoginPage.tsx`
- **POST** `/api/auth/login` - Logowanie użytkownika
- Po sukcesie: przekierowanie do `/dashboard`

### `components/auth/RegisterPage.tsx`
- **POST** `/api/auth/register` - Rejestracja nowego użytkownika
- Po sukcesie: przekierowanie do `/onboarding` z danymi użytkownika

### `components/auth/OnboardingPage.tsx`
- **POST** `/api/organizations` - Utworzenie organizacji (gdy wybrano "Właściciel")
- **POST** `/api/organizations/join` - Dołączenie do organizacji (gdy wybrano "Pracownik")
- Po sukcesie: przekierowanie do `/dashboard`

### `components/settings/SettingsPage.tsx`
- **POST** `/api/auth/logout` - Wylogowanie
- **PUT** `/api/users/me` - Aktualizacja profilu
- **PUT** `/api/users/me/password` - Zmiana hasła

---

## 📊 Dashboard

### `components/dashboard/DashboardPage.tsx`
- **GET** `/api/dashboard/stats` - Statystyki (zadania, projekty)
- **GET** `/api/dashboard/report` - Generowanie raportu (opcjonalnie)

**Dane wyświetlane:**
- Statystyki zadań (ToDo, InProgress, Done)
- Lista najbliższych zadań
- Lista aktywnych projektów

---

## 📁 Projekty

### `components/projects/ProjectsPage.tsx`

**Lista projektów:**
- **GET** `/api/projects?status=active` - Aktywne projekty
- **GET** `/api/projects?status=inactive` - Zarchiwizowane projekty

**Operacje CRUD:**
- **POST** `/api/projects` - Utworzenie projektu
- **PUT** `/api/projects/{id}` - Aktualizacja projektu
- **DELETE** `/api/projects/{id}` - Usunięcie projektu

**Zarządzanie członkami:**
- **POST** `/api/projects/{id}/members` - Dodanie członka
- **DELETE** `/api/projects/{id}/members/{userId}` - Usunięcie członka

**Dane wyświetlane:**
- Lista projektów z filtrowaniem (aktywne/archiwum)
- Karty projektów z postępem, terminem, członkami zespołu
- Modal edycji/tworzenia projektu

---

### `components/projects/ProjectDetailPage.tsx`

**Szczegóły projektu:**
- **GET** `/api/projects/{id}` - Szczegóły projektu
- **PUT** `/api/projects/{id}` - Aktualizacja projektu

**Zadania projektu:**
- **GET** `/api/tasks?projectId={id}` - Zadania w projekcie

**Zarządzanie zespołem:**
- **POST** `/api/projects/{id}/members` - Dodanie członka
- **DELETE** `/api/projects/{id}/members/{userId}` - Usunięcie członka

**Drag & Drop zadań:**
- **PATCH** `/api/tasks/{id}/status` - Zmiana statusu zadania

**Dane wyświetlane:**
- Informacje o projekcie (nazwa, opis, termin, postęp)
- Tablica Kanban z zadaniami (ToDo, InProgress, Done)
- Modal szczegółów zadania
- Modal edycji projektu

---

## ✅ Zadania

### `components/tasks/TasksPage.tsx`

**Lista zadań:**
- **GET** `/api/tasks` - Wszystkie zadania użytkownika (ze wszystkich projektów)
- **GET** `/api/tasks?status=todo` - Filtrowanie po statusie
- **GET** `/api/tasks?status=in-progress`
- **GET** `/api/tasks?status=done`

**Operacje CRUD:**
- **POST** `/api/tasks` - Utworzenie zadania
- **PUT** `/api/tasks/{id}` - Aktualizacja zadania
- **PATCH** `/api/tasks/{id}/status` - Zmiana statusu (drag & drop)
- **DELETE** `/api/tasks/{id}` - Usunięcie zadania

**Przypisania:**
- **POST** `/api/tasks/{id}/assignees` - Przypisanie użytkownika
- **DELETE** `/api/tasks/{id}/assignees/{userId}` - Usunięcie przypisania

**Komentarze:**
- **GET** `/api/tasks/{id}` - Szczegóły zadania z komentarzami
- **POST** `/api/tasks/{taskId}/comments` - Dodanie komentarza
- **DELETE** `/api/comments/{id}` - Usunięcie komentarza

**Dane wyświetlane:**
- Tablica Kanban z zadaniami ze wszystkich projektów
- Modal tworzenia zadania
- Modal szczegółów zadania z edycją, komentarzami, przypisaniami

---

## 👥 Użytkownicy

### `components/users/UsersPage.tsx`

**Lista użytkowników:**
- **GET** `/api/users` - Wszyscy użytkownicy organizacji
- **GET** `/api/users?search={query}` - Wyszukiwanie
- **GET** `/api/users?role={role}` - Filtrowanie po roli

**Operacje:**
- **PUT** `/api/users/{id}` - Aktualizacja użytkownika (rola, dane)
- **DELETE** `/api/users/{id}` - Usunięcie użytkownika
- **POST** `/api/users/invite` - Generowanie kodu zaproszenia

**Dane wyświetlane:**
- Lista użytkowników z filtrowaniem i wyszukiwaniem
- Karty użytkowników z rolami, emailami, stanowiskami
- Modal edycji użytkownika
- Modal z kodem zaproszenia

---

## 🔄 Przepływ danych

### 1. Rejestracja i Onboarding
```
RegisterPage → POST /api/auth/register
    ↓
OnboardingPage → POST /api/organizations (lub /api/organizations/join)
    ↓
DashboardPage → GET /api/dashboard/stats
```

### 2. Logowanie
```
LoginPage → POST /api/auth/login
    ↓
DashboardPage → GET /api/dashboard/stats
```

### 3. Zarządzanie projektami
```
ProjectsPage → GET /api/projects
    ↓
ProjectDetailPage → GET /api/projects/{id} + GET /api/tasks?projectId={id}
    ↓
Drag & Drop → PATCH /api/tasks/{id}/status
```

### 4. Zarządzanie zadaniami
```
TasksPage → GET /api/tasks
    ↓
Modal zadania → GET /api/tasks/{id} (szczegóły)
    ↓
Edycja → PUT /api/tasks/{id}
Komentarz → POST /api/tasks/{taskId}/comments
```

---

## 🎯 Brakujące endpointy w komentarzach frontendu

W kodzie frontendu znaleziono następujące komentarze wskazujące na brakujące endpointy:

### `LoginPage.tsx` (linia 34)
```typescript
// const response = await fetch('http://localhost:5000/api/auth/login', {
```
✅ **Endpoint wymagany:** `POST /api/auth/login`

### `RegisterPage.tsx` (linia 46)
```typescript
// const response = await fetch('/api/auth/register', {
```
✅ **Endpoint wymagany:** `POST /api/auth/register`

### `OnboardingPage.tsx` (linia 29-30)
```typescript
// Symulacja API
await new Promise(resolve => setTimeout(resolve, 1500));
```
✅ **Endpoint wymagany:** 
- `POST /api/organizations` (tworzenie)
- `POST /api/organizations/join` (dołączanie)

---

## 📝 Uwagi implementacyjne

### 1. **Autoryzacja**
- Wszystkie requesty (oprócz register/login) powinny zawierać HttpOnly Cookie
- Frontend powinien obsługiwać przekierowanie do `/login` przy 401

### 2. **Obsługa błędów**
- Frontend powinien wyświetlać komunikaty błędów z API
- Przykładowe kody błędów:
  - `400` - Błędne dane (walidacja)
  - `401` - Brak autoryzacji (przekieruj do login)
  - `403` - Brak uprawnień
  - `404` - Zasób nie znaleziony
  - `500` - Błąd serwera

### 3. **Loading states**
- Wszystkie komponenty mają stany `isLoading`
- Backend powinien odpowiadać w rozsądnym czasie (< 2s)

### 4. **Real-time updates** (opcjonalne)
- Rozważ SignalR dla real-time aktualizacji zadań/projektów
- Na razie frontend używa polling lub ręcznego odświeżania

### 5. **Paginacja**
- Frontend nie implementuje paginacji (używa wszystkich danych)
- Rozważ dodanie paginacji dla:
  - Lista projektów (> 20)
  - Lista zadań (> 50)
  - Lista użytkowników (> 30)

### 6. **Filtrowanie i wyszukiwanie**
- Frontend ma podstawowe filtrowanie (status, rola)
- Backend powinien wspierać:
  - Wyszukiwanie tekstowe (nazwa, opis)
  - Filtrowanie po wielu parametrach jednocześnie
  - Sortowanie

---

## 🚀 Priorytetyzacja implementacji

### Faza 1: Podstawowa funkcjonalność (MVP)
1. ✅ Autoryzacja (register, login, logout, me)
2. ✅ Organizacje (create, join, get current)
3. ✅ Projekty (CRUD)
4. ✅ Zadania (CRUD, zmiana statusu)
5. ✅ Dashboard (stats)

### Faza 2: Rozszerzona funkcjonalność
6. ✅ Komentarze (CRUD)
7. ✅ Przypisania zadań (assignees)
8. ✅ Zarządzanie członkami projektu
9. ✅ Użytkownicy (lista, edycja)

### Faza 3: Zaawansowane funkcje
10. Generowanie raportów
11. Zaawansowane filtrowanie i wyszukiwanie
12. Paginacja
13. Soft delete

---

## 📌 Checklist implementacji

### Backend (.NET 9)
- [ ] Konfiguracja DbContext z SQLite
- [ ] Migracje bazy danych
- [ ] Identity z ApplicationUser
- [ ] Kontrolery API dla wszystkich endpointów
- [ ] DTOs (Data Transfer Objects)
- [ ] Walidacja requestów
- [ ] Autoryzacja i autentykacja (Cookie Auth)
- [ ] Obsługa błędów (Error Handling Middleware)
- [ ] CORS configuration
- [ ] Logowanie (ILogger)

### Frontend (React)
- [ ] Service layer dla API calls
- [ ] Error handling i retry logic
- [ ] Loading states
- [ ] Form validation
- [ ] Toast notifications dla sukcesu/błędów
- [ ] Protected routes
- [ ] Token refresh (jeśli potrzebne)

---

## 🔗 Powiązane dokumenty

- `API_ENDPOINTS.md` - Pełna dokumentacja endpointów
- Model domenowy (dostarczony przez użytkownika)
- `ApplicationDbContext.cs` - Konfiguracja bazy danych

