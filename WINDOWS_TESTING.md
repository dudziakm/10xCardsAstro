# Windows Testing Setup - my10xCards

## Problem
Projekt był rozwijany w WSL (Linux), ale próbujesz uruchomić testy w Windows PowerShell. Node_modules są zainstalowane tylko w WSL.

## Rozwiązania

### Opcja 1: Uruchom w WSL (POLECANE) ⭐
```bash
# Otwórz WSL terminal
wsl

# Przejdź do projektu 
cd /mnt/c/10x/10xCardsAstro

# Sprawdź czy serwer działa
npm run dev

# W nowym terminalu WSL uruchom testy
npm run test:e2e
```

### Opcja 2: Skonfiguruj Windows Environment
```powershell
# 1. Sprawdź Node.js w Windows
node --version
npm --version

# 2. Usuń Linux node_modules
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# 3. Reinstaluj dla Windows
npm install

# 4. Zainstaluj Playwright dla Windows
npx playwright install

# 5. Uruchom testy
npm run test:e2e
```

### Opcja 3: Dual Environment Setup
```powershell
# Zachowaj oba środowiska
# Skopiuj projekt do osobnego folderu Windows
xcopy C:\10x\10xCardsAstro C:\10x\10xCardsAstro-windows /E /H /C /I

# Przejdź do kopii
cd C:\10x\10xCardsAstro-windows

# Usuń Linux artifacts
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Zainstaluj dla Windows
npm install
npx playwright install
```

## Testowanie Windows vs WSL

### Windows PowerShell:
```powershell
# Sprawdź instalację
npx playwright --version

# Uruchom testy
npm run test:e2e

# Debug testy
npm run test:e2e:headed
```

### WSL (Linux):
```bash
# Sprawdź instalację  
npx playwright --version

# Uruchom testy
npm run test:e2e

# Debug testy (może wymagać X11)
npm run test:e2e:headed
```

## Różnice Windows vs WSL

| Aspekt | Windows | WSL |
|--------|---------|-----|
| Przeglądarki | Native Windows | Linux binaries |
| Wydajność | Szybsze | Wolniejsze (emulacja) |
| GUI | Pełne wsparcie | Wymaga X11 dla UI |
| Ścieżki | `C:\` | `/mnt/c/` |
| npm/node | Windows binaries | Linux binaries |

## Rozwiązywanie Problemów

### "playwright not recognized"
```powershell
# Sprawdź czy jest w PATH
$env:PATH -split ';' | Select-String node

# Alternatywnie uruchom bezpośrednio
.\node_modules\.bin\playwright test
```

### Problemy z instalacją przeglądarek
```powershell
# Windows może wymagać uprawnień administratora
# Uruchom PowerShell jako Administrator
npx playwright install
```

### Problemy z portami
```powershell
# Sprawdź czy port 3001 jest wolny
netstat -an | findstr :3001

# Jeśli zajęty, zmień port w playwright.config.ts
```

## Rekomendacje

1. **Dla developmentu**: Używaj WSL - lepsze środowisko Unix-like
2. **Dla testowania**: Windows może być szybsze dla GUI testów
3. **Dla CI/CD**: Stick to one environment (zalecane Linux)
4. **Dla teamów**: Ustal jeden standard (WSL lub Windows)

## Szybki Test

### Sprawdź czy wszystko działa:
```powershell
# 1. Node.js
node --version

# 2. NPM packages (jeśli zainstalowane)
npm list @playwright/test

# 3. Aplikacja
npm run dev

# 4. Manual Tests (w nowym terminalu) - DZIAŁA ZAWSZE
npm run test:manual

# 5. Playwright Tests (wymaga instalacji)
npm run test:e2e -- e2e/smoke.spec.ts
```

### ✅ Manual Tests - Alternatywa dla Playwright

Jeśli masz problemy z Playwright, użyj manual tests:

```powershell
# Uruchom serwer
npm run dev

# W nowym terminalu uruchom manual tests
npm run test:manual
```

**Manual tests sprawdzają:**
- ✅ Homepage loading
- ✅ All page navigation  
- ✅ API endpoints functionality
- ✅ Form validation
- ✅ AI generation endpoint
- ✅ Learning session API

**Przykładowy wynik:**
```
🚀 Starting Manual E2E Tests

✅ Homepage loads correctly
✅ Flashcards page loads correctly  
✅ Generate page loads correctly
✅ Learn page loads correctly
✅ Flashcards API works (2 flashcards)
✅ Learning Session API works
✅ Form validation working
✅ AI Generation endpoint accessible

📊 Test Results:
✅ Passed: 8 ❌ Failed: 0 📈 Success Rate: 100%
🎉 All tests passed! Application is working correctly.
```

## Kontakt
Jeśli dalej masz problemy, sprawdź:
- Czy Node.js jest zainstalowany w Windows
- Czy npm jest w PATH
- Czy projekt ma wszystkie dependencies