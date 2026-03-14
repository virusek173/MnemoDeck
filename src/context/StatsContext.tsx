import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CardStats, StatsState, RoundType } from '../types';
import { computeAvgTime } from '../utils/stats';

const STORAGE_KEY = '@mnemo_stats';

interface StatsContextValue {
  stats: StatsState;
  recordTime: (cardNumber: number, ms: number, round: RoundType) => void;
  recordDontKnow: (cardNumber: number) => void;
  clearStats: () => void;
}

const defaultStats: StatsState = { cards: {} };

const StatsContext = createContext<StatsContextValue>({
  stats: defaultStats,
  recordTime: () => {},
  recordDontKnow: () => {},
  clearStats: () => {},
});

function getOrCreateCard(cards: Record<number, CardStats>, cardNumber: number): CardStats {
  if (cards[cardNumber]) return cards[cardNumber];
  return {
    cardNumber,
    avgTimeA: 0,
    avgTimeB: 0,
    dontKnowCount: 0,
    totalAttempts: 0,
    timesA: [],
    timesB: [],
  };
}

export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<StatsState>(defaultStats);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as StatsState;
          setStats(parsed);
        }
      })
      .catch(() => {});
  }, []);

  function persist(nextStats: StatsState) {
    setStats(nextStats);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextStats)).catch(() => {});
  }

  function recordTime(cardNumber: number, ms: number, round: RoundType) {
    setStats((prev) => {
      const card = getOrCreateCard(prev.cards, cardNumber);
      const timesA = round === 'A' ? [...card.timesA, ms] : card.timesA;
      const timesB = round === 'B' ? [...card.timesB, ms] : card.timesB;
      const updated: CardStats = {
        ...card,
        timesA,
        timesB,
        totalAttempts: card.totalAttempts + 1,
        avgTimeA: computeAvgTime(timesA),
        avgTimeB: computeAvgTime(timesB),
      };
      const nextStats: StatsState = {
        cards: { ...prev.cards, [cardNumber]: updated },
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextStats)).catch(() => {});
      return nextStats;
    });
  }

  function recordDontKnow(cardNumber: number) {
    setStats((prev) => {
      const card = getOrCreateCard(prev.cards, cardNumber);
      const updated: CardStats = {
        ...card,
        dontKnowCount: card.dontKnowCount + 1,
      };
      const nextStats: StatsState = {
        cards: { ...prev.cards, [cardNumber]: updated },
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextStats)).catch(() => {});
      return nextStats;
    });
  }

  function clearStats() {
    persist(defaultStats);
  }

  return (
    <StatsContext.Provider value={{ stats, recordTime, recordDontKnow, clearStats }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats(): StatsContextValue {
  return useContext(StatsContext);
}
