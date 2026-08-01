# Architectural Report (M4) — 10xCardsAstro

Data: 1 sierpnia 2026. Ten raport syntetyzuje istniejące artefakty Modułu 4 i
wyraźnie rozróżnia stan wersjonowanego kodu od niezweryfikowanej infrastruktury.

## 1. Terytorium i przepływ zmiany

Aplikacja Astro/Supabase skupia ryzyko w flow nauki:
`/learn → LearningSession → GET/POST /api/learn/session → LearningService →
ReviewScheduler + Supabase`. Mapa terytorium pokazuje, że API, serwis, UI i E2E
często zmieniały się razem, a największe hotspoty to `LearningService`, endpoint
sesji oraz komponent orkiestrujący. Szczegóły: [Artifact 1](../map/artifact-1-territory.md)
i [repo map](../map/repo-map.md).

## 2. Granice i sprzężenia

Wersjonowany `dependency-cruiser 18.1.0` sprawdza 65 modułów/104 zależności bez
cyklu i bez bezpośrednich importów API ↔ React islands. W aktywnym podgrafie oba
endpointy importują schemat i `LearningService`, a serwis deleguje harmonogram
do czystego `ReviewScheduler`. Nie oznacza to, że UI nie jest sprzężone z API:
`LearningSession` używa runtime `fetch`, czego graf importów nie widzi. Astro
`learn.astro` także pozostaje dowodem źródłowym poza grafem TS/TSX. Pełny zapis
metody, outputu i ograniczeń: [Artifact 2](../map/artifact-2-structure.md).

## 3. Ranking zmian i bezpieczny pierwszy krok

Research wskazuje trzy realne kandydatury: przywrócenie RLS, due filtering przed
`limit(10)` oraz naliczanie postępu po zaakceptowanym ratingu. Pierwsza faza
celowo nie implementuje ich wszystkich: wydziela czysty `ReviewScheduler` jako
mały, odwracalny seam z testami characterization. Jest to ukończone lokalnie;
zmiany RLS, query i modelu presentation wymagają osobnych decyzji, fixtures oraz
migracji forward-only. Zob. [research i ranking](../changes/harden-learning-progress/research.md)
oraz [plan guard-first](../changes/harden-learning-progress/plan.md).

## 4. Model domenowy i granica infrastruktury

Rdzeń domeny to prawidłowe przedstawienie i ocenienie fiszki, nie samo pobranie
rekordu. Dokumenty DDD wskazują brak trwałego `CardPresentation`, rozjazd
`cards_reviewed` oraz konieczność agregatu `LearningSession`. Plan ACL zawęża
przyszły adapter do slice'u nauki, pozostawiając SDK Supabase w infrastrukturze
i mapując błędy providera na named results. To są plany architektoniczne, nie
twierdzenie, że agregat, ACL, transakcja albo RLS są już wdrożone:
[destylacja](../domain/01-domain-distillation.md),
[aggregate](../domain/02-invariant-aggregate-refactor.md) i
[ACL](../domain/03-anti-corruption-layer.md).

## Granice pewności i kolejne bramki

- Lokalnie: pełna suite ma 101/101 testów, lint nie ma błędów, `astro check`,
  build, dependency graph oraz fail-closed security gate są zielone. Po
  nie-wymuszonym `npm audit fix`, `npm audit --omit=dev` raportuje 0
  vulnerabilities; szczegóły w [ledgerze dowodów](architect.md).
- Niezweryfikowane: zdalne RLS/migracje, product decisions dla orderingu i
  `cards_reviewed`, publiczny hosting oraz immutable CI URL-e dla aktualnej
  rewizji.
- Zielony lokalny security gate wymaga jeszcze potwierdzenia na zdalnej rewizji
  remediation; historyczny czerwony run nie jest dowodem stanu bieżącego.

Wniosek: repo ma wystarczająco udokumentowaną mapę, ranking i bezpieczny seam
do review M4. Nie ma jeszcze podstaw, by deklarować produkcyjne bezpieczeństwo
lub zakończenie większych zmian domenowych.
