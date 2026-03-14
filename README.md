# MnemoDeck

Aplikacja mobilna do nauki systemu mnemonicznego (liczba ↔ słowo) dla liczb 0–100.

## Stack

- **Expo SDK 54** (managed workflow)
- **React Native 0.81** + **TypeScript**
- **React Navigation** — bottom tabs
- **AsyncStorage** — persystencja statystyk, poziomu i talii kart
- **Jest** + **React Native Testing Library** — testy jednostkowe

## Uruchomienie (development)

```bash
npm install --legacy-peer-deps
npx expo start --clear
```

Zeskanuj QR kod w aplikacji **Expo Go** (iOS/Android). Telefon i komputer muszą być w tej samej sieci Wi-Fi.

> Wymaga Expo Go w wersji SDK 54. Jeśli masz starszą wersję — zaktualizuj aplikację w App Store / Google Play.

## Mechanika gry

### Flow sesji
1. **Faza A** — liczba → słowo: ~11 sesji × 10 kart = wszystkie 101 kart
2. **Faza B** — słowo → liczba: ~11 sesji × 10 kart = wszystkie 101 kart
3. Po ukończeniu Fazy B → **awans na następny poziom**, reset do Fazy A

### Poziomy czasowe
| Poziom | Limit czasu |
|--------|-------------|
| 1      | 5s          |
| 2      | 4s          |
| 3      | 3s          |
| 4      | 2s          |
| 5      | 1s          |
| 6      | 0.5s        |

Limit mierzony od pokazania karty do kliknięcia **"Odkryj"**. Po upływie czasu karta traktowana jako "Nie wiem".

### Kolejka
Karta oznaczona "Nie wiem" wraca na koniec kolejki bieżącej sesji — pojawi się ponownie w tej samej sesji.

## Struktura projektu

```
src/
├── screens/
│   ├── HomeScreen.tsx      # ekran startowy (poziom, faza, przycisk Start)
│   ├── SessionScreen.tsx   # sesja gry (jedna runda A lub B)
│   └── StatsScreen.tsx     # statystyki + reset
├── components/
│   ├── Card.tsx            # karta z mechaniką odkrywania
│   ├── Timer.tsx           # odliczanie z paskiem postępu
│   └── AppButton.tsx       # przycisk (primary / secondary)
├── data/
│   └── cards.ts            # 101 kart (0–100) zakodowanych w TS
├── context/
│   └── StatsContext.tsx    # statystyki z persystencją AsyncStorage
├── utils/
│   ├── shuffle.ts          # Fisher-Yates shuffle
│   └── stats.ts            # obliczanie średnich czasów
└── types/
    └── index.ts            # CardData, CardStats, RoundType, StatsState
```

## AsyncStorage — klucze

| Klucz           | Zawartość                                      |
|-----------------|------------------------------------------------|
| `@mnemo_stats`  | statystyki per karta (czasy A/B, nie wiem)     |
| `@mnemo_level`  | aktualny poziom (0–5)                          |
| `@mnemo_phase`  | aktualna faza (`"A"` lub `"B"`)               |
| `@mnemo_deck`   | pozostałe numery kart w bieżącej fazie (JSON) |

## Statystyki

- **Średni czas A** — średni czas reakcji w rundzie liczba→słowo
- **Średni czas B** — średni czas reakcji w rundzie słowo→liczba
- **Nie znam** — liczba oznaczonych "Nie wiem" per karta

Dane dostępne w zakładce **Statystyki**. Można je wyczyścić lub zresetować poziom przyciskami na dole ekranu.

## Testy

```bash
npm test
```

Testy jednostkowe dla `shuffle` i `stats` w katalogu `__tests__/`.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) uruchamia przy każdym push/PR:
- `npm run lint` — ESLint
- `npm run format:check` — Prettier
- `npm test` — Jest

## Instalacja na iOS (bez serwera dev)

### Z kontem Apple Developer ($99/rok)
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios --profile preview
```

### Bez konta — AltStore (darmowe, wygasa co 7 dni)
1. Zainstaluj [AltStore](https://altstore.io) na Macu i iPhonie
2. Zbuduj `.ipa` przez EAS: `eas build --platform ios --profile preview`
3. Zainstaluj `.ipa` przez AltStore

## Dane kart

Karty zakodowane w `src/data/cards.ts` (101 pozycji, numery 0–100).
Oryginalny plik `mnemo-deck.csv` jest w `.gitignore` — nie jest commitowany.
