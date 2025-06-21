# Plan Testów E2E - my10xCards

## Przegląd

Ten dokument opisuje kompleksowy plan testów end-to-end dla aplikacji my10xCards, oparty na wymaganiach funkcjonalnych zdefiniowanych w PRD.md. Testy są implementowane w Playwright z TypeScript i weryfikują wszystkie kluczowe scenariusze użytkowania.

## Cel testów

Weryfikacja funkcjonalności aplikacji zgodnie z wymaganiami PRD:

- ✅ Generowanie fiszek przez AI (US-001)
- ✅ Recenzja wygenerowanych fiszek (US-002)
- ✅ Manualne tworzenie fiszek (US-003)
- ✅ Przeglądanie zapisanych fiszek (US-004)
- ✅ Edycja fiszek (US-005)
- ✅ Usuwanie fiszek (US-006)
- ✅ Zarządzanie kontem użytkownika (US-007)
- ✅ Sesja nauki z algorytmem powtórek (US-008)

## Środowisko testowe

- **Framework**: Playwright z TypeScript
- **Przeglądarka**: Chromium, Firefox, Safari (cross-browser testing)
- **Środowisko**: Lokalne środowisko deweloperskie (localhost:3000)
- **Baza danych**: Supabase Local (podczas testów)
- **AI Provider**: OpenRouter (z prawdziwym API lub mock)

## Struktura testów

### Test Suite 1: Zarządzanie kontem użytkownika (US-007)

**Test 1.1: Rejestracja nowego użytkownika**

- Przejdź do strony rejestracji
- Wypełnij formularz (email, hasło, potwierdzenie hasła)
- Sprawdź walidację pól (email format, siła hasła)
- Zweryfikuj sukces rejestracji
- Sprawdź przekierowanie po rejestracji

**Test 1.2: Logowanie użytkownika**

- Przejdź do strony logowania
- Wprowadź poprawne dane logowania
- Sprawdź walidację błędnych danych
- Zweryfikuj sukces logowania
- Sprawdź dostęp do chronionych stron

**Test 1.3: Zmiana hasła**

- Zaloguj się jako użytkownik
- Przejdź do ustawień konta
- Zmień hasło (stare hasło, nowe hasło, potwierdzenie)
- Sprawdź walidację
- Zweryfikuj sukces zmiany hasła

**Test 1.4: Usuwanie konta**

- Zaloguj się jako użytkownik
- Przejdź do ustawień konta
- Usuń konto (z potwierdzeniem)
- Sprawdź czy konto zostało usunięte
- Zweryfikuj brak dostępu po usunięciu

### Test Suite 2: Manualne tworzenie fiszek (US-003)

**Test 2.1: Tworzenie fiszki z poprawnymi danymi**

- Zaloguj się jako użytkownik
- Przejdź do formularza tworzenia fiszki
- Wypełnij przód fiszki (≤200 znaków)
- Wypełnij tył fiszki (≤500 znaków)
- Zapisz fiszkę
- Sprawdź czy fiszka została zapisana w liście

**Test 2.2: Walidacja limitów znaków**

- Wypróbuj przód >200 znaków
- Wypróbuj tył >500 znaków
- Sprawdź komunikaty błędów
- Zweryfikuj że fiszka nie została zapisana

**Test 2.3: Walidacja wymaganych pól**

- Spróbuj zapisać fiszkę z pustym przodem
- Spróbuj zapisać fiszkę z pustym tyłem
- Sprawdź komunikaty błędów
- Zweryfikuj że formularz nie pozwala na zapis

### Test Suite 3: Generowanie fiszek przez AI (US-001)

**Test 3.1: Generowanie fiszek z poprawnym tekstem**

- Zaloguj się jako użytkownik
- Przejdź do generatora AI
- Wprowadź tekst (1000-10000 znaków)
- Uruchom generowanie
- Sprawdź czy wygenerowano maksymalnie 10 fiszek
- Zweryfikuj limity znaków (przód ≤200, tył ≤500)

