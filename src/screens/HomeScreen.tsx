import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { AppButton } from '../components/AppButton';

const TIME_LEVELS = [5, 4, 3, 2, 1, 0.5];

interface HomeScreenProps {
  currentLevel: number;
  onStart: () => void;
}

export function HomeScreen({ currentLevel, onStart }: HomeScreenProps) {
  const limitSeconds = TIME_LEVELS[Math.min(currentLevel, TIME_LEVELS.length - 1)];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MnemoDeck</Text>
      <Text style={styles.subtitle}>System mnemoniczny 0–100</Text>

      <View style={styles.levelCard}>
        <Text style={styles.levelLabel}>Aktualny poziom</Text>
        <Text style={styles.levelNumber}>{currentLevel + 1}</Text>
        <Text style={styles.levelLimit}>Limit czasu: {limitSeconds}s</Text>
      </View>

      <View style={styles.startButton}>
        <AppButton label="Start" onPress={onStart} testID="start-button" />
      </View>

      <Text style={styles.hint}>10 losowych kart · Runda A i B</Text>
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
    marginBottom: 40,
  } as TextStyle,
  levelCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
    marginBottom: 36,
  } as ViewStyle,
  levelLabel: {
    fontSize: 12,
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  } as TextStyle,
  levelNumber: {
    fontSize: 56,
    fontWeight: '800',
    color: '#4a9eff',
  } as TextStyle,
  levelLimit: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 6,
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
