# Tech Stack projektu my10xCards

## Frontend
### Astro 5 z React
- **Astro 5**: Framework pozwalający na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
  - Optymalny dla stron statycznych i hybrydowych
  - Islands Architecture - interaktywność tylko tam, gdzie potrzebna
  - Wbudowane mechanizmy optymalizacji wydajności
  - Zero JavaScript domyślnie dla stron statycznych

- **React 19**: Biblioteka do tworzenia komponentów interaktywnych
  - Wykorzystana dla elementów wymagających interaktywności
  - Kompatybilność z wyspami Astro (Astro Islands)
  - Możliwość wykorzystania bogatego ekosystemu komponentów React

### TypeScript 5
- Statyczne typowanie zapewniające bezpieczeństwo typów
- Lepsza dokumentacja kodu poprzez interfejsy i typy
- Wsparcie dla nowoczesnych funkcji ECMAScript
- Lepsze wsparcie w IDE, podpowiedzi i wykrywanie błędów podczas pisania kodu

### Tailwind 4
- Utility-first CSS framework
- Szybkie prototypowanie interfejsu
- Modyfikowalny system projektowania
- Optymalizacja rozmiaru CSS poprzez usuwanie nieużywanych klas (PurgeCSS)
- JIT (Just-In-Time) compiler dla lepszej wydajności

### Shadcn/ui
- Biblioteka dostępnych, estetycznych komponentów React
- Zbudowana na bazie Radix UI zapewniająca dostępność WCAG
- Łatwa konfiguracja i kastomizacja
- Dobrze komponuje się z Tailwind CSS
- Oparta na systemie wariantów, co ułatwia spójne projektowanie

## Backend
### Supabase jako Backend-as-a-Service
- **Baza danych PostgreSQL**:
  - Zaawansowana, relacyjna baza danych
  - Możliwość tworzenia złożonych zapytań
  - Wsparcie dla typów JSON i indeksów pełnotekstowych
  - Rozszerzenia PostgreSQL dla zaawansowanych funkcjonalności

- **Autentykacja**:
  - Gotowe rozwiązanie do logowania i rejestracji użytkowników
  - Wsparcie dla logowania przez email/hasło
  - JWT (JSON Web Tokens) do autoryzacji
  - Row Level Security (RLS) dla kontroli dostępu na poziomie wierszy

- **Supabase SDK**:
  - Klienty dostępne w wielu językach programowania
  - Typowane API dla TypeScript
  - Reaktywne subskrypcje danych w czasie rzeczywistym
  - Ułatwiony dostęp do bazy danych z poziomu frontendu

## AI
### OpenRouter.ai
- Agregator API dla wielu dostawców modeli AI:
  - OpenAI (GPT-4, GPT-3.5)
  - Anthropic (Claude)
  - Google (Gemini)
  - i inne
- Elastyczne przełączanie między modelami
- Mechanizmy ustawiania limitów wydatków na API
- Jednolite API dla różnych modeli
- Mechanizmy cachowania identycznych zapytań
- Zarządzanie kosztami generowania treści

## CI/CD i Hosting
### GitHub Actions
- Automatyczne budowanie i testowanie aplikacji
- Zarządzanie procesem deploymentu
- Integracja z testami jednostkowymi i e2e
- Możliwość tworzenia niestandardowych workflowów

### DigitalOcean
- Hosting aplikacji za pośrednictwem obrazów Docker
- Droplets zapewniające stabilny i skalowalny hosting
- Managed Databases dla ewentualnego hostowania własnego Supabase
- Spaces dla przechowywania plików statycznych
- Load balancing dla większego obciążenia

### Docker
- Konteneryzacja aplikacji zapewniająca spójne środowisko
- Łatwe wdrażanie na różnych środowiskach
- Izolacja zależności
- Optymalizacja zasobów serwerowych

## Architektura systemu
```
+---------------------------+
|         Frontend          |
|    (Astro + React)        |
+---------------------------+
           |
           v
+---------------------------+
|         Supabase          |
| (Autentykacja + Baza)     |
+---------------------------+
           |
           v
+---------------------------+
|      OpenRouter.ai        |
| (Generowanie fiszek AI)   |
+---------------------------+
```

## Uzasadnienie wyboru technologii
- **Wydajność**: Astro zapewnia szybkie ładowanie stron, a React dodaje interaktywność tylko gdzie potrzeba
- **Skalowalność**: PostgreSQL i DigitalOcean umożliwiają skalowanie w miarę wzrostu liczby użytkowników
- **Szybkość developmentu**: Gotowe komponenty Shadcn/ui i Tailwind CSS przyspieszają tworzenie interfejsu
- **Bezpieczeństwo**: Supabase oferuje wbudowane mechanizmy autentykacji i autoryzacji
- **Elastyczność AI**: OpenRouter.ai pozwala na testowanie różnych modeli i optymalizację kosztów
- **Niezawodność**: Konteneryzacja poprzez Docker i hosting na DigitalOcean zapewniają stabilność działania
