import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ViewStyle, TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shuffle } from '../utils/shuffle';
import { useStats } from '../context/StatsContext';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { Timer } from '../components/Timer';
import { CardData, RoundType } from '../types';

const TIME_LEVELS = [5, 4, 3, 2, 1, 0.5];

type Phase = 'question' | 'revealed' | 'summary';

interface SessionResult {
  cardNumber: number;
  word: string;
  knew: boolean;
  timeMs: number;
}

interface SessionScreenProps {
  currentLevel: number;
  roundType: RoundType;
  sessionCards: CardData[];
  onFinish: () => void;
}

export function SessionScreen({ currentLevel, roundType, sessionCards, onFinish }: SessionScreenProps) {
  const insets = useSafeAreaInsets();
  const { recordTime, recordDontKnow } = useStats();
  const limitSeconds = TIME_LEVELS[Math.min(currentLevel, TIME_LEVELS.length - 1)];

  const [queue, setQueue] = useState<CardData[]>(() => shuffle(sessionCards));
  const [phase, setPhase] = useState<Phase>('question');
  const [results, setResults] = useState<SessionResult[]>([]);
  const [timerRunning, setTimerRunning] = useState(true);
  const [timerKey, setTimerKey] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const lastElapsedRef = useRef<number>(0);

  const currentCard = queue[0];

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [queue]);

  const handleReveal = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    lastElapsedRef.current = elapsed;
    if (currentCard) {
      recordTime(currentCard.number, elapsed, roundType);
    }
    setTimerRunning(false);
    setPhase('revealed');
  }, [currentCard, recordTime, roundType]);

  const handleTimerExpire = useCallback(() => {
    if (phase !== 'question') return;
    const expiredMs = limitSeconds * 1000;
    if (currentCard) {
      recordTime(currentCard.number, expiredMs, roundType);
      recordDontKnow(currentCard.number);
    }
    setResults((prev) => [
      ...prev,
      { cardNumber: currentCard!.number, word: currentCard!.word, knew: false, timeMs: expiredMs },
    ]);
    setQueue((prev) => {
      const [head, ...rest] = prev;
      return [...rest, head];
    });
    setPhase('question');
    setTimerRunning(true);
    setTimerKey((k) => k + 1);
    startTimeRef.current = Date.now();
  }, [phase, currentCard, recordTime, recordDontKnow, limitSeconds, roundType]);

  function handleKnew() {
    if (!currentCard) return;
    setResults((prev) => [...prev, { cardNumber: currentCard.number, word: currentCard.word, knew: true, timeMs: lastElapsedRef.current }]);
    const newQueue = queue.slice(1);
    if (newQueue.length === 0) {
      setQueue([]);
      setPhase('summary');
    } else {
      setQueue(newQueue);
      setPhase('question');
      setTimerRunning(true);
      setTimerKey((k) => k + 1);
      startTimeRef.current = Date.now();
    }
  }

  function handleDontKnow() {
    if (!currentCard) return;
    recordDontKnow(currentCard.number);
    setResults((prev) => [...prev, { cardNumber: currentCard.number, word: currentCard.word, knew: false, timeMs: lastElapsedRef.current }]);
    setQueue([...queue.slice(1), currentCard]);
    setPhase('question');
    setTimerRunning(true);
    setTimerKey((k) => k + 1);
    startTimeRef.current = Date.now();
  }

  if (phase === 'summary') {
    // Ostatni wynik per karta
    const lastResultMap = new Map<number, SessionResult>();
    results.forEach((r) => lastResultMap.set(r.cardNumber, r));
    const lastResults = sessionCards.map((c) => lastResultMap.get(c.number)!).filter(Boolean);

    const knewCount = lastResults.filter((r) => r.knew).length;
    const totalMs = lastResults.reduce((sum, r) => sum + r.timeMs, 0);
    const avgMs = lastResults.length > 0 ? totalMs / lastResults.length : 0;

    return (
      <ScrollView style={styles.container} contentContainerStyle={[styles.summaryContent, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.summaryTitle}>Sesja zakończona!</Text>

        <View style={styles.overallStats}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{knewCount}/{sessionCards.length}</Text>
            <Text style={styles.statLabel}>Wiem</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{(avgMs / 1000).toFixed(2)}s</Text>
            <Text style={styles.statLabel}>Średni czas</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Karty</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.colNum, styles.tableHeaderText]}>#</Text>
          <Text style={[styles.colWord, styles.tableHeaderText]}>Słowo</Text>
          <Text style={[styles.colTime, styles.tableHeaderText]}>Czas</Text>
          <Text style={styles.colKnew} />
        </View>
        {lastResults.map((r) => (
          <View key={r.cardNumber} style={styles.resultRow}>
            <Text style={[styles.colNum, styles.cellText]}>{r.cardNumber}</Text>
            <Text style={[styles.colWord, styles.cellText]}>{r.word}</Text>
            <Text style={[styles.colTime, styles.cellText]}>{(r.timeMs / 1000).toFixed(2)}s</Text>
            <Text style={r.knew ? styles.knewMark : styles.dontKnowMark}>
              {r.knew ? '✓' : '✗'}
            </Text>
          </View>
        ))}

        <View style={styles.finishButton}>
          <AppButton label="Powrót do menu" onPress={onFinish} testID="finish-button" />
        </View>
      </ScrollView>
    );
  }

  if (!currentCard) return null;

  const isRoundA = roundType === 'A';
  const questionText = isRoundA ? String(currentCard.number) : currentCard.word;
  const answerText = isRoundA ? currentCard.word : String(currentCard.number);
  const roundLabel = isRoundA ? 'Liczba → Słowo' : 'Słowo → Liczba';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <Text style={styles.roundLabel}>{roundLabel}</Text>
        <Text style={styles.queueInfo}>Pozostało: {queue.length}</Text>
      </View>

      <Timer
        key={timerKey}
        limitSeconds={limitSeconds}
        running={timerRunning && phase === 'question'}
        onExpire={handleTimerExpire}
        testID="session-timer"
      />

      <View style={styles.cardContainer}>
        <Card
          title={questionText}
          subtitle={answerText}
          revealed={phase === 'revealed'}
          testID="session-card"
        />
      </View>

      <View style={styles.actions}>
        {phase === 'question' ? (
          <AppButton label="Odkryj" onPress={handleReveal} testID="reveal-button" />
        ) : (
          <View style={styles.answerButtons}>
            <AppButton
              label="Nie wiem"
              onPress={handleDontKnow}
              variant="secondary"
              testID="dont-know-button"
            />
            <View style={styles.buttonSpacer} />
            <AppButton label="Wiem" onPress={handleKnew} testID="knew-button" />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,
  roundLabel: {
    fontSize: 13,
    color: '#4a9eff',
    fontWeight: '600',
  } as TextStyle,
  queueInfo: {
    fontSize: 13,
    color: '#666666',
  } as TextStyle,
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 16,
  } as ViewStyle,
  actions: {
    paddingBottom: 20,
    alignItems: 'center',
  } as ViewStyle,
  answerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  buttonSpacer: {
    width: 16,
  } as ViewStyle,
  summaryContent: {
    padding: 24,
    paddingBottom: 48,
  } as ViewStyle,
  summaryTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  } as TextStyle,
  overallStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 28,
  } as ViewStyle,
  statBox: {
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flex: 1,
    marginHorizontal: 6,
  } as ViewStyle,
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4a9eff',
  } as TextStyle,
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  } as TextStyle,
  sectionHeader: {
    fontSize: 13,
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  } as TextStyle,
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 4,
    marginBottom: 4,
  } as ViewStyle,
  tableHeaderText: {
    fontSize: 11,
    color: '#555555',
    fontWeight: '600',
    textTransform: 'uppercase',
  } as TextStyle,
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
  } as ViewStyle,
  colNum: {
    width: 36,
  } as ViewStyle,
  colWord: {
    flex: 1,
  } as ViewStyle,
  colTime: {
    width: 56,
    textAlign: 'right',
  } as TextStyle,
  colKnew: {
    width: 24,
    textAlign: 'center',
  } as TextStyle,
  cellText: {
    fontSize: 15,
    color: '#ffffff',
  } as TextStyle,
  knewMark: {
    fontSize: 16,
    color: '#4aff7a',
    fontWeight: '700',
    width: 24,
    textAlign: 'center',
  } as TextStyle,
  dontKnowMark: {
    fontSize: 16,
    color: '#ff4a4a',
    fontWeight: '700',
    width: 24,
    textAlign: 'center',
  } as TextStyle,
  finishButton: {
    alignItems: 'center',
    marginTop: 24,
  } as ViewStyle,
});
