import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { AppButton } from '../components/AppButton';
import { RoundType } from '../types';

const TIME_LEVELS = [5, 4, 3, 2, 1, 0.5];

interface HomeScreenProps {
  currentLevel: number;
  roundType: RoundType;
  remainingInPhase: number;
  onStart: () => void;
}

export function HomeScreen({ currentLevel, roundType, remainingInPhase, onStart }: HomeScreenProps) {
  const limitSeconds = TIME_LEVELS[Math.min(currentLevel, TIME_LEVELS.length - 1)];
  const phaseLabel = roundType === 'A' ? 'Liczba → Słowo' : 'Słowo → Liczba';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MnemoDeck</Text>
      <Text style={styles.subtitle}>System mnemoniczny 0–100</Text>

      <View style={styles.levelCard}>
        <Text style={styles.levelLabel}>Aktualny poziom</Text>
        <Text style={styles.levelNumber}>{currentLevel + 1}</Text>
        <Text style={styles.levelLimit}>Limit czasu: {limitSeconds}s</Text>
      </View>

      <View style={styles.phaseCard}>
        <Text style={styles.phaseLabel}>Faza</Text>
        <Text style={styles.phaseValue}>{phaseLabel}</Text>
        <Text style={styles.phaseRemaining}>Pozostało w fazie: {remainingInPhase} kart</Text>
      </View>

      <View style={styles.startButton}>
        <AppButton label="Start" onPress={onStart} testID="start-button" />
      </View>

      <Text style={styles.hint}>10 kart na sesję</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  } as ViewStyle,
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  } as TextStyle,
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 6,
    marginBottom: 32,
  } as TextStyle,
  levelCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  } as ViewStyle,
  levelLabel: {
    fontSize: 12,
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  } as TextStyle,
  levelNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#4a9eff',
  } as TextStyle,
  levelLimit: {
    fontSize: 14,
    color: '#ffffff',
    marginTop: 4,
  } as TextStyle,
  phaseCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
  } as ViewStyle,
  phaseLabel: {
    fontSize: 12,
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  } as TextStyle,
  phaseValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  } as TextStyle,
  phaseRemaining: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
  } as TextStyle,
  startButton: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,
  hint: {
    fontSize: 12,
    color: '#444444',
  } as TextStyle,
});
