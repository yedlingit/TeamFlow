# Dokumentacja Endpointów API - TeamFlow

## 📋 Spis Treści
1. [Autoryzacja](#autoryzacja)
2. [Organizacje](#organizacje)
3. [Projekty](#projekty)
4. [Zadania](#zadania)
5. [Komentarze](#komentarze)
6. [Użytkownicy](#użytkownicy)
7. [Dashboard](#dashboard)
8. [Ustawienia](#ustawienia)

---

## 🔐 Autoryzacja

### POST `/api/auth/register`
**Opis:** Rejestracja nowego użytkownika

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string"
}
```

**Response:** `201 Created`
```json
{
  "userId": "string",
  "email": "string",
  "message": "Registration successful"
}
```

---

### POST `/api/auth/login`
**Opis:** Logowanie użytkownika

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** `200 OK` (z HttpOnly Cookie)
```json
{
  "userId": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "organizationId": "int?",
  "role": "Member | TeamLeader | Administrator"
}
```

---

### POST `/api/auth/logout`
**Opis:** Wylogowanie użytkownika

**Response:** `200 OK`

---

### GET `/api/auth/me`
**Opis:** Pobranie danych zalogowanego użytkownika

**Response:** `200 OK`
```json
{
  "userId": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "organizationId": "int?",
  "organizationName": "string?",
  "role": "Member | TeamLeader | Administrator",
  "isActive": "bool"
}
```

---

## 🏢 Organizacje

### POST `/api/organizations`
**Opis:** Utworzenie nowej organizacji (właściciel)

**Request Body:**
```json
{
  "name": "string",
  "description": "string?"
}
```

**Response:** `201 Created`
```json
{
  "id": "int",
  "name": "string",
  "description": "string?",
  "invitationCode": "string",
  "createdAt": "DateTime"
}
```

---

### POST `/api/organizations/join`
**Opis:** Dołączenie do organizacji przez kod zaproszenia

**Request Body:**
```json
{
  "invitationCode": "string"
}
```

**Response:** `200 OK`
```json
{
  "organizationId": "int",
  "organizationName": "string",
  "message": "Successfully joined organization"
}
```

---

### GET `/api/organizations/{id}`
**Opis:** Pobranie szczegółów organizacji

**Response:** `200 OK`
```json
{
  "id": "int",
  "name": "string",
  "description": "string?",
  "invitationCode": "string",
  "createdAt": "DateTime",
  "memberCount": "int",
  "projectCount": "int"
}
```

---

### GET `/api/organizations/current`
**Opis:** Pobranie organizacji użytkownika

**Response:** `200 OK`
```json
{
  "id": "int",
  "name": "string",
  "description": "string?",
  "invitationCode": "string",
  "createdAt": "DateTime"
}
```

---

### PUT `/api/organizations/{id}`
**Opis:** Aktualizacja organizacji (tylko Administrator)

**Request Body:**
```json
{
  "name": "string",
  "description": "string?"
}
```

**Response:** `200 OK`

---

### DELETE `/api/organizations/{id}`
**Opis:** Usunięcie organizacji (tylko Administrator)

**Response:** `204 No Content`

---

## 📁 Projekty

### GET `/api/projects`
**Opis:** Pobranie listy projektów użytkownika

**Query Parameters:**
- `status`: `active | inactive` (opcjonalne)
- `search`: `string` (opcjonalne)

**Response:** `200 OK`
```json
[
  {
    "id": "int",
    "name": "string",
    "description": "string?",
    "organizationId": "int",
    "teamLeaderId": "string?",
    "teamLeaderName": "string?",
    "status": "Active | Inactive",
    "theme": "string?",
    "dueDate": "DateTime?",
    "createdAt": "DateTime",
    "progress": "int",
    "taskCount": "int",
    "memberCount": "int",
    "members": [
      {
        "userId": "string",
        "firstName": "string",
        "lastName": "string",
        "initials": "string",
        "role": "string?"
      }
    ]
  }
]
```

---

### GET `/api/projects/{id}`
**Opis:** Pobranie szczegółów projektu

**Response:** `200 OK`
```json
{
  "id": "int",
  "name": "string",
  "description": "string?",
  "organizationId": "int",
  "teamLeaderId": "string?",
  "teamLeaderName": "string?",
  "status": "Active | Inactive",
  "theme": "string?",
  "dueDate": "DateTime?",
  "createdAt": "DateTime",
  "progress": "int",
  "taskCount": "int",
  "memberCount": "int",
  "members": [
    {
      "userId": "string",
      "firstName": "string",
      "lastName": "string",
      "initials": "string",
      "role": "string?",
      "joinedDate": "DateTime"
    }
  ]
}
```

---

### POST `/api/projects`
**Opis:** Utworzenie nowego projektu

**Request Body:**
```json
{
  "name": "string",
  "description": "string?",
  "teamLeaderId": "string?",
  "theme": "string?",
  "dueDate": "DateTime?",
  "memberIds": ["string"]
}
```

**Response:** `201 Created`
```json
{
  "id": "int",
  "name": "string",
  "description": "string?",
  "organizationId": "int",
  "teamLeaderId": "string?",
  "status": "Active",
  "theme": "string?",
  "dueDate": "DateTime?",
  "createdAt": "DateTime"
}
```

---

### PUT `/api/projects/{id}`
**Opis:** Aktualizacja projektu

**Request Body:**
```json
{
  "name": "string",
  "description": "string?",
  "teamLeaderId": "string?",
  "status": "Active | Inactive",
  "theme": "string?",
  "dueDate": "DateTime?",
  "memberIds": ["string"]
}
```

**Response:** `200 OK`

---

### DELETE `/api/projects/{id}`
**Opis:** Usunięcie projektu

**Response:** `204 No Content`

---

### POST `/api/projects/{id}/members`
**Opis:** Dodanie członka do projektu

**Request Body:**
```json
{
  "userId": "string",
  "role": "string?"
}
```

**Response:** `201 Created`

---

### DELETE `/api/projects/{id}/members/{userId}`
**Opis:** Usunięcie członka z projektu

**Response:** `204 No Content`

---

## ✅ Zadania

### GET `/api/tasks`
**Opis:** Pobranie listy zadań

**Query Parameters:**
- `projectId`: `int` (opcjonalne)
- `status`: `ToDo | InProgress | Done` (opcjonalne)
- `priority`: `Low | Medium | High` (opcjonalne)
- `assigneeId`: `string` (opcjonalne)
- `search`: `string` (opcjonalne)

**Response:** `200 OK`
```json
[
  {
    "id": "int",
    "title": "string",
    "description": "string?",
    "projectId": "int",
    "projectName": "string",
    "status": "ToDo | InProgress | Done",
    "priority": "Low | Medium | High",
    "dueDate": "DateTime?",
    "createdAt": "DateTime",
    "updatedAt": "DateTime?",
    "assignees": [
      {
        "userId": "string",
        "firstName": "string",
        "lastName": "string",
        "initials": "string"
      }
    ],
    "commentCount": "int"
  }
]
```

---

### GET `/api/tasks/{id}`
**Opis:** Pobranie szczegółów zadania

**Response:** `200 OK`
```json
{
  "id": "int",
  "title": "string",
  "description": "string?",
  "projectId": "int",
  "projectName": "string",
  "status": "ToDo | InProgress | Done",
  "priority": "Low | Medium | High",
  "dueDate": "DateTime?",
  "createdAt": "DateTime",
  "updatedAt": "DateTime?",
  "assignees": [
    {
      "userId": "string",
      "firstName": "string",
      "lastName": "string",
      "initials": "string",
      "assignedAt": "DateTime"
    }
  ],
  "comments": [
    {
      "id": "int",
      "content": "string",
      "authorId": "string",
      "authorName": "string",
      "authorInitials": "string",
      "createdAt": "DateTime"
    }
  ]
}
```

---

### POST `/api/tasks`
**Opis:** Utworzenie nowego zadania

**Request Body:**
```json
{
  "title": "string",
  "description": "string?",
  "projectId": "int",
  "priority": "Low | Medium | High",
  "dueDate": "DateTime?",
  "assigneeIds": ["string"]
}
```

**Response:** `201 Created`
```json
{
  "id": "int",
  "title": "string",
  "description": "string?",
  "projectId": "int",
  "status": "ToDo",
  "priority": "Low | Medium | High",
  "dueDate": "DateTime?",
  "createdAt": "DateTime"
}
```

---

### PUT `/api/tasks/{id}`
**Opis:** Aktualizacja zadania

**Request Body:**
```json
{
  "title": "string",
  "description": "string?",
  "status": "ToDo | InProgress | Done",
  "priority": "Low | Medium | High",
  "dueDate": "DateTime?"
}
```

**Response:** `200 OK`

---

### PATCH `/api/tasks/{id}/status`
**Opis:** Zmiana statusu zadania (dla drag & drop)

**Request Body:**
```json
{
  "status": "ToDo | InProgress | Done"
}
```

**Response:** `200 OK`

---

### DELETE `/api/tasks/{id}`
**Opis:** Usunięcie zadania

**Response:** `204 No Content`

---

### POST `/api/tasks/{id}/assignees`
**Opis:** Przypisanie użytkownika do zadania

**Request Body:**
```json
{
  "userId": "string"
}
```

**Response:** `201 Created`

---

### DELETE `/api/tasks/{id}/assignees/{userId}`
**Opis:** Usunięcie przypisania użytkownika z zadania

**Response:** `204 No Content`

---

## 💬 Komentarze

### GET `/api/tasks/{taskId}/comments`
**Opis:** Pobranie komentarzy do zadania

**Response:** `200 OK`
```json
[
  {
    "id": "int",
    "content": "string",
    "authorId": "string",
    "authorName": "string",
    "authorInitials": "string",
    "createdAt": "DateTime"
  }
]
```

---

### POST `/api/tasks/{taskId}/comments`
**Opis:** Dodanie komentarza do zadania

**Request Body:**
```json
{
  "content": "string"
}
```

**Response:** `201 Created`
```json
{
  "id": "int",
  "content": "string",
  "authorId": "string",
  "authorName": "string",
  "authorInitials": "string",
  "createdAt": "DateTime"
}
```

---

### DELETE `/api/comments/{id}`
**Opis:** Usunięcie komentarza (tylko autor lub administrator)

**Response:** `204 No Content`

---

## 👥 Użytkownicy

### GET `/api/users`
**Opis:** Pobranie listy użytkowników organizacji

**Query Parameters:**
- `search`: `string` (opcjonalne)
- `role`: `Member | TeamLeader | Administrator` (opcjonalne)

**Response:** `200 OK`
```json
[
  {
    "userId": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "initials": "string",
    "role": "Member | TeamLeader | Administrator",
    "isActive": "bool",
    "createdAt": "DateTime",
    "projectCount": "int"
  }
]
```

---

### GET `/api/users/{id}`
**Opis:** Pobranie szczegółów użytkownika

**Response:** `200 OK`
```json
{
  "userId": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "initials": "string",
  "role": "Member | TeamLeader | Administrator",
  "isActive": "bool",
  "createdAt": "DateTime",
  "organizationId": "int",
  "organizationName": "string"
}
```

---

### PUT `/api/users/{id}`
**Opis:** Aktualizacja użytkownika (tylko własny profil lub Administrator)

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "role": "Member | TeamLeader | Administrator"
}
```

**Response:** `200 OK`

---

### DELETE `/api/users/{id}`
**Opis:** Usunięcie użytkownika (tylko Administrator)

**Response:** `204 No Content`

---

### POST `/api/users/invite`
**Opis:** Generowanie kodu zaproszenia (tylko Administrator)

**Response:** `200 OK`
```json
{
  "invitationCode": "string",
  "expiresAt": "DateTime?"
}
```

---

## 📊 Dashboard

### GET `/api/dashboard/stats`
**Opis:** Pobranie statystyk dla dashboardu

**Response:** `200 OK`
```json
{
  "tasks": {
    "todo": "int",
    "inProgress": "int",
    "done": "int",
    "total": "int"
  },
  "projects": {
    "active": "int",
    "inactive": "int",
    "total": "int"
  },
  "recentTasks": [
    {
      "id": "int",
      "title": "string",
      "projectName": "string",
      "status": "ToDo | InProgress | Done",
      "priority": "Low | Medium | High",
      "dueDate": "DateTime?",
      "assignees": ["string"]
    }
  ],
  "recentProjects": [
    {
      "id": "int",
      "name": "string",
      "progress": "int",
      "theme": "string?",
      "memberCount": "int",
      "lastActivity": "DateTime?"
    }
  ]
}
```

---

### GET `/api/dashboard/report`
**Opis:** Generowanie raportu (opcjonalnie jako plik do pobrania)

**Query Parameters:**
- `format`: `json | txt | pdf` (opcjonalne, domyślnie json)
- `startDate`: `DateTime` (opcjonalne)
- `endDate`: `DateTime` (opcjonalne)

**Response:** `200 OK` (JSON) lub `200 OK` z plikiem

---

## ⚙️ Ustawienia

### PUT `/api/users/me`
**Opis:** Aktualizacja własnego profilu

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string"
}
```

**Response:** `200 OK`

---

### PUT `/api/users/me/password`
**Opis:** Zmiana hasła

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response:** `200 OK`

---

## 🔒 Uwagi dotyczące autoryzacji

- Wszystkie endpointy (oprócz `/api/auth/register` i `/api/auth/login`) wymagają autoryzacji
- Autoryzacja odbywa się przez HttpOnly Cookie
- Role:
  - **Member**: Podstawowy dostęp do własnych projektów i zadań
  - **TeamLeader**: Może zarządzać projektami, do których jest przypisany jako lider
  - **Administrator**: Pełny dostęp do organizacji i wszystkich zasobów

---

## 📝 Statusy HTTP

- `200 OK` - Sukces
- `201 Created` - Utworzono zasób
- `204 No Content` - Sukces bez zawartości
- `400 Bad Request` - Błędne żądanie
- `401 Unauthorized` - Brak autoryzacji
- `403 Forbidden` - Brak uprawnień
- `404 Not Found` - Zasób nie znaleziony
- `500 Internal Server Error` - Błąd serwera

---

## 🎯 Endpointy do zaimplementowania (priorytet)

### Wysoki priorytet:
1. ✅ `/api/auth/register`
2. ✅ `/api/auth/login`
3. ✅ `/api/auth/logout`
4. ✅ `/api/auth/me`
5. ✅ `/api/organizations` (POST, GET current)
6. ✅ `/api/organizations/join`
7. ✅ `/api/projects` (GET, POST, PUT, DELETE)
8. ✅ `/api/tasks` (GET, POST, PUT, PATCH status, DELETE)
9. ✅ `/api/tasks/{id}/assignees` (POST, DELETE)
10. ✅ `/api/tasks/{taskId}/comments` (GET, POST)
11. ✅ `/api/comments/{id}` (DELETE)
12. ✅ `/api/users` (GET)
13. ✅ `/api/dashboard/stats`

### Średni priorytet:
14. `/api/users/{id}` (GET, PUT, DELETE)
15. `/api/users/invite`
16. `/api/users/me` (PUT)
17. `/api/users/me/password` (PUT)
18. `/api/projects/{id}/members` (POST, DELETE)
19. `/api/dashboard/report`

### Niski priorytet:
20. `/api/organizations/{id}` (GET, PUT, DELETE)

---

## 📌 Uwagi implementacyjne

1. **Progress projektu**: Powinien być obliczany na podstawie zadań (done / total * 100)
2. **InvitationCode**: Powinien być unikalny i generowany automatycznie przy tworzeniu organizacji
3. **Theme**: Kolor projektu w formacie HEX (np. "#3B82F6")
4. **Drag & Drop**: Użyj `PATCH /api/tasks/{id}/status` dla szybkiej zmiany statusu
5. **Paginacja**: Rozważ dodanie paginacji dla list (np. `/api/tasks?page=1&pageSize=20`)
6. **Filtrowanie**: Wszystkie listy powinny wspierać filtrowanie i wyszukiwanie
7. **Soft Delete**: Rozważ soft delete dla projektów i zadań (pole `IsDeleted`)

