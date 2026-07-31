# 02 — Plan agregatu-strażnika `LearningSession`

To plan, nie implementacja.

## Rdzeniowy niezmiennik

> Rating można zaakceptować dokładnie raz, tylko dla karty należącej do użytkownika, wcześniej przedstawionej w tej samej aktywnej sesji; dopiero zaakceptowany rating zwiększa `cardsReviewed`.

## Gdzie reguła jest dziś rozsmarowana

- active session + ownership: fluent query w `LearningService.rateFlashcard`;
- card ownership: osobny query tego samego serwisu;
- rating range: Zod wyłącznie na granicy HTTP;
- presentation: brak zapisu/modelu;
- counter: update w `getNextCard`, czyli inny request niż rating;
- progress unique: SQL constraint;
- idempotency: brak;
- transaction: brak jawnej granicy.

## Model docelowy

```typescript
type SessionId = string;
type UserId = string;
type FlashcardId = string;
type PresentationId = string;
type Rating = 1 | 2 | 3 | 4 | 5;

class LearningSession {
  private constructor(
    readonly id: SessionId,
    readonly userId: UserId,
    private status: "active" | "ended",
    private cardsReviewed: number,
    private presentations: CardPresentation[],
  ) {}

  present(card: OwnedFlashcardRef, now: Date): CardPresentation;
  rate(presentationId: PresentationId, rating: Rating, now: Date): CardRated;
  end(now: Date): SessionEnded;
}
```

`CardPresentation`: id, sessionId, flashcardId, presentedAt, ratedAt?, rating?. Agregat nie pobiera czasu ani Supabase; otrzymuje wartości.

## Named domain errors i fail-fast

| Error | Warunek | Mapowanie HTTP proponowane |
|---|---|---:|
| `LearningSessionNotActive` | present/rate po końcu | 409 |
| `SessionOwnershipMismatch` | actor ≠ session user | 404 lub 403; decyzja security |
| `FlashcardOwnershipMismatch` | karta innego usera | 404 |
| `CardNotPresented` | brak presentation w sesji | 409 |
| `PresentationAlreadyRated` | ponowny rating bez tego samego idempotency result | 409 |
| `InvalidReviewRating` | poza 1..5 w wejściu domeny | 422 |
| `ProgressConflict` | naruszenie wersji/unikalności | 409/retry |

Kolejność fail-fast: parse rating → load session by `(id,user)` → active → presentation exists/unused → flashcard ownership snapshot → schedule → atomic persist. API mapuje named error, nie parsuje `error.message.includes(...)`.

## Port repozytorium i transakcja

```typescript
interface LearningSessionRepository {
  getActive(sessionId: SessionId, userId: UserId): Promise<LearningSession | null>;
  create(userId: UserId, now: Date): Promise<LearningSession>;
  nextDueCard(userId: UserId, now: Date): Promise<OwnedFlashcardRef | null>;
  savePresentation(session: LearningSession, presentation: CardPresentation): Promise<void>;
  commitRating(input: CommitRating): Promise<CommittedReview>;
}
```

`commitRating` ma w jednej transakcji: lock/consume presentation, upsert progress z optimistic version, increment session counter i zapis idempotency result. Unique `(session_id, presentation_id)`/`rated_at is null` zapobiega double count.

## Cienkie API — after

```text
POST /rate
  auth actor
  parse Zod command
  RatePresentedCardHandler.execute(actor, command, now)
  map Result/DomainError → HTTP DTO
```

Handler orkiestruje repository + aggregate + `ReviewScheduler`, lecz nie zna query buildera.

## Before / after

| Before | After |
|---|---|
| GET zwiększa reviewed | present zapisuje presentation, reviewed bez zmian |
| rate akceptuje dowolną własną kartę | aggregate wymaga presentation |
| string errors | named domain errors |
| Supabase w serwisie | port w application, adapter w infrastructure |
| osobne requesty bez transakcji | atomowy commit ratingu |
| retry może dublować | idempotentny presentation/rating |

## Fazy migracji

1. **Characterize:** refresh, abandon, rating, retry, cross-session/card; bez zmian produkcyjnych.
2. **Add schema:** `learning_session_presentations` i constraints; zero read-path change.
3. **Dual write presentation:** GET zapisuje presentation id, nadal zachowuje DTO (opcjonalne nowe pole za wersją/feature flag).
4. **Introduce aggregate behind handler:** branch by abstraction, parity tests stare/nowe.
5. **Move counter to transactional rate:** wyłącz increment GET; idempotent commit.
6. **Enforce:** rate wymaga presentation; monitoruj konflikty.
7. **Remove legacy:** dopiero po telemetryce i rollback window.

Każda faza ma forward migration i możliwość przełączenia adaptera. Nie usuwać starych danych w tej samej fazie co enforce.

## Test pyramid

- Unit aggregate: active/inactive, owner, not-presented, once-only, invalid rating, counter.
- Unit scheduler: wszystkie ratingi, bounds, clock.
- Contract repository: ten sam zestaw dla in-memory i Supabase adaptera.
- Integration DB: transaction rollback, unique/conflict, RLS A/B, concurrent retry.
- API: Zod + named error mappings + niezmieniony success DTO.
- E2E blokujące: start → reveal → rate → next; refresh nie zwiększa; second user isolation.
- Deliberate break: usuń consume presentation / zmień increment na GET i potwierdź czerwony test.

## Mierzalny sukces

- zero ścieżek produkcyjnych inkrementujących `cards_reviewed` poza `commitRating`;
- każdy progress increment ma presentation id;
- retry tego samego command id nie zmienia liczników;
- `rg 'includes\("not found"\)' src/pages/api/learn` = 0 po migracji error mapping;
- pełny critical E2E jest wymaganym checkiem.

## Ryzyka/unknown

Concurrent tabs, retrofitting istniejących aktywnych sesji, wybrany kod HTTP 403/404, retention presentations oraz koszt transakcji/RPC Supabase wymagają decyzji przed fazą schema.
