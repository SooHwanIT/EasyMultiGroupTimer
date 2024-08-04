import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function GroupTimerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Group Timeasdsar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});

export default GroupTimerScreen;
