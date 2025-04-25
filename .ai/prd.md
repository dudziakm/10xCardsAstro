# Dokument wymagań produktu (PRD) - my10xCards
## 1. Przegląd produktu
Produkt my10xCards ma na celu ułatwienie tworzenia wysokiej jakości fiszek edukacyjnych poprzez automatyczne generowanie treści za pomocą technologii AI oraz umożliwienie manualnego tworzenia fiszek. System skierowany jest do profesjonalistów, którzy potrzebują efektywnego narzędzia wspierającego naukę poprzez technikę spaced repetition. Aplikacja oferuje prosty interfejs, integrację z API OpenRouter, zarządzanie użytkownikami (rejestracja, logowanie, zmiana hasła i usuwanie konta) oraz zapisywanie logów generowania fiszek.

## 2. Problem użytkownika
Użytkownicy manualnie tworzący fiszki często zmagają się z czasochłonnością i trudnościami w zachowaniu wysokiej jakości treści. To zniechęca ich od korzystania z efektywnych metod nauki, takich jak spaced repetition, które wymagają regularnych powtórek. System my10xCards rozwiązuje ten problem, automatyzując proces tworzenia fiszek za pomocą AI i umożliwiając szybkie wprowadzanie manualnych treści.

## 3. Wymagania funkcjonalne
- Generowanie fiszek przez AI:
  - Umożliwienie wprowadzenia tekstu o długości od 1000 do 10000 znaków.
  - Automatyczne generowanie maksymalnie 10 fiszek-kandydatów.
  - Każda wygenerowana fiszka ma przód ograniczony do 200 znaków i tył do 500 znaków.
  - Fiszki generowane przez AI są prezentowane użytkownikowi do recenzji (akceptacja, edycja, odrzucenie), a tylko zaakceptowane są zapisywane.
- Manualne tworzenie fiszek:
  - Formularz do ręcznego wprowadzania przodu (max 200 znaków) i tyłu (max 500 znaków) fiszki.
  - Walidacja danych przed zapisem do bazy danych.
- Zarządzanie fiszkami:
  - Lista zapisanych fiszek z funkcją wyszukiwania i paginacją (np. 10 fiszek na stronę).
  - Możliwość edycji i usuwania fiszek.
- System użytkowników:
  - Rejestracja i logowanie przez email/hasło (integracja z Supabase).
  - Funkcjonalność zmiany hasła i usuwania konta.
- Logi generowania:
  - Zapisywanie zdarzeń generowania fiszek w dedykowanej tabeli do późniejszej analizy.
- Sesja nauki z algorytmem powtórek:
  - Dedykowany widok "Sesja nauki" dostępny po zalogowaniu.
  - Integracja z zewnętrznym algorytmem powtórek do efektywnej nauki.
  - Możliwość przeglądania fiszek w trybie nauki (najpierw przód, po kliknięciu tył).
  - Ocenianie stopnia przyswojenia wiedzy z danej fiszki.
  - Losowy wybór kolejnych fiszek przez algorytm.

## 4. Zakres MVP
- Brak implementacji zaawansowanego algorytmu powtórek (np. SuperMemo, Anki).
- Brak importu fiszek z plików w formatach PDF, DOCX itp.
- Brak możliwości współdzielenia fiszek między użytkownikami.
- Brak integracji z innymi platformami edukacyjnymi.
- Aplikacja na początek dostępna tylko jako web, bez dedykowanej wersji mobilnej.
- Brak zaawansowanego filtrowania oraz kategoryzacji fiszek (oprócz prostej wyszukiwarki i paginacji).
- Brak możliwości eksportu fiszek.

## 5. Historyjki użytkowników

US-001
Tytuł: Generowanie fiszek przez AI
Opis: Jako profesjonalista chcę wkleić tekst specjalistyczny (1000-10000 znaków) do systemu, aby AI wygenerowało do 10 fiszek-kandydatów, gdzie każda fiszka ma przód nie przekraczający 200 znaków i tył nie przekraczający 500 znaków.
Kryteria akceptacji:
- System przyjmuje tekst w określonym zakresie znaków.
- AI generuje maksymalnie 10 fiszek-kandydatów.
- Wygenerowane fiszki są prezentowane do recenzji przez użytkownika.
- W przypadku problemów z API lub braku odpowiedzi modelu, użytkownik zobaczy stosowny komunikat o błędzie.

