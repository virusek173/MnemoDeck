import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface CardProps {
  title: string;
  subtitle?: string;
  revealed?: boolean;
  testID?: string;
}

export function Card({ title, subtitle, revealed = false, testID }: CardProps) {
  return (
    <View style={styles.card} testID={testID}>
      <Text style={styles.title}>{title}</Text>
      {revealed && subtitle !== undefined && (
        <Text style={styles.subtitle} testID="card-subtitle">
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 180,
  } as ViewStyle,
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  } as TextStyle,
  subtitle: {
    fontSize: 32,
    fontWeight: '500',
    color: '#4a9eff',
    marginTop: 16,
    textAlign: 'center',
  } as TextStyle,
});
