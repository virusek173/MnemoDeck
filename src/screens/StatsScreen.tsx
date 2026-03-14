import React from 'react';
import { View, Text, ScrollView, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useStats } from '../context/StatsContext';
import { getWorstCards, getDontKnowCards } from '../utils/stats';
import { cards } from '../data/cards';
import { AppButton } from '../components/AppButton';

function getWord(cardNumber: number): string {
  const found = cards.find((c) => c.number === cardNumber);
  return found ? found.word : '?';
}

export function StatsScreen() {
  const { stats, clearStats } = useStats();
  const worstCards = getWorstCards(stats);
  const dontKnowCards = getDontKnowCards(stats);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Statystyki</Text>

      <Text style={styles.sectionTitle}>Najgorszy czas (malejąco)</Text>
      {worstCards.length === 0 ? (
        <Text style={styles.emptyText}>Brak danych</Text>
      ) : (
        worstCards.map((item) => (
          <View key={item.cardNumber} style={styles.row}>
            <Text style={styles.cardNumber}>{item.cardNumber}</Text>
            <Text style={styles.cardWord}>{getWord(item.cardNumber)}</Text>
            <Text style={styles.cardStat}>{(item.avgTime / 1000).toFixed(2)}s</Text>
          </View>
        ))
      )}

      <Text style={[styles.sectionTitle, styles.sectionMargin]}>Nie znam</Text>
      {dontKnowCards.length === 0 ? (
        <Text style={styles.emptyText}>Brak danych</Text>
      ) : (
        dontKnowCards.map((item) => (
          <View key={item.cardNumber} style={styles.row}>
            <Text style={styles.cardNumber}>{item.cardNumber}</Text>
            <Text style={styles.cardWord}>{getWord(item.cardNumber)}</Text>
            <Text style={styles.cardStat}>✗ {item.dontKnowCount}</Text>
          </View>
        ))
      )}

      <View style={styles.clearButton}>
        <AppButton label="Wyczyść statystyki" onPress={clearStats} variant="secondary" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  } as ViewStyle,
  content: {
    padding: 20,
    paddingBottom: 40,
  } as ViewStyle,
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  } as TextStyle,
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a9eff',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  } as TextStyle,
  sectionMargin: {
    marginTop: 28,
  } as TextStyle,
  emptyText: {
    color: '#666666',
    fontSize: 14,
    fontStyle: 'italic',
  } as TextStyle,
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 6,
  } as ViewStyle,
  cardNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    width: 48,
  } as TextStyle,
  cardWord: {
    fontSize: 16,
    color: '#ffffff',
    flex: 1,
  } as TextStyle,
  cardStat: {
    fontSize: 14,
    color: '#4a9eff',
    fontWeight: '600',
  } as TextStyle,
  clearButton: {
    marginTop: 36,
    alignItems: 'center',
  } as ViewStyle,
});
