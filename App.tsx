import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
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
import { CardData } from './src/types';

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
const SESSION_SIZE = 10;

function GameTab() {
  const [inSession, setInSession] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [sessionCards, setSessionCards] = useState<CardData[]>([]);
  const [remainingInCycle, setRemainingInCycle] = useState(allCards.length);

  useEffect(() => {
    AsyncStorage.getItem(LEVEL_KEY).then((val) => {
      if (val !== null) setCurrentLevel(parseInt(val, 10));
    });
    AsyncStorage.getItem(DECK_KEY).then((raw) => {
      if (raw !== null) {
        const deck: number[] = JSON.parse(raw);
        setRemainingInCycle(deck.length);
      }
    });
  }, []);

  const pickSessionCards = useCallback(async () => {
    const raw = await AsyncStorage.getItem(DECK_KEY);
    let remaining: number[] = raw ? JSON.parse(raw) : [];

    if (remaining.length === 0) {
      remaining = shuffle(allCards).map((c) => c.number);
    }

    const picked = remaining.slice(0, SESSION_SIZE);
    const newRemaining = remaining.slice(SESSION_SIZE);
    await AsyncStorage.setItem(DECK_KEY, JSON.stringify(newRemaining));
    setRemainingInCycle(newRemaining.length);

    return allCards.filter((c) => picked.includes(c.number));
  }, []);

  async function handleStart() {
    const picked = await pickSessionCards();
    setSessionCards(picked);
    setInSession(true);
  }

  function handleFinish() {
    setInSession(false);
  }

  function handleLevelUp() {
    setCurrentLevel((prev) => {
      const next = Math.min(prev + 1, 5);
      AsyncStorage.setItem(LEVEL_KEY, String(next));
      return next;
    });
  }

  if (inSession && sessionCards.length > 0) {
    return (
      <SessionScreen
        currentLevel={currentLevel}
        sessionCards={sessionCards}
        onLevelUp={handleLevelUp}
        onFinish={handleFinish}
      />
    );
  }

  return (
    <HomeScreen
      currentLevel={currentLevel}
      remainingInCycle={remainingInCycle}
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
