# MnemoDeck

A mobile app for learning the mnemonic system (number ↔ word) for numbers 0–100.

## Stack

- **Expo SDK 54** (managed workflow)
- **React Native 0.81** + **TypeScript**
- **React Navigation** — bottom tabs
- **AsyncStorage** — persistence for stats, level, and card deck
- **Jest** + **React Native Testing Library** — unit tests

## Running (development)

```bash
npm install --legacy-peer-deps
npx expo start --clear
```

Scan the QR code with the **Expo Go** app (iOS/Android). Your phone and computer must be on the same Wi-Fi network.

> Requires Expo Go with SDK 54. If you have an older version, update the app from the App Store / Google Play.

## Game Mechanics

### Session Flow
1. **Phase A** — number → word: ~11 sessions × 10 cards = all 101 cards
2. **Phase B** — word → number: ~11 sessions × 10 cards = all 101 cards
3. After completing Phase B → **advance to the next level**, reset to Phase A

### Time Levels
| Level | Time Limit |
|-------|------------|
| 1     | 5s         |
| 2     | 4s         |
| 3     | 3s         |
| 4     | 2s         |
| 5     | 1s         |
| 6     | 0.5s       |

The timer starts when the card is shown and stops when you tap **"Reveal"**. If time runs out, the card is marked as "Don't know".

### Queue
A card marked "Don't know" goes back to the end of the current session queue — it will appear again in the same session.

## Project Structure

```
src/
├── screens/
│   ├── HomeScreen.tsx      # home screen (level, phase, Start button)
│   ├── SessionScreen.tsx   # game session (one round A or B)
│   └── StatsScreen.tsx     # statistics + reset
├── components/
│   ├── Card.tsx            # card with reveal mechanic
│   ├── Timer.tsx           # countdown with progress bar
│   └── AppButton.tsx       # button (primary / secondary)
├── data/
│   └── cards.ts            # 101 cards (0–100) encoded in TS
├── context/
│   └── StatsContext.tsx    # stats with AsyncStorage persistence
├── utils/
│   ├── shuffle.ts          # Fisher-Yates shuffle
│   └── stats.ts            # average time calculations
└── types/
    └── index.ts            # CardData, CardStats, RoundType, StatsState
```

## AsyncStorage Keys

| Key             | Content                                          |
|-----------------|--------------------------------------------------|
| `@mnemo_stats`  | per-card statistics (A/B times, don't know count)|
| `@mnemo_level`  | current level (0–5)                              |
| `@mnemo_phase`  | current phase (`"A"` or `"B"`)                  |
| `@mnemo_deck`   | remaining card numbers in current phase (JSON)   |

## Statistics

- **Avg Time A** — average reaction time in the number→word round
- **Avg Time B** — average reaction time in the word→number round
- **Don't Know** — number of "Don't know" marks per card

Data is available in the **Statistics** tab. You can clear it or reset the level using the buttons at the bottom of the screen.

## Tests

```bash
npm test
```

Unit tests for `shuffle` and `stats` are in the `__tests__/` directory.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on every push/PR:
- `npm run lint` — ESLint
- `npm run format:check` — Prettier
- `npm test` — Jest

## Installing on iOS (without a dev server)

### With an Apple Developer account ($99/year)
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios --profile preview
```

### Without an account — AltStore (free, expires every 7 days)
1. Install [AltStore](https://altstore.io) on your Mac and iPhone
2. Build the `.ipa` via EAS: `eas build --platform ios --profile preview`
3. Install the `.ipa` through AltStore

## Card Data

Cards are encoded in `src/data/cards.ts` (101 entries, numbers 0–100).
Each entry follows the `CardData` interface:

```ts
interface CardData {
  number: number; // 0–100
  word: string;   // mnemonic word associated with the number
}
```

Example entries:

```ts
{ number: 0, word: 'zoo' },
{ number: 1, word: 'dół' },
{ number: 2, word: 'noe' },
```

To customize the deck, edit the `cards` array in `src/data/cards.ts`.
The original `mnemo-deck.csv` file is in `.gitignore` and is not committed.
