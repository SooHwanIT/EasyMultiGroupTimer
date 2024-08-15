import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Button, LayoutAnimation, Platform, UIManager } from 'react-native';
import TimerCard from '../components/TimerCard';
import UUID from 'react-native-uuid';

// LayoutAnimation 설정 (Android에서 사용하려면 UIManager 설정 필요)
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function SingleTimerScreen() {
  const [timers, setTimers] = useState([UUID.v4()]);

  const addTimer = () => {
    const newId = UUID.v4();
    setTimers(prevTimers => [...prevTimers, newId]);
  };

  const deleteTimer = id => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // 애니메이션 설정
    setTimers(prevTimers => prevTimers.filter(timerId => timerId !== id));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {timers.map(id => (
        <TimerCard key={id} id={id} onDelete={() => deleteTimer(id)} />
      ))}
      <Button title="Add Timer" onPress={addTimer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SingleTimerScreen;