US-002
Tytuł: Recenzja wygenerowanych fiszek
Opis: Jako użytkownik chcę mieć możliwość przeglądania wygenerowanych fiszek, aby zaakceptować, edytować lub odrzucić każdą z nich.
Kryteria akceptacji:
- Użytkownik może wybrać akceptację, edycję lub odrzucenie każdej wygenerowanej fiszki.
- Tylko zaakceptowane fiszki są zapisywane w bazie danych.

US-003
Tytuł: Manualne tworzenie fiszek
Opis: Jako użytkownik chcę mieć możliwość tworzenia fiszek manualnie, poprzez wprowadzenie treści dla przodu (do 200 znaków) i tyłu (do 500 znaków).
Kryteria akceptacji:
- Formularz umożliwia wprowadzenie treści zgodnie z ograniczeniami długości.
- Fiszka jest zapisywana w bazie danych po poprawnej walidacji danych.

US-004
Tytuł: Przeglądanie zapisanych fiszek
Opis: Jako użytkownik chcę przeglądać zapisane fiszki, korzystając z wyszukiwarki oraz paginacji, aby łatwo znaleźć potrzebne informacje.
Kryteria akceptacji:
- Lista fiszek jest wyświetlana z możliwością wyszukiwania.
- Wyniki są paginowane (np. 10 fiszek na stronę).
- Wyniki widoczne w ramach widoku listy "Moje fiszki".

US-005
Tytuł: Edycja fiszek
Opis: Jako użytkownik chcę edytować wcześniej zapisane fiszki, aby poprawić lub zmodyfikować ich treść.
Kryteria akceptacji:
- Użytkownik może wybrać fiszkę do edycji.
- System waliduje zmienione dane pod kątem limitów znaków.
- Zmiany są zapisywane i natychmiast widoczne po edycji.

US-006
Tytuł: Usuwanie fiszek
Opis: Jako użytkownik chcę usuwać fiszki, aby wyeliminować nieaktualne lub niepoprawne informacje.
Kryteria akceptacji:
- Użytkownik może usunąć fiszkę po potwierdzeniu operacji.
- Usunięte fiszki nie pojawiają się w liście zapisanych fiszek.

US-007
Tytuł: Zarządzanie kontem użytkownika
Opis: Jako użytkownik chcę mieć możliwość rejestracji, logowania, zmiany hasła oraz usunięcia konta, aby bezpiecznie zarządzać swoim profilem.
Kryteria akceptacji:
- Rejestracja odbywa się przy użyciu adresu email i hasła.
- System umożliwia logowanie oraz zmianę hasła.
- Użytkownik może usunąć konto po potwierdzeniu operacji.

US-008
Tytuł: Sesja nauki z algorytmem powtórek
Opis: Jako użytkownik chcę korzystać z dedykowanego widoku "Sesja nauki", który wykorzystuje zewnętrzny algorytm powtórek, aby efektywnie uczyć się treści z moich fiszek.
Kryteria akceptacji:
- Po zalogowaniu dostępna jest opcja "Sesja nauki".
- System wyświetla najpierw przód fiszki.
- Po kliknięciu system pokazuje tył fiszki.
- Użytkownik może ocenić stopień przyswojenia wiedzy z danej fiszki.
- Algorytm losowo wybiera kolejną fiszkę do pokazania.
- System zapisuje postępy nauki użytkownika.

## 6. Metryki sukcesu
- Co najmniej 75% wygenerowanych przez AI fiszek jest akceptowanych przez użytkownika.
- Użytkownicy korzystają z funkcji generowania AI w 75% przypadków tworzenia fiszek.
- Wszystkie funkcjonalności (generowanie, recenzja, manualne tworzenie, przeglądanie, edycja, usuwanie, zarządzanie kontem) działają poprawnie i są testowalne.
- System jest stabilny, niezawodny oraz intuicyjny dla użytkowników. 