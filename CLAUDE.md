# CLAUDE.md — MnemoDeck

React Native / Expo app for learning a mnemonic system (number ↔ word) for numbers 0–100.

## Commands

```bash
npm start               # Start Expo dev server
npm run ios             # Run on iOS simulator
npm run android         # Run on Android emulator
npm test                # Run Jest tests (no watch)
npm run lint            # ESLint (.ts, .tsx)
npm run format:check    # Prettier check
npx prettier --write "**/*.{ts,tsx,js,json}"  # Auto-format
```

## Architecture

```
App.tsx                         # Root: navigation, game state, AsyncStorage
src/
├── screens/
│   ├── HomeScreen.tsx          # Level, phase, Start button
│   ├── SessionScreen.tsx       # Game session (10 cards per round)
│   └── StatsScreen.tsx         # Per-card stats + reset buttons
├── components/
│   ├── Card.tsx                # Question/answer reveal mechanic
│   ├── Timer.tsx               # Countdown with progress bar
│   └── AppButton.tsx           # primary / secondary variants
├── context/
│   └── StatsContext.tsx        # Global stats — React Context + AsyncStorage
├── data/
│   └── cards.ts                # 101 cards { number, word }, numbers 0–100
├── utils/
│   ├── shuffle.ts              # Fisher-Yates shuffle
│   └── stats.ts                # computeAvgTime, getWorstCards, getDontKnowCards
└── types/
    └── index.ts                # CardData, CardStats, RoundType, StatsState
__tests__/
├── shuffle.test.ts
└── stats.test.ts
```

## Key Types

```ts
type RoundType = 'A' | 'B';  // A: number→word, B: word→number

interface CardData {
  number: number;  // 0–100
  word: string;
}

interface CardStats {
  cardNumber: number;
  avgTimeA: number;     // average time: number → word
  avgTimeB: number;     // average time: word → number
  dontKnowCount: number;
  totalAttempts: number;
  timesA: number[];
  timesB: number[];
}

interface StatsState {
  cards: Record<number, CardStats>;
}
```

## Game Logic

- **Phase A**: number → word, ~11 sessions × 10 cards = all 101 cards
- **Phase B**: word → number, same flow
- Phase A done → Phase B; Phase B done → level up + reset to Phase A
- **Levels 1–6** with time limits: 5s / 4s / 3s / 2s / 1s / 0.5s
- Timer starts on card show, stops on "Reveal" tap; timeout = automatic "Don't know"
- "Don't know" card goes back to end of session queue

## AsyncStorage Keys

| Key            | Content                                    |
|----------------|--------------------------------------------|
| `@mnemo_level` | current level (0–5)                        |
| `@mnemo_phase` | current phase (`"A"` or `"B"`)             |
| `@mnemo_deck`  | remaining card numbers in phase (JSON)     |
| `@mnemo_stats` | full StatsState (JSON)                     |

## Code Style

- Prettier: single quotes, semi, trailing commas, print width 100, 2-space indent
- ESLint: `expo` preset, no overrides
- TypeScript strict mode; path alias `@/*` → `src/*`
- Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- All components are functional (hooks only)
