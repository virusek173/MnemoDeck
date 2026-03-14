# PRD: MnemoDeck — aplikacja do ćwiczenia systemu mnemonicznego

## Cel

Aplikacja mobilna (Expo React Native) do nauki skojarzeń liczba ↔ słowo z systemu mnemonicznego (100 kart).

## Ekran startowy

- **Tab navigation** (dolne zakładki): Gra / Statystyki
- Zakładka **Gra**: przycisk "Start" — rozpoczyna sesję
- Zakładka **Statystyki**: lista kart posortowana od najgorszego średniego czasu + osobna lista kart, których użytkownik nie znał

## Mechanika sesji

- Losowane **10 kart** na sesję
- **Runda A**: wyświetlana liczba → użytkownik klika "Odkryj" → widzi słowo → klika "Wiem" / "Nie wiem"
- **Runda B**: wyświetlane słowo → użytkownik klika "Odkryj" → widzi liczbę → klika "Wiem" / "Nie wiem"
- Kolejność kart w rundzie jest **losowa**
- Karta z odpowiedzią "Nie wiem" **wraca na koniec kolejki** danej rundy

## Poziomy czasowe

- Limit czasu = czas od pokazania karty do kliknięcia **"Odkryj"**
- Sekwencja: **5s → 4s → 3s → 2s → 1s → 0.5s**
- Poziom zaliczony gdy **wszystkie 100 kart** odpowiedziane poprawnie poniżej limitu (przerabiane po 10 na sesję)
- Po upływie czasu — traktowane jako "Nie wiem"

## Statystyki (persystentne — AsyncStorage)

- **Średni czas** do "Odkryj" per karta, posortowane od najgorszego
- **Lista kart "nie wiem"** — karty, które użytkownik oznaczył jako nieznane

## Wygląd

- Minimalistyczny, ciemny motyw
- Bez animacji — priorytet: szybkość i użyteczność

## Dane

- Dane wbudowane w kod jako tablica TypeScript (`src/data/cards.ts`)
- Oryginalny plik `mnemo-deck.csv` dodany do `.gitignore`

## Platformy

- iOS (priorytet) + Android via Expo

---

## Szczegóły techniczne

### Stack

- **Expo SDK 52** (managed workflow)
- **React Native** (najnowsza wersja kompatybilna z Expo SDK 52)
- **TypeScript**
- **React Navigation** (`@react-navigation/bottom-tabs`) — tab navigation
- **React Context** — zarządzanie stanem
- **AsyncStorage** (`@react-native-async-storage/async-storage`) — persystencja statystyk

### Struktura projektu

```
src/
├── screens/        # ekrany (HomeScreen, SessionScreen, StatsScreen)
├── components/     # komponenty UI (Card, Timer, Button)
├── data/           # cards.ts — wbudowane dane kart
├── context/        # StatsContext — kontekst statystyk
├── utils/          # helpery (shuffle, obliczanie statystyk)
└── types/          # typy TypeScript
```

### Testowanie

- **Jest** + **React Native Testing Library**
- Testy jednostkowe dla logiki (utils, context)
- Testy komponentów dla kluczowych ekranów

### Linting / Formatowanie

- **ESLint** — konfiguracja Expo + TypeScript
- **Prettier** — formatowanie kodu

### CI/CD

- **GitHub Actions** — pipeline:
  - Linting (`eslint`)
  - Formatowanie (`prettier --check`)
  - Testy (`jest`)

### Wymagania systemowe

- iOS 15+
- Android 5+ (Expo default)
