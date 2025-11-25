# 📡 API Client Documentation

## 📋 Przegląd

Ten folder zawiera centralny klient API dla aplikacji TeamFlow. Wszystkie wywołania do backendu przechodzą przez ten klient, zapewniając spójną obsługę błędów, retry logic i konfigurację.

---

## 🏗️ Struktura

```
api/
├── client.ts              # Główny klient HTTP z retry logic
├── types.ts               # TypeScript typy dla API
├── index.ts              # Centralne eksporty
└── services/
    ├── authService.ts    # Serwis autoryzacji
    └── organizationService.ts  # Serwis organizacji
```

---

## 🚀 Szybki start

### 1. Konfiguracja Base URL

Utwórz plik `.env` w głównym katalogu projektu:

```env
VITE_API_BASE_URL=http://localhost:5112
```

Domyślnie, jeśli zmienna nie jest ustawiona, używa `http://localhost:5112`.

### 2. Użycie w komponencie

```tsx
import { authService } from '../api';
import { useLoading } from '../hooks/useLoading';
import { useApiError } from '../hooks/useApiError';
import { useToast } from '../contexts/ToastContext';

function MyComponent() {
  const { isLoading, startLoading, stopLoading } = useLoading();
  const handleApiError = useApiError();
  const { success } = useToast();

  const handleLogin = async () => {
    startLoading();
    try {
      const user = await authService.login({ email, password });
      success('Zalogowano pomyślnie!');
    } catch (error) {
      handleApiError(error);
    } finally {
      stopLoading();
    }
  };
}
```

---

## 📚 API Client (`client.ts`)

### Funkcje HTTP

- `get<T>(endpoint, retryConfig?)` - GET request
- `post<T>(endpoint, data?, retryConfig?)` - POST request
- `put<T>(endpoint, data?, retryConfig?)` - PUT request
- `patch<T>(endpoint, data?, retryConfig?)` - PATCH request
- `del<T>(endpoint, retryConfig?)` - DELETE request

### Konfiguracja Retry

Domyślnie:
- **Max retries**: 3
- **Retry delay**: 1000ms (exponential backoff)
- **Retryable statuses**: 408, 429, 500, 502, 503, 504

Możesz nadpisać konfigurację:

```tsx
import { get } from '../api/client';

const data = await get('/api/endpoint', {
  maxRetries: 5,
  retryDelay: 2000,
  retryableStatuses: [500, 502, 503],
});
```

### Obsługa błędów

Klient automatycznie:
- ✅ Włącza `credentials: 'include'` dla cookies
- ✅ Parsuje JSON odpowiedzi
- ✅ Rzuca `ApiException` dla błędów API
- ✅ Retry dla retryable błędów
- ✅ Exponential backoff

---

## 🔐 Auth Service

```tsx
import { authService } from '../api';

// Rejestracja
const response = await authService.register({
  firstName: 'Jan',
  lastName: 'Kowalski',
  email: 'jan@example.com',
  password: 'Test123',
});

// Logowanie
const user = await authService.login({
  email: 'jan@example.com',
  password: 'Test123',
});

// Pobranie aktualnego użytkownika
const currentUser = await authService.getMe();

// Wylogowanie
await authService.logout();
```

---

## 🏢 Organization Service

```tsx
import { organizationService } from '../api';

// Utworzenie organizacji
const org = await organizationService.create({
  name: 'Moja Firma',
  description: 'Opis',
});

// Dołączenie do organizacji
const response = await organizationService.join({
  invitationCode: 'ABC12345',
});

// Pobranie organizacji użytkownika
const currentOrg = await organizationService.getCurrent();

// Aktualizacja organizacji
const updated = await organizationService.update(1, {
  name: 'Nowa Nazwa',
});

// Usunięcie organizacji
await organizationService.delete(1);
```

---

## 🎣 Hooks

### `useLoading`

Zarządzanie stanem ładowania:

