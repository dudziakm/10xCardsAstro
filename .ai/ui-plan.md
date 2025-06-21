# Architektura UI dla my10xCards

## 1. Przegląd struktury UI

Aplikacja my10xCards opiera się na intuicyjnej architekturze interfejsu użytkownika, składającej się z trzech głównych sekcji dostępnych z górnego paska nawigacyjnego: "Moje fiszki", "Generowanie AI" oraz "Sesja nauki". Projekt zakłada prostotę i efektywność, umożliwiając użytkownikom szybkie tworzenie, zarządzanie i naukę z fiszek edukacyjnych.

Struktura UI została zaprojektowana tak, aby odzwierciedlać główne funkcjonalności produktu:

- Autentykacja użytkowników i zarządzanie kontem
- Przeglądanie i zarządzanie fiszkami
- Generowanie fiszek za pomocą AI
- Nauka z wykorzystaniem algorytmu spaced repetition

Architektura wspiera responsywność, dzięki czemu interfejs dostosowuje się do różnych urządzeń bez potrzeby dedykowanej aplikacji mobilnej.

## 2. Lista widoków

### Strona logowania/rejestracji

- **Ścieżka**: `/auth`
- **Główny cel**: Umożliwienie użytkownikowi logowania lub założenia nowego konta
- **Kluczowe informacje**: Formularze logowania i rejestracji z przełączaniem między nimi
- **Kluczowe komponenty**:
  - Przełączalne zakładki "Logowanie" / "Rejestracja"
  - Formularze z walidacją pól
  - Przyciski submit
  - Link do resetowania hasła
- **UX, dostępność i bezpieczeństwo**:
  - Jasne komunikaty błędów przy niepoprawnych danych
  - Oznaczenie wymaganych pól
  - Walidacja formatu e-mail i siły hasła
  - Ochrona przed atakami typu brute force przez limity prób logowania

### Strona główna (dashboard)

- **Ścieżka**: `/`
- **Główny cel**: Zapewnienie szybkiego dostępu do kluczowych funkcji aplikacji
- **Kluczowe informacje**: Statystyki fiszek, skróty do głównych funkcji
- **Kluczowe komponenty**:
  - Widżety statystyk (całkowita liczba fiszek, podział AI/manual)
  - Duże przyciski do głównych funkcji: "Moje fiszki", "Generuj fiszki", "Ucz się"
  - Informacja o ostatniej sesji nauki (jeśli była)
- **UX, dostępność i bezpieczeństwo**:
  - Intuicyjny układ ważności elementów
  - Wyraźne etykiety i ikony dla przycisków
  - Responsywny układ dostosowujący się do różnych urządzeń

### Moje fiszki (lista)

- **Ścieżka**: `/flashcards`
- **Główny cel**: Wyświetlenie wszystkich fiszek użytkownika z możliwością wyszukiwania i zarządzania
- **Kluczowe informacje**: Lista fiszek z możliwością filtrowania i wyszukiwania
- **Kluczowe komponenty**:
  - Pole wyszukiwania
  - Lista fiszek w formie kart
  - Ikony wskazujące źródło fiszki (AI/manual)
  - Przyciski edycji i usuwania przy każdej fiszce
  - Paginacja
  - Przyciski "Dodaj fiszkę" i "Generuj fiszki"
- **UX, dostępność i bezpieczeństwo**:
  - Wskaźnik ładowania podczas pobierania danych
  - Komunikat gdy brak fiszek
  - Potwierdzenie przed usunięciem
  - Responsywny układ list dla różnych urządzeń

### Tworzenie fiszki (manualnie)

- **Ścieżka**: `/flashcards/create`
- **Główny cel**: Umożliwienie użytkownikowi manualnego tworzenia nowej fiszki
- **Kluczowe informacje**: Formularz z polami na przód i tył fiszki
- **Kluczowe komponenty**:
  - Formularz z dwoma polami tekstowymi
  - Liczniki znaków (limit: przód 200, tył 500)
  - Przyciski "Zapisz" i "Anuluj"
- **UX, dostępność i bezpieczeństwo**:
  - Blokada wprowadzania po osiągnięciu limitu
  - Walidacja formularza przed wysłaniem
  - Przyciski dużych rozmiarów dla lepszej dostępności

### Edycja fiszki

- **Ścieżka**: `/flashcards/edit/{id}`
- **Główny cel**: Umożliwienie edycji istniejącej fiszki
- **Kluczowe informacje**: Formularz z aktualnymi danymi fiszki
- **Kluczowe komponenty**:
  - Formularz z wypełnionymi polami
  - Liczniki znaków
  - Przyciski "Zapisz zmiany" i "Anuluj"
