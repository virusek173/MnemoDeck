import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ViewStyle, TextStyle } from 'react-native';
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
}

interface SessionScreenProps {
  currentLevel: number;
  roundType: RoundType;
  sessionCards: CardData[];
  onFinish: () => void;
}

export function SessionScreen({ currentLevel, roundType, sessionCards, onFinish }: SessionScreenProps) {
  const { recordTime, recordDontKnow } = useStats();
  const limitSeconds = TIME_LEVELS[Math.min(currentLevel, TIME_LEVELS.length - 1)];

  const [queue, setQueue] = useState<CardData[]>(() => shuffle(sessionCards));
  const [phase, setPhase] = useState<Phase>('question');
  const [results, setResults] = useState<SessionResult[]>([]);
  const [timerRunning, setTimerRunning] = useState(true);
  const [timerKey, setTimerKey] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  const currentCard = queue[0];

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [queue]);

  const handleReveal = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    if (currentCard) {
      recordTime(currentCard.number, elapsed, roundType);
    }
    setTimerRunning(false);
    setPhase('revealed');
  }, [currentCard, recordTime, roundType]);

  const handleTimerExpire = useCallback(() => {
    if (phase !== 'question') return;
    if (currentCard) {
      recordTime(currentCard.number, limitSeconds * 1000, roundType);
      recordDontKnow(currentCard.number);
    }
    setResults((prev) => [
      ...prev,
      { cardNumber: currentCard!.number, word: currentCard!.word, knew: false },
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
    setResults((prev) => [...prev, { cardNumber: currentCard.number, word: currentCard.word, knew: true }]);
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
    setResults((prev) => [...prev, { cardNumber: currentCard.number, word: currentCard.word, knew: false }]);
    setQueue([...queue.slice(1), currentCard]);
    setPhase('question');
    setTimerRunning(true);
    setTimerKey((k) => k + 1);
    startTimeRef.current = Date.now();
  }

  if (phase === 'summary') {
    const lastResultPerCard = new Map<number, boolean>();
    results.forEach((r) => lastResultPerCard.set(r.cardNumber, r.knew));
    const knewCount = [...lastResultPerCard.values()].filter(Boolean).length;
    const dontKnowCards = sessionCards.filter((c) => lastResultPerCard.get(c.number) === false);

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.summaryContent}>
        <Text style={styles.summaryTitle}>Sesja zakończona!</Text>
        <Text style={styles.summaryStats}>
          Wiem: {knewCount} / {sessionCards.length}
        </Text>

        {dontKnowCards.length > 0 && (
          <>
            <Text style={styles.dontKnowHeader}>Nie wiedziałeś:</Text>
            <View style={styles.resultsList}>
              {dontKnowCards.map((card) => (
                <View key={card.number} style={styles.resultRow}>
                  <Text style={styles.resultNumber}>{card.number}</Text>
                  <Text style={styles.resultWord}>{card.word}</Text>
                  <Text style={styles.resultDontKnow}>✗</Text>
                </View>
              ))}
            </View>
          </>
        )}

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
    <View style={styles.container}>
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
    marginBottom: 8,
  } as TextStyle,
  summaryStats: {
    fontSize: 18,
    color: '#4a9eff',
    textAlign: 'center',
    marginBottom: 24,
  } as TextStyle,
  dontKnowHeader: {
    fontSize: 16,
    color: '#ff4a4a',
    fontWeight: '600',
    marginBottom: 8,
  } as TextStyle,
  resultsList: {
    marginBottom: 24,
  } as ViewStyle,
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 6,
  } as ViewStyle,
  resultNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    width: 48,
  } as TextStyle,
  resultWord: {
    fontSize: 16,
    color: '#ffffff',
    flex: 1,
  } as TextStyle,
  resultDontKnow: {
    fontSize: 20,
    color: '#ff4a4a',
    fontWeight: '700',
  } as TextStyle,
  finishButton: {
    alignItems: 'center',
  } as ViewStyle,
});
