import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ViewStyle, TextStyle } from 'react-native';
import { cards as allCards } from '../data/cards';
import { shuffle } from '../utils/shuffle';
import { useStats } from '../context/StatsContext';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { Timer } from '../components/Timer';
import { CardData, RoundType } from '../types';

const TIME_LEVELS = [5, 4, 3, 2, 1, 0.5];
const SESSION_CARD_COUNT = 10;

type Phase = 'question' | 'revealed' | 'summary';

interface SessionResult {
  cardNumber: number;
  word: string;
  knew: boolean;
}

interface SessionScreenProps {
  currentLevel: number;
  onLevelUp: () => void;
  onFinish: () => void;
}

export function SessionScreen({ currentLevel, onLevelUp, onFinish }: SessionScreenProps) {
  const { recordTime, recordDontKnow } = useStats();
  const limitSeconds = TIME_LEVELS[Math.min(currentLevel, TIME_LEVELS.length - 1)];

  // Pick 10 random cards at start
  const [sessionCards] = useState<CardData[]>(() =>
    shuffle(allCards).slice(0, SESSION_CARD_COUNT),
  );

  const [roundType, setRoundType] = useState<RoundType>('A');
  const [queue, setQueue] = useState<CardData[]>(() => shuffle(allCards).slice(0, SESSION_CARD_COUNT));
  const [phase, setPhase] = useState<Phase>('question');
  const [results, setResults] = useState<SessionResult[]>([]);
  const [timerRunning, setTimerRunning] = useState(true);
  const [timerKey, setTimerKey] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const [allDone, setAllDone] = useState(false);

  // Current card from front of queue
  const currentCard = queue[0];

  // Initialize round B when round A finishes
  function startRoundB() {
    setRoundType('B');
    setQueue(shuffle(sessionCards));
    setPhase('question');
    setTimerRunning(true);
    setTimerKey((k) => k + 1);
    startTimeRef.current = Date.now();
  }

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [queue, roundType]);

  const handleReveal = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    if (currentCard) {
      recordTime(currentCard.number, elapsed);
    }
    setTimerRunning(false);
    setPhase('revealed');
  }, [currentCard, recordTime]);

  const handleTimerExpire = useCallback(() => {
    if (phase !== 'question') return;
    // Timer expired → treat as "Nie wiem"
    if (currentCard) {
      recordTime(currentCard.number, limitSeconds * 1000);
      recordDontKnow(currentCard.number);
    }
    setResults((prev) => [
      ...prev,
      { cardNumber: currentCard!.number, word: currentCard!.word, knew: false },
    ]);
    setQueue((prev) => {
      const [, ...rest] = prev;
      const next = [...rest, currentCard!];
      return next;
    });
    setPhase('question');
    setTimerRunning(true);
    setTimerKey((k) => k + 1);
    startTimeRef.current = Date.now();
  }, [phase, currentCard, recordTime, recordDontKnow, limitSeconds]);

  function handleKnew() {
    if (!currentCard) return;
    setResults((prev) => [
      ...prev,
      { cardNumber: currentCard.number, word: currentCard.word, knew: true },
    ]);
    advanceQueue(false);
  }

  function handleDontKnow() {
    if (!currentCard) return;
    recordDontKnow(currentCard.number);
    setResults((prev) => [
      ...prev,
      { cardNumber: currentCard.number, word: currentCard.word, knew: false },
    ]);
    advanceQueue(true);
  }

  function advanceQueue(putBack: boolean) {
    setQueue((prev) => {
      const [head, ...rest] = prev;
      if (putBack) {
        return [...rest, head];
      }
      // Don't put back → check if done
      const next = rest;
      if (next.length === 0) {
        // Round over
        if (roundType === 'A') {
          startRoundB();
        } else {
          // Both rounds done
          setAllDone(true);
          setPhase('summary');
        }
        return next;
      }
      return next;
    });

    if (!putBack) {
      // handled inside setQueue callback
    } else {
      setPhase('question');
      setTimerRunning(true);
      setTimerKey((k) => k + 1);
      startTimeRef.current = Date.now();
    }
  }

  // Actually we need to handle transition to summary outside of setState
  useEffect(() => {
    if (allDone) {
      setPhase('summary');
    }
  }, [allDone]);

  // When queue empties and not putting back, transition happens inside setQueue
  // We do this more cleanly by having a dedicated done state
  function handleKnewClean() {
    if (!currentCard) return;
    const result: SessionResult = { cardNumber: currentCard.number, word: currentCard.word, knew: true };
    const newQueue = queue.slice(1);

    setResults((prev) => [...prev, result]);

    if (newQueue.length === 0) {
      if (roundType === 'A') {
        // Start round B
        setRoundType('B');
        const rbQueue = shuffle(sessionCards);
        setQueue(rbQueue);
        setPhase('question');
        setTimerRunning(true);
        setTimerKey((k) => k + 1);
        startTimeRef.current = Date.now();
      } else {
        setAllDone(true);
        setQueue([]);
        setPhase('summary');
      }
    } else {
      setQueue(newQueue);
      setPhase('question');
      setTimerRunning(true);
      setTimerKey((k) => k + 1);
      startTimeRef.current = Date.now();
    }
  }

  function handleDontKnowClean() {
    if (!currentCard) return;
    recordDontKnow(currentCard.number);
    const result: SessionResult = { cardNumber: currentCard.number, word: currentCard.word, knew: false };
    const newQueue = [...queue.slice(1), currentCard];

    setResults((prev) => [...prev, result]);
    setQueue(newQueue);
    setPhase('question');
    setTimerRunning(true);
    setTimerKey((k) => k + 1);
    startTimeRef.current = Date.now();
  }

  // Check if all 101 cards answered correctly below time limit to level up
  // (simplified: if all session cards were "knew" in this session, level up)
  function handleSummaryFinish() {
    const allKnew = results.filter((r) => r.knew).length === results.length;
    if (allKnew && currentLevel < TIME_LEVELS.length - 1) {
      onLevelUp();
    }
    onFinish();
  }

  if (phase === 'summary') {
    const knewCount = results.filter((r) => r.knew).length;
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.summaryContent}>
        <Text style={styles.summaryTitle}>Sesja zakończona!</Text>
        <Text style={styles.summaryStats}>
          Wiem: {knewCount} / {results.length}
        </Text>

        <View style={styles.resultsList}>
          {sessionCards.map((card) => {
            const cardResults = results.filter((r) => r.cardNumber === card.number);
            const lastResult = cardResults[cardResults.length - 1];
            return (
              <View key={card.number} style={styles.resultRow}>
                <Text style={styles.resultNumber}>{card.number}</Text>
                <Text style={styles.resultWord}>{card.word}</Text>
                <Text style={lastResult?.knew ? styles.resultKnew : styles.resultDontKnow}>
                  {lastResult?.knew ? '✓' : '✗'}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.finishButton}>
          <AppButton label="Powrót do menu" onPress={handleSummaryFinish} testID="finish-button" />
        </View>
      </ScrollView>
    );
  }

  if (!currentCard) return null;

  const isRoundA = roundType === 'A';
  const questionText = isRoundA ? String(currentCard.number) : currentCard.word;
  const answerText = isRoundA ? currentCard.word : String(currentCard.number);
  const roundLabel = isRoundA ? 'Runda A: liczba → słowo' : 'Runda B: słowo → liczba';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.roundLabel}>{roundLabel}</Text>
        <Text style={styles.queueInfo}>
          Pozostało: {queue.length} kart
        </Text>
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
          <AppButton
            label="Odkryj"
            onPress={handleReveal}
            testID="reveal-button"
          />
        ) : (
          <View style={styles.answerButtons}>
            <AppButton
              label="Wiem"
              onPress={handleKnewClean}
              testID="knew-button"
            />
            <View style={styles.buttonSpacer} />
            <AppButton
              label="Nie wiem"
              onPress={handleDontKnowClean}
              variant="secondary"
              testID="dont-know-button"
            />
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
  resultKnew: {
    fontSize: 20,
    color: '#4aff7a',
    fontWeight: '700',
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
