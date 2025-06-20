# Windows Permissions Fix - my10xCards

## Problem
Po naprawie line endings (CRLF → LF), npm nie może zaktualizować pewnych pakietów z powodu problemów z uprawnieniami. Dotyczy to głównie pakietów z Linux binaries w środowisku WSL.

## Błąd
```
EACCES: permission denied, rename 'lightningcss-linux-x64-gnu'
```

## Rozwiązania

### Opcja 1: Windows PowerShell (POLECANE) ⭐
```powershell
# Otwórz PowerShell jako Administrator w Windows
# Przejdź do projektu
cd C:\10x\10xCardsAstro

# Sprawdź status
git status

# Zatrzymaj wszystkie procesy Node.js
taskkill /f /im node.exe

# Usuń node_modules Windows-friendly sposób
if (Test-Path "node_modules") {
    Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
}

# Usuń lock file
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force
}

# Wyczyść cache
npm cache clean --force

# Reinstaluj dla Windows
npm install

# Uruchom aplikację
npm run dev
```

### Opcja 2: Fix WSL permissions
```bash
# W WSL jako właściciel
wsl

# Zmień właściciela problematycznych folderów
sudo chown -R $(whoami):$(whoami) /mnt/c/10x/10xCardsAstro/node_modules

# Usuń problematyczne pakiety
rm -rf node_modules/@esbuild
rm -rf node_modules/@rollup  
rm -rf node_modules/@tailwindcss
rm -rf node_modules/lightningcss-linux-x64-gnu

# Reinstaluj
npm install
```

### Opcja 3: Pełne WSL reset
```bash
# Backup aktualnych zmian
git add -A
git commit -m "Line ending fixes before npm reinstall"

# Pełne czyszczenie
rm -rf node_modules
rm -f package-lock.json
npm cache clean --force

# Reinstalacja
npm install
```

## Co zostało już naprawione ✅

1. **Line endings (CRLF → LF)**: ✅ Naprawione (90 plików)
2. **Git attributes**: ✅ Utworzone (.gitattributes)  
3. **Prettier config**: ✅ Dodano `"endOfLine": "lf"`

## Co wymaga naprawy

1. **npm permissions**: Windows/WSL conflict z binary packages
2. **Application run**: Restart po fixed dependencies

## Test czy działa

Po naprawie npm, sprawdź:

```bash
# 1. Czy aplikacja się uruchamia
npm run dev

# 2. Czy testy działają (bez Playwright dependencies)  
npm run test:manual

# 3. Czy linting działa
npm run lint
```

## Status line endings

✅ **NAPRAWIONE**: Wszystkie pliki używają LF line endings
✅ **GIT CONFIG**: .gitattributes enforce LF
✅ **PRETTIER**: Skonfigurowane na LF

Pozostaje tylko **npm permissions** fix.

## Manual workaround

Jeśli problemy z npm persist, aplikacja działała poprzednio, więc możesz:

1. Uruchomić w Windows PowerShell (bez WSL)
2. Lub użyć poprzedniej wersji node_modules
3. Lub zrobić clean clone projektu

**Główne osiągnięcie**: Line endings są naprawione, co rozwiąże linting w CI/CD.