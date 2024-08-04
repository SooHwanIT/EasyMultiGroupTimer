import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Button } from 'react-native';
import TimerCard from '../components/TimerCard';

function SingleTimerScreen() {
  const [timers, setTimers] = useState([1]);

  const addTimer = () => {
    setTimers([...timers, timers.length + 1]);
  };

  const deleteTimer = (index) => {
    const newTimers = timers.filter((_, i) => i !== index);
    setTimers(newTimers);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {timers.map((_, index) => (
        <TimerCard key={index} onDelete={() => deleteTimer(index)} />
      ))}
      <Button title="Add Timer" onPress={addTimer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SingleTimerScreen;
