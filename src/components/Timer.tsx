import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface TimerProps {
  limitSeconds: number;
  running: boolean;
  onExpire: () => void;
  testID?: string;
}

export function Timer({ limitSeconds, running, onExpire, testID }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setElapsed(0);
  }, [limitSeconds]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 100;
        if (next >= limitSeconds * 1000) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onExpire();
          return limitSeconds * 1000;
        }
        return next;
      });
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, limitSeconds, onExpire]);

  const remaining = Math.max(0, limitSeconds - elapsed / 1000);
  const progress = elapsed / (limitSeconds * 1000);
  const isUrgent = remaining <= 1;

  return (
    <View style={styles.container} testID={testID}>
      <Text style={[styles.timeText, isUrgent && styles.urgentText]}>{remaining.toFixed(1)}s</Text>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            { width: `${Math.min(progress * 100, 100)}%` as unknown as number },
            isUrgent && styles.urgentBar,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 8,
  } as ViewStyle,
  timeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4a9eff',
    marginBottom: 6,
  } as TextStyle,
  urgentText: {
    color: '#ff4a4a',
  } as TextStyle,
  barBackground: {
    width: '80%',
    height: 6,
    backgroundColor: '#3a3a3a',
    borderRadius: 3,
    overflow: 'hidden',
  } as ViewStyle,
  barFill: {
    height: '100%',
    backgroundColor: '#4a9eff',
    borderRadius: 3,
  } as ViewStyle,
  urgentBar: {
    backgroundColor: '#ff4a4a',
  } as ViewStyle,
});
