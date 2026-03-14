import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { StatsProvider } from './src/context/StatsContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { SessionScreen } from './src/screens/SessionScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { cards as allCards } from './src/data/cards';
import { shuffle } from './src/utils/shuffle';
import { CardData, RoundType } from './src/types';

const Tab = createBottomTabNavigator();

const TAB_BAR_STYLE = {
  backgroundColor: '#111111',
  borderTopColor: '#2a2a2a',
  borderTopWidth: 1,
};

const ACTIVE_COLOR = '#4a9eff';
const INACTIVE_COLOR = '#555555';

const LEVEL_KEY = '@mnemo_level';
const DECK_KEY = '@mnemo_deck';
const PHASE_KEY = '@mnemo_phase';
const SESSION_SIZE = 10;

function GameTab() {
  const [inSession, setInSession] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [roundType, setRoundType] = useState<RoundType>('A');
  const [sessionCards, setSessionCards] = useState<CardData[]>([]);
  const [remainingInPhase, setRemainingInPhase] = useState(allCards.length);

  const loadState = useCallback(async () => {
    const [level, phase, deck] = await Promise.all([
      AsyncStorage.getItem(LEVEL_KEY),
      AsyncStorage.getItem(PHASE_KEY),
      AsyncStorage.getItem(DECK_KEY),
    ]);
    setCurrentLevel(level !== null ? parseInt(level, 10) : 0);
    setRoundType(phase === 'B' ? 'B' : 'A');
    if (deck !== null) {
      const parsed = JSON.parse(deck) as number[];
      setRemainingInPhase(parsed.length === 0 ? allCards.length : parsed.length);
    } else {
      setRemainingInPhase(allCards.length);
    }
  }, []);

  useEffect(() => { loadState(); }, [loadState]);

  useFocusEffect(useCallback(() => {
    if (!inSession) loadState();
  }, [inSession, loadState]));

  const pickSessionCards = useCallback(async (phase: RoundType) => {
    const raw = await AsyncStorage.getItem(DECK_KEY);
    let remaining: number[] = raw ? JSON.parse(raw) : [];

    if (remaining.length === 0) {
      remaining = shuffle(allCards).map((c) => c.number);
    }

    const picked = remaining.slice(0, SESSION_SIZE);
    const newRemaining = remaining.slice(SESSION_SIZE);
    await AsyncStorage.setItem(DECK_KEY, JSON.stringify(newRemaining));
    setRemainingInPhase(newRemaining.length);

    return allCards.filter((c) => picked.includes(c.number));
  }, []);

  async function handleStart() {
    const picked = await pickSessionCards(roundType);
    setSessionCards(picked);
    setInSession(true);
  }

  async function handleFinish() {
    setInSession(false);

    const raw = await AsyncStorage.getItem(DECK_KEY);
    const remaining: number[] = raw ? JSON.parse(raw) : [];

    if (remaining.length === 0) {
      // Bieżąca faza skończona
      if (roundType === 'A') {
        // Przejdź do fazy B
        const newDeck = shuffle(allCards).map((c) => c.number);
        await AsyncStorage.setItem(DECK_KEY, JSON.stringify(newDeck));
        await AsyncStorage.setItem(PHASE_KEY, 'B');
        setRoundType('B');
        setRemainingInPhase(newDeck.length);
      } else {
        // Faza B skończona → level up, wróć do fazy A
        const newDeck = shuffle(allCards).map((c) => c.number);
        await AsyncStorage.setItem(DECK_KEY, JSON.stringify(newDeck));
        await AsyncStorage.setItem(PHASE_KEY, 'A');
        setRoundType('A');
        setRemainingInPhase(newDeck.length);
        setCurrentLevel((prev) => {
          const next = Math.min(prev + 1, 5);
          AsyncStorage.setItem(LEVEL_KEY, String(next));
          return next;
        });
      }
    }
  }

  if (inSession && sessionCards.length > 0) {
    return (
      <SessionScreen
        currentLevel={currentLevel}
        roundType={roundType}
        sessionCards={sessionCards}
        onFinish={handleFinish}
      />
    );
  }

  return (
    <HomeScreen
      currentLevel={currentLevel}
      roundType={roundType}
      remainingInPhase={remainingInPhase}
      onStart={handleStart}
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <StatsProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: TAB_BAR_STYLE,
              tabBarActiveTintColor: ACTIVE_COLOR,
              tabBarInactiveTintColor: INACTIVE_COLOR,
              tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
            }}
          >
            <Tab.Screen
              name="Gra"
              component={GameTab}
              options={{
                tabBarIcon: ({ color }) => (
                  <View>
                    <Text style={{ fontSize: 20, color }}>🎮</Text>
                  </View>
                ),
              }}
            />
            <Tab.Screen
              name="Statystyki"
              component={StatsScreen}
              options={{
                tabBarIcon: ({ color }) => (
                  <View>
                    <Text style={{ fontSize: 20, color }}>📊</Text>
                  </View>
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </StatsProvider>
    </SafeAreaProvider>
  );
}
