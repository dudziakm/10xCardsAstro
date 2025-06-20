# Implementation Roadmap dla my10xCards

## Obecny stan: ~15% ukończenia

### FAZA 1: INFRASTRUKTURA I BACKEND API (Priotytet: KRYTYCZNY)

#### 1.1 Migracje bazy danych
- [x] Podstawowe tabele (flashcards, generations, generation_error_logs)
- [ ] Zastosowanie migracji learning_sessions i flashcard_progress
- [ ] Weryfikacja RLS policies

#### 1.2 Brakujące pliki implementacyjne API (11 plików)
**Authentication Endpoints:**
- [ ] `api-impl-post-auth-register.md`
- [ ] `api-impl-post-auth-login.md`
- [ ] `api-impl-post-auth-change-password.md`
- [ ] `api-impl-delete-auth-account.md`

**Flashcard CRUD:**
- [ ] `api-impl-get-flashcard-by-id.md`
- [ ] `api-impl-put-flashcard.md`
- [ ] `api-impl-delete-flashcard.md`

**Learning Algorithm:**
- [ ] `api-impl-get-flashcards-next-for-learning.md`
- [ ] `api-impl-post-flashcard-review.md`

**Generation Details:**
- [ ] `api-impl-get-generation-by-id.md`

**Batch Operations:**
- [ ] `api-impl-post-flashcards-batch.md`

#### 1.3 Implementacja endpointów API (14 endpointów)
**Kolejność implementacji:**

**Wysokий priorytet (MVP):**
1. [ ] GET `/api/flashcards` (lista z paginacją)
2. [ ] GET `/api/flashcards/{id}` (pojedyncza fiszka)
3. [ ] PUT `/api/flashcards/{id}` (edycja)
4. [ ] DELETE `/api/flashcards/{id}` (usuwanie)
5. [ ] POST `/api/auth/register` (rejestracja)
6. [ ] POST `/api/auth/login` (logowanie)

**Średni priorytet:**
7. [ ] POST `/api/flashcards/generate` (AI generation)
8. [ ] POST `/api/flashcards/accept` (akceptacja kandydatów)
9. [ ] GET `/api/learn/session` (następna fiszka)
10. [ ] POST `/api/learn/session/rate` (ocena fiszki)

**Niski priorytet:**
11. [ ] POST `/api/auth/change-password`
12. [ ] DELETE `/api/auth/account`
13. [ ] GET `/api/generations`
14. [ ] GET `/api/generations/{id}`

#### 1.4 Serwisy backendowe
**Rozszerzenie FlashcardService:**
- [ ] `listFlashcards()` - paginacja i wyszukiwanie
- [ ] `getFlashcardById()`
- [ ] `updateFlashcard()`
- [ ] `deleteFlashcard()`

**Nowe serwisy:**
- [ ] `AuthService` - kompletna autentykacja
- [ ] `GenerationService` - integracja z AI
- [ ] `LearningService` - algorytm spaced repetition

#### 1.5 Schematy Zod
- [ ] Schematy dla wszystkich endpointów auth
- [ ] Schematy dla query parameters (search, pagination)
- [ ] Schematy dla learning session
- [ ] Schematy dla AI generation

### FAZA 2: FRONTEND I KOMPONENTY UI (Priotytet: WYSOKI)

#### 2.1 Podstawowe komponenty UI
**Komponenty formularzy:**
- [ ] `FlashcardForm` - tworzenie/edycja fiszki
- [ ] `LoginForm` - logowanie
- [ ] `RegisterForm` - rejestracja
- [ ] `ChangePasswordForm` - zmiana hasła
- [ ] `GenerateForm` - formularz AI generation

**Komponenty wyświetlania:**
- [ ] `FlashcardCard` - pojedyncza fiszka
- [ ] `FlashcardList` - lista fiszek z paginacją
- [ ] `SearchBar` - wyszukiwanie fiszek
- [ ] `Pagination` - nawigacja stron
- [ ] `LoadingSpinner` - wskaźnik ładowania

**Komponenty sesji nauki:**
- [ ] `LearningCard` - fiszka w trybie nauki
- [ ] `RatingButtons` - przyciski oceny (1-5)
- [ ] `LearningProgress` - postęp sesji

**Komponenty AI:**
- [ ] `GenerationCandidates` - przegląd kandydatów
- [ ] `CandidateReview` - akceptacja/odrzucenie kandydatów

#### 2.2 Strony Astro
**Strony autentykacji:**
- [ ] `/login` - strona logowania
- [ ] `/register` - strona rejestracji
- [ ] `/profile` - profil użytkownika
- [ ] `/profile/change-password` - zmiana hasła

**Strony główne:**
- [ ] `/` - dashboard (strona główna)
- [ ] `/flashcards` - lista fiszek
- [ ] `/flashcards/new` - tworzenie fiszki
- [ ] `/flashcards/[id]` - podgląd fiszki
- [ ] `/flashcards/[id]/edit` - edycja fiszki

**Strony AI i nauki:**
- [ ] `/generate` - generowanie przez AI
- [ ] `/generate/review` - przegląd kandydatów
- [ ] `/learn` - sesja nauki
- [ ] `/generations` - historia generacji

#### 2.3 Layout i nawigacja
- [ ] Główny layout z nawigacją
- [ ] Responsive design
- [ ] Error boundaries
- [ ] Loading states

### FAZA 3: INTEGRACJA AI I ALGORYTM NAUKI (Priotytet: ŚREDNI)

#### 3.1 Integracja OpenRouter AI
- [ ] Konfiguracja API client
- [ ] Prompt engineering dla generowania fiszek
- [ ] Error handling dla API AI
- [ ] Rate limiting i quota management

#### 3.2 Algorytm Spaced Repetition
- [ ] Implementacja algorytmu nauki
- [ ] Kalkulacja następnych dat powtórek
- [ ] Difficulty rating system
- [ ] Progress tracking

### FAZA 4: TESTOWANIE I OPTYMALIZACJA (Priotytet: NISKI)

#### 4.1 Testy
- [ ] Unit testy dla serwisów
- [ ] Integration testy dla API
- [ ] E2E testy dla UI flow

#### 4.2 Optymalizacja
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] PWA features
- [ ] Error monitoring

## Szacowany czas implementacji: 3-4 tygodnie

**Tydzień 1:** Faza 1 (Backend API)
**Tydzień 2:** Faza 2.1-2.2 (Frontend podstawowy)
**Tydzień 3:** Faza 2.3 + Faza 3.1 (Layout + AI)
**Tydzień 4:** Faza 3.2 + Faza 4 (Algorytm nauki + testy)

## Następne kroki realizacji

1. **START:** Zastosowanie migracji bazy danych
2. **Utworzenie brakujących plików .md** dla endpointów API
3. **Implementacja endpointów w kolejności priorytetów**
4. **Równolegle:** tworzenie komponentów UI
5. **Integracja frontendu z backendem**
6. **Dodanie funkcjonalności AI i algorytmu nauki**