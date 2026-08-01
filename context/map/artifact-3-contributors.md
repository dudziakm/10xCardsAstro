# Artefakt 3: kontrybutorzy i linia wsparcia

## Metoda

Analiza `git log --all --format='%an%x09%ae'`, tematyczne `git log -- <path>` oraz `git blame` dla `LearningService`. Dependabot został odfiltrowany. `Claude Code` oznaczono jako autora-automatyzację: jego historia jest dowodem pochodzenia zmian, ale nie kontaktem ani właścicielem domeny.

## Obraz autorstwa

| Tożsamość | Commity w całym repo | Klasyfikacja |
|---|---:|---|
| Claude Code | 81 | automatyzacja; wykluczona z kontaktów |
| Michal Dudziak (2 adresy) | 30 | jedyny człowiek w historii |
| dependabot[bot] | 8 | bot; wykluczony |

Wszystkie aktualne linie `LearningService` przed refaktorem pochodziły z commitów `Claude Code` (`c548159`, `1608ac1`, `2d863a3`, `7d6de22`). Michal Dudziak jest jedyną osobą, która może potwierdzić intencję biznesową, ale nie należy z samej historii wnioskować, że ręcznie zaprojektował algorytm.

## Pięć obszarów wrażliwych

| Obszar | Dowód historyczny | Pierwszy kontakt | Pytanie eskalacyjne |
|---|---|---|---|
| Semantyka sesji i ratingu | 6 zmian serwisu, 13 endpointu GET | Michal Dudziak | Czy `cards_reviewed` oznacza przedstawione czy ocenione karty? |
| Algorytm wyboru | implementacja w `048459a`, poprawka constraints `2248317` | Michal Dudziak | Losowanie z PRD czy deterministyczny „najbardziej due”? |
| RLS i model danych | migracje: 3 commity Claude, 2 Michal | Michal Dudziak | Czy wyłączenie RLS było tylko lokalnym workaroundem? |
| E2E/CI | 15 zmian testu nauki; wielokrotne fixy CI | Michal Dudziak | Który scenariusz jest krytyczną bramką merge? |
| Stack/deploy | ręczne aktualizacje #13/#19, liczne historyczne fixy Vercel | Michal Dudziak | Aktualny target: Node adapter czy wcześniejszy hosting? |

## Tematyczna aktywność feature'u

Po odfiltrowaniu botów wszystkie commity w `src/lib/services/learning.service.ts`, endpointach nauki, komponentach nauki i `e2e/05-learning-session.spec.ts` są zapisane jako `Claude Code`. To sygnał wysokiego ryzyka „AI-generated legacy”: dokument planistyczny i kod mogą powtarzać te same założenia zamiast niezależnie się potwierdzać.

## Reguła użycia

- Historia służy do wskazania kogo zapytać i gdzie pojawiły się korekty.
- Nie służy do rankingu ludzi ani przypisania własności kodu.
- Brak drugiego człowieka oznacza, że decyzje domenowe wymagają potwierdzenia przez właściciela produktu lub zachowania jawnego `unknown`.