```tsx
import { useLoading } from '../hooks/useLoading';

const { isLoading, startLoading, stopLoading } = useLoading();
```

### `useApiError`

Obsługa błędów API z toast notifications:

```tsx
import { useApiError } from '../hooks/useApiError';

const handleApiError = useApiError();

try {
  await apiCall();
} catch (error) {
  handleApiError(error, 'Custom error message');
}
```

### `useToast`

Wyświetlanie powiadomień:

```tsx
import { useToast } from '../contexts/ToastContext';

const { success, error, info, warning } = useToast();

success('Operacja zakończona pomyślnie!');
error('Wystąpił błąd!');
info('Informacja');
warning('Ostrzeżenie');
```

---

## 🎨 Toast Notifications

Toast notifications są automatycznie wyświetlane w prawym górnym rogu ekranu.

**Typy:**
- `success` - Zielony (sukces)
- `error` - Czerwony (błąd)
- `warning` - Żółty (ostrzeżenie)
- `info` - Niebieski (informacja)

**Domyślny czas wyświetlania:** 5 sekund

**Przykład:**

```tsx
const { success, error } = useToast();

// Automatyczne zamknięcie po 5 sekundach
success('Zapisano!');

// Niestandardowy czas (10 sekund)
success('Zapisano!', 10000);

// Bez automatycznego zamknięcia
success('Zapisano!', 0);
```

---

## 🔧 TypeScript Types

Wszystkie typy są zdefiniowane w `api/types.ts`:

- `UserDto` - Dane użytkownika
- `OrganizationDto` - Dane organizacji
- `LoginDto`, `RegisterDto` - DTO dla autoryzacji
- `CreateOrganizationDto`, `UpdateOrganizationDto` - DTO dla organizacji
- I więcej...

---

## ⚠️ Ważne uwagi

1. **Cookies**: Wszystkie requesty automatycznie używają `credentials: 'include'` dla cookie authentication.

2. **Base URL**: Ustaw `VITE_API_BASE_URL` w `.env` dla różnych środowisk.

3. **Error Handling**: Zawsze używaj `useApiError` hook do obsługi błędów - automatycznie wyświetli toast notification.

4. **Loading States**: Używaj `useLoading` hook zamiast lokalnego `useState` dla spójności.

5. **Retry Logic**: Domyślnie retry działa tylko dla błędów serwera (5xx) i timeoutów. Błędy 4xx (klient) nie są retryowane.

---

## 📝 Przykład pełnego komponentu

```tsx
import React, { useState } from 'react';
import { authService } from '../api';
import { useLoading } from '../hooks/useLoading';
import { useApiError } from '../hooks/useApiError';
import { useToast } from '../contexts/ToastContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { isLoading, startLoading, stopLoading } = useLoading();
  const handleApiError = useApiError();
  const { success } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startLoading();

    try {
      const user = await authService.login({ email, password });
      success('Zalogowano pomyślnie!');
      // Redirect...
    } catch (error) {
      handleApiError(error, 'Nieprawidłowe dane logowania');
    } finally {
      stopLoading();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Ładowanie...' : 'Zaloguj'}
      </button>
    </form>
  );
}
```

---

## 🐛 Troubleshooting

### Problem: CORS errors

**Rozwiązanie:** Upewnij się, że backend ma skonfigurowany CORS dla twojego frontendu (port 3000 lub 5173).

### Problem: Cookies nie są wysyłane

**Rozwiązanie:** Klient automatycznie używa `credentials: 'include'`. Sprawdź konfigurację CORS na backendzie - musi mieć `AllowCredentials: true`.

### Problem: Błędy TypeScript

**Rozwiązanie:** Upewnij się, że wszystkie typy są zaimportowane z `api/types.ts` lub użyj `import type` dla typów.

---

**Gotowe! Teraz możesz używać API w całej aplikacji! 🚀**