**Test 3.2: Walidacja długości tekstu wejściowego**

- Wprowadź tekst <1000 znaków
- Wprowadź tekst >10000 znaków
- Sprawdź komunikaty błędów
- Zweryfikuj że generowanie nie rozpoczyna się

**Test 3.3: Obsługa błędów API**

- Symuluj błąd API (brak klucza, błąd sieci)
- Sprawdź wyświetlenie stosownego komunikatu
- Zweryfikuj że użytkownik może spróbować ponownie

### Test Suite 4: Recenzja wygenerowanych fiszek (US-002)

**Test 4.1: Akceptacja fiszek**

- Wygeneruj fiszki przez AI
- Zaznacz wybrane fiszki do akceptacji
- Potwierdź akceptację
- Sprawdź czy fiszki zostały zapisane w bazie
- Zweryfikuj że pojawiają się w liście fiszek

**Test 4.2: Edycja fiszek przed akceptacją**

- Wygeneruj fiszki przez AI
- Edytuj treść wybranej fiszki
- Sprawdź walidację zmian
- Zaakceptuj zedytowaną fiszkę
- Zweryfikuj że zapisana została zmodyfikowana wersja

**Test 4.3: Odrzucenie fiszek**

- Wygeneruj fiszki przez AI
- Odrzuć wybrane fiszki
- Potwierdź akceptację tylko wybranych
- Sprawdź że odrzucone fiszki nie zostały zapisane

### Test Suite 5: Przeglądanie zapisanych fiszek (US-004)

**Test 5.1: Wyświetlanie listy fiszek**

- Zaloguj się z kontm zawierającym fiszki
- Przejdź do listy fiszek
- Sprawdź wyświetlenie fiszek
- Zweryfikuj paginację (10 fiszek na stronę)

**Test 5.2: Wyszukiwanie fiszek**

- Użyj wyszukiwarki z frazą występującą w fiszkach
- Sprawdź czy wyniki są filtrowane
- Sprawdź wyszukiwanie frazy nieistniejącej
- Zweryfikuj działanie wyszukiwania w czasie rzeczywistym

**Test 5.3: Paginacja**

- Przejdź do drugiej strony wyników
- Sprawdź czy fiszki się zmieniają
- Sprawdź nawigację między stronami
- Zweryfikuj licznik wyników

### Test Suite 6: Edycja fiszek (US-005)

**Test 6.1: Edycja istniejącej fiszki**

- Wybierz fiszkę z listy
- Przejdź do trybu edycji
- Zmień treść przodu i/lub tyłu
- Zapisz zmiany
- Sprawdź czy zmiany są widoczne w liście

**Test 6.2: Walidacja podczas edycji**

- Spróbuj zmienić przód na >200 znaków
- Spróbuj zmienić tył na >500 znaków
- Sprawdź komunikaty błędów
- Zweryfikuj że niepoprawne zmiany nie są zapisywane

**Test 6.3: Anulowanie edycji**

- Rozpocznij edycję fiszki
- Wprowadź zmiany
- Anuluj edycję
- Sprawdź czy fiszka pozostała bez zmian

### Test Suite 7: Usuwanie fiszek (US-006)

**Test 7.1: Usuwanie pojedynczej fiszki**

- Wybierz fiszkę z listy
- Kliknij opcję usuwania
- Potwierdź usunięcie
- Sprawdź czy fiszka zniknęła z listy

**Test 7.2: Anulowanie usuwania**

- Rozpocznij proces usuwania fiszki
- Anuluj operację
- Sprawdź czy fiszka nadal istnieje

**Test 7.3: Potwierdzenie usuwania**

- Sprawdź czy system wymaga potwierdzenia
- Zweryfikuj komunikat potwierdzający
- Sprawdź czy przypadkowe kliknięcie nie usuwa fiszki

### Test Suite 8: Sesja nauki z algorytmem powtórek (US-008)

