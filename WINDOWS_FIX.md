# Windows Environment Fix

## Problem

Node_modules zawiera mieszankę Linux (WSL) i Windows binaries, co powoduje błędy EACCES i ENOTEMPTY.

## Rozwiązanie

### Opcja 1: Kompletne czyszczenie (POLECANE)

```powershell
# W PowerShell jako Administrator
# 1. Zatrzymaj wszystkie procesy Node.js
taskkill /f /im node.exe

# 2. Usuń node_modules w sposób Windows-friendly
if (Test-Path "node_modules") {
    Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
}

# 3. Usuń package-lock.json
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force
}

# 4. Wyczyść npm cache
npm cache clean --force

# 5. Reinstaluj dla Windows
npm install --platform=win32 --arch=x64

# 6. Sprawdź czy działa
npm run dev
```

### Opcja 2: Użyj WSL (PROSTSZE)

```bash
# W WSL terminal
cd /mnt/c/10x/10xCardsAstro
npm run dev
```

## Weryfikacja

```powershell
# Sprawdź czy komendy działają
node --version
npm --version
npm run test:manual
```