- **UX, dostępność i bezpieczeństwo**:
  - Wskaźnik ładowania podczas pobierania i zapisywania
  - Ochrona przed utratą danych (potwierdzenie przy opuszczaniu z niezapisanymi zmianami)
  - Komunikaty powodzenia/błędu

### Generowanie fiszek przez AI - krok 1

- **Ścieżka**: `/flashcards/generate`
- **Główny cel**: Wprowadzenie tekstu źródłowego do generowania fiszek
- **Kluczowe informacje**: Pole tekstowe na tekst źródłowy
- **Kluczowe komponenty**:
  - Duże pole tekstowe
  - Licznik znaków (1000-10000)
  - Przycisk "Generuj fiszki"
  - Informacja o ograniczeniach
- **UX, dostępność i bezpieczeństwo**:
  - Walidacja długości tekstu przed wysłaniem
  - Blokada przycisku generowania do spełnienia wymagań
  - Wskaźnik ładowania podczas generowania

### Generowanie fiszek przez AI - krok 2

- **Ścieżka**: `/flashcards/generate/review`
- **Główny cel**: Recenzja wygenerowanych fiszek i wybór do zapisania
- **Kluczowe informacje**: Lista wygenerowanych fiszek-kandydatów
- **Kluczowe komponenty**:
  - Lista interaktywnych kart fiszek
  - Checkboxy przy każdej fiszce
  - Przycisk "Zaakceptuj zaznaczone"
  - Przycisk "Anuluj"
- **UX, dostępność i bezpieczeństwo**:
  - Możliwość podglądu obu stron fiszki przed akceptacją
  - Przycisk "Zaznacz wszystkie"
  - Komunikat po zapisaniu fiszek

### Sesja nauki - przegląd fiszki (przód)

- **Ścieżka**: `/learn`
- **Główny cel**: Pokazanie przodu fiszki w trybie nauki
- **Kluczowe informacje**: Treść przodu fiszki
- **Kluczowe komponenty**:
  - Duża karta z treścią przodu fiszki
  - Instrukcja "Kliknij, aby zobaczyć odpowiedź"
  - Przycisk "Zakończ sesję"
  - Informacja o postępie sesji
- **UX, dostępność i bezpieczeństwo**:
  - Prosta, czytelna prezentacja treści
  - Wyraźna zachęta do akcji
  - Możliwość zakończenia sesji w dowolnym momencie

### Sesja nauki - przegląd fiszki (tył) z oceną wiedzy

- **Ścieżka**: `/learn` (ten sam widok, inny stan)
- **Główny cel**: Pokazanie tyłu fiszki i umożliwienie oceny znajomości
- **Kluczowe informacje**: Treść tyłu fiszki, przyciski oceny
- **Kluczowe komponenty**:
  - Duża karta z treścią tyłu fiszki
  - Przyciski oceny znajomości (1-5)
  - Informacja o znaczeniu ocen
- **UX, dostępność i bezpieczeństwo**:
  - Czytelny układ ocen z opisami
  - Wyraźne odróżnienie przodu i tyłu fiszki
  - Animacja przewracania karty dla lepszego UX

### Profil użytkownika

- **Ścieżka**: `/profile`
- **Główny cel**: Zarządzanie kontem użytkownika
- **Kluczowe informacje**: Informacje o koncie, opcje zarządzania
- **Kluczowe komponenty**:
  - Informacje o koncie (email, data rejestracji)
  - Przycisk "Zmień hasło"
  - Przycisk "Usuń konto"
  - Przycisk "Wyloguj się"
- **UX, dostępność i bezpieczeństwo**:
  - Jasny podział sekcji
  - Przyciski z potwierdzeniem dla krytycznych akcji
  - Zabezpieczenie przed przypadkowym usunięciem konta

### Zmiana hasła

- **Ścieżka**: `/profile/change-password`
- **Główny cel**: Umożliwienie zmiany hasła
- **Kluczowe informacje**: Formularz zmiany hasła
- **Kluczowe komponenty**:
  - Pole na obecne hasło
  - Pole na nowe hasło
  - Pole potwierdzenia nowego hasła
  - Przyciski "Zmień hasło" i "Anuluj"
- **UX, dostępność i bezpieczeństwo**:
  - Walidacja siły nowego hasła
  - Potwierdzenie udanej zmiany
  - Zabezpieczenie przed nieautoryzowaną zmianą

### Usuwanie konta

- **Ścieżka**: `/profile/delete-account`
- **Główny cel**: Potwierdzenie i wykonanie usunięcia konta
- **Kluczowe informacje**: Ostrzeżenie o konsekwencjach, formularz potwierdzenia
- **Kluczowe komponenty**:
  - Ostrzeżenie o nieodwracalności akcji
  - Pole na hasło dla potwierdzenia
  - Przyciski "Usuń konto" i "Anuluj"