**Test 8.1: Rozpoczęcie sesji nauki**

- Zaloguj się z kontem zawierającym fiszki
- Przejdź do widoku "Sesja nauki"
- Sprawdź czy sesja się rozpoczyna
- Zweryfikuj wyświetlenie pierwszej fiszki (tylko przód)

**Test 8.2: Interakcja z fiszką w sesji**

- Sprawdź czy fiszka pokazuje tylko przód
- Kliknij aby zobaczyć tył
- Sprawdź czy tył się wyświetla
- Zweryfikuj opcje oceny (1-5)

**Test 8.3: Ocenianie fiszek**

- Oceń fiszkę (wybierz rating 1-5)
- Sprawdź czy ocena jest zapisywana
- Zweryfikuj przejście do następnej fiszki
- Sprawdź czy algorytm wybiera kolejną fiszkę

**Test 8.4: Postęp nauki**

- Oceń kilka fiszek w sesji
- Sprawdź czy postęp jest zapisywany
- Zweryfikuj statystyki sesji
- Sprawdź czy fiszki są wybierane zgodnie z algorytmem

**Test 8.5: Zakończenie sesji**

- Zakończ sesję nauki
- Sprawdź podsumowanie sesji
- Zweryfikuj czy postęp został zapisany
- Sprawdź czy można rozpocząć nową sesję

## Testy integracyjne

### Test Integration 1: Workflow AI → Recenzja → Nauka

- Wygeneruj fiszki przez AI
- Zaakceptuj wybrane fiszki
- Przejdź do sesji nauki
- Sprawdź czy zaakceptowane fiszki są dostępne w nauce

### Test Integration 2: Pełny cykl życia fiszki

- Utwórz fiszkę manualnie
- Edytuj fiszkę
- Użyj fiszki w sesji nauki
- Oceń fiszkę w nauce
- Sprawdź postęp
- Usuń fiszkę

## Testy wydajnościowe

### Test Performance 1: Generowanie wielu fiszek

- Wprowadź maksymalny tekst (10000 znaków)
- Zmierz czas generowania
- Sprawdź czy aplikacja pozostaje responsywna

### Test Performance 2: Paginacja dużej liczby fiszek

- Utwórz >100 fiszek
- Sprawdź wydajność paginacji
- Zweryfikuj czas ładowania stron

## Testy cross-browser

- Wykonaj kluczowe scenariusze w Chromium, Firefox, Safari
- Sprawdź kompatybilność UI
- Zweryfikuj działanie JavaScript API

## Testy responsywności

- Sprawdź aplikację na różnych rozdzielczościach
- Zweryfikuj mobile-first design
- Sprawdź użyteczność na urządzeniach dotykowych

## Kryteria sukcesu testów

✅ **Wszystkie testy przechodzą** - 100% success rate
✅ **Brak błędów krytycznych** - nie ma crashy lub utraty danych  
✅ **Walidacja działa poprawnie** - wszystkie limity i wymagania są egzekwowane
✅ **UI jest intuicyjne** - użytkownik może wykonać wszystkie scenariusze bez problemów
✅ **Wydajność jest akceptowalna** - operacje wykonują się w rozsądnym czasie
✅ **Cross-browser compatibility** - aplikacja działa we wszystkich głównych przeglądarkach

## Automatyzacja

- Testy uruchamiane automatycznie w CI/CD pipeline
- Testy smoke przed każdym deploymentem
- Nightly regression tests na wszystkich scenariuszach
- Integration z GitHub Actions

## Zgłaszanie błędów

- Błędy krytyczne: natychmiastowe zgłoszenie z nagraniem wideo
- Błędy funkcjonalne: szczegółowy opis kroków reprodukcji
- Błędy UI/UX: zrzuty ekranu z różnych przeglądarek
- Błędy wydajnościowe: raporty z metrykami

---

_Plan testów pokrywa wszystkie wymagania funkcjonalne z PRD i zapewnia kompleksową weryfikację aplikacji my10xCards._
