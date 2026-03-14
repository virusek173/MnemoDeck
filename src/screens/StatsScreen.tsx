import React from 'react';
import { View, Text, ScrollView, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStats } from '../context/StatsContext';
import { getWorstCards, getDontKnowCards } from '../utils/stats';
import { cards } from '../data/cards';
import { AppButton } from '../components/AppButton';

const LEVEL_KEY = '@mnemo_level';
const PHASE_KEY = '@mnemo_phase';
const DECK_KEY = '@mnemo_deck';

function fmt(ms: number): string {
  if (ms === 0) return '—';
  return (ms / 1000).toFixed(2) + 's';
}

function getWord(cardNumber: number): string {
  const found = cards.find((c) => c.number === cardNumber);
  return found ? found.word : '?';
}

export function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { stats, clearStats } = useStats();
  const worstCards = getWorstCards(stats);
  const dontKnowCards = getDontKnowCards(stats);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <Text style={styles.header}>Statystyki</Text>

      <Text style={styles.sectionTitle}>Czasy (najgorsze)</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.colNum, styles.tableHeaderText]}>#</Text>
        <Text style={[styles.colWord, styles.tableHeaderText]}>Słowo</Text>
        <Text style={[styles.colTime, styles.tableHeaderText]}>123→abc</Text>
        <Text style={[styles.colTime, styles.tableHeaderText]}>abc→123</Text>
      </View>
      {worstCards.length === 0 ? (
        <Text style={styles.emptyText}>Brak danych</Text>
      ) : (
        worstCards.map((item) => (
          <View key={item.cardNumber} style={styles.row}>
            <Text style={[styles.colNum, styles.cellText]}>{item.cardNumber}</Text>
            <Text style={[styles.colWord, styles.cellText]}>{getWord(item.cardNumber)}</Text>
            <Text style={[styles.colTime, styles.cellText]}>{fmt(item.avgTimeA)}</Text>
            <Text style={[styles.colTime, styles.cellText]}>{fmt(item.avgTimeB)}</Text>
          </View>
        ))
      )}

      <Text style={[styles.sectionTitle, styles.sectionMargin]}>Nie znam</Text>
      {dontKnowCards.length === 0 ? (
        <Text style={styles.emptyText}>Brak danych</Text>
      ) : (
        dontKnowCards.map((item) => (
          <View key={item.cardNumber} style={styles.row}>
            <Text style={[styles.colNum, styles.cellText]}>{item.cardNumber}</Text>
            <Text style={[styles.colWord, styles.cellText]}>{getWord(item.cardNumber)}</Text>
            <Text style={[styles.colTime, styles.dontKnowCount]}>✗ {item.dontKnowCount}</Text>
            <Text style={styles.colTime} />
          </View>
        ))
      )}

      <View style={styles.clearButton}>
        <AppButton label="Wyczyść statystyki" onPress={clearStats} variant="secondary" />
        <View style={styles.buttonSpacer} />
        <AppButton
          label="Reset postępu"
          onPress={() =>
            AsyncStorage.multiSet([
              [LEVEL_KEY, '0'],
              [PHASE_KEY, 'A'],
              [DECK_KEY, '[]'],
            ])
          }
          variant="secondary"
        />
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
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  } as TextStyle,
  sectionMargin: {
    marginTop: 28,
  } as TextStyle,
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 4,
    marginBottom: 4,
  } as ViewStyle,
  tableHeaderText: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '600',
    textTransform: 'uppercase',
  } as TextStyle,
  row: {
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
    width: 60,
    textAlign: 'right',
  } as TextStyle,
  cellText: {
    fontSize: 15,
    color: '#ffffff',
  } as TextStyle,
  dontKnowCount: {
    fontSize: 15,
    color: '#ff4a4a',
    fontWeight: '600',
  } as TextStyle,
  emptyText: {
    color: '#666666',
    fontSize: 14,
    fontStyle: 'italic',
  } as TextStyle,
  clearButton: {
    marginTop: 36,
    alignItems: 'center',
  } as ViewStyle,
  buttonSpacer: {
    height: 12,
  } as ViewStyle,
});