- **UX, dostępność i bezpieczeństwo**:
  - Wyraźne ostrzeżenie o konsekwencjach
  - Dwustopniowa weryfikacja (przycisk + hasło)
  - Wyraźne rozróżnienie przycisków akcji

## 3. Mapa podróży użytkownika

### Rejestracja i pierwsze kroki

1. Użytkownik wchodzi na stronę -> Widok logowania/rejestracji
2. Użytkownik rejestruje się -> Widok strony głównej (dashboard)
3. Użytkownik wybiera "Generowanie AI" -> Widok generowania (krok 1)
4. Użytkownik wprowadza tekst -> Walidacja -> Wysłanie do API
5. Użytkownik przegląda wygenerowane fiszki -> Widok generowania (krok 2)
6. Użytkownik zaznacza wybrane fiszki -> Zapisanie -> Widok "Moje fiszki"
7. Użytkownik przechodzi do "Sesja nauki" -> Rozpoczęcie nauki

### Codzienna nauka

1. Użytkownik loguje się -> Widok strony głównej
2. Użytkownik wybiera "Sesja nauki" -> Widok sesji nauki (przód fiszki)
3. Użytkownik klika, aby zobaczyć tył -> Widok sesji nauki (tył fiszki)
4. Użytkownik ocenia znajomość -> System pobiera następną fiszkę
5. Proces powtarza się do końca sesji lub wyjścia użytkownika

### Zarządzanie fiszkami

1. Użytkownik loguje się -> Widok strony głównej
2. Użytkownik wybiera "Moje fiszki" -> Widok listy fiszek
3. Użytkownik może:
   - Wyszukać konkretne fiszki
   - Dodać nową fiszkę manualnie -> Widok tworzenia fiszki
   - Edytować istniejącą fiszkę -> Widok edycji fiszki
   - Usunąć fiszkę -> Potwierdzenie -> Powrót do listy

## 4. Układ i struktura nawigacji

### Główne elementy nawigacji

1. **Górny pasek nawigacyjny** (widoczny na wszystkich stronach po zalogowaniu):

   - Logo (link do strony głównej)
   - "Moje fiszki"
   - "Generowanie AI"
   - "Sesja nauki"
   - Dropdown profilu użytkownika

2. **Dropdown profilu użytkownika**:

   - Email użytkownika
   - "Profil"
   - "Zmień hasło"
   - "Wyloguj się"
   - "Usuń konto"

3. **Przyciski kontekstowe**:
   - Na stronie głównej: skróty do głównych funkcji
   - Na liście fiszek: "Dodaj fiszkę", "Generuj fiszki"
   - W procesie generowania: "Wstecz", "Anuluj", "Zaakceptuj zaznaczone"
   - W sesji nauki: przyciski oceny znajomości, "Zakończ sesję"

### Przepływ nawigacji

- **Stan przed zalogowaniem**: Dostępna tylko strona logowania/rejestracji
- **Stan po zalogowaniu**: Dostęp do pełnej nawigacji
- **Struktura zagnieżdżona**: Główne widoki dostępne z górnego paska, akcje kontekstowe z przycisków w widoku

## 5. Kluczowe komponenty

### Karta fiszki

Uniwersalny komponent do prezentacji fiszki, używany w różnych kontekstach:

- W widoku listy: kompaktowa wersja
- W sesji nauki: pełnoekranowa wersja z animacją przewracania
- W procesie generowania: z checkboxem do zaznaczenia

### Formularz fiszki

Komponent formularza używany przy tworzeniu i edycji fiszek:

- Pola tekstowe z walidacją i licznikami znaków
- Przyciski akcji
- Obsługa błędów walidacji

### Kontrolki wyszukiwania i filtrowania

Komponent używany w widoku "Moje fiszki":

- Pole wyszukiwania
- Opcje filtrowania (źródło: AI/manual)
- Sterowanie sortowaniem

### Paginacja

Komponent używany wszędzie, gdzie występują listy danych:

- Przyciski nawigacji między stronami
- Informacja o aktualnej/całkowitej liczbie stron
- Opcja wyboru liczby elementów na stronę

### Formularze autentykacji

Komponenty do logowania, rejestracji, zmiany hasła:

- Pola formularza z walidacją
- Obsługa błędów
- Przyciski akcji

### System powiadomień

Komponent do wyświetlania komunikatów:

- Powiadomienia o sukcesie
- Powiadomienia o błędach
- Potwierdzenia akcji

### Przyciski oceny wiedzy

Komponent używany w sesji nauki:

- Przyciski oceny od 1 do 5
- Opisy znaczenia ocen
- Wizualne rozróżnienie poziomów
