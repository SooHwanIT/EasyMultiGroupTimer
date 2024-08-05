import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Button } from 'react-native';
import TimerCard from '../components/TimerCard';
import UUID from 'react-native-uuid'; // react-native-uuid 패키지에서 UUID를 임포트

function SingleTimerScreen() {
  const [timers, setTimers] = useState([UUID.v4()]);

  const addTimer = () => {
    const newId = UUID.v4();
    //console.log('Adding Timer ID:', newId); // ID 확인
    setTimers(prevTimers => [...prevTimers, newId]);
  };

  const deleteTimer = id => {
    console.log('Deleting Timer ID:', id); // ID 확인
    setTimers(prevTimers => {
      const newTimers = prevTimers.filter(timerId => timerId !== id);
      //console.log('Remaining Timers:', newTimers); // 남은 타이머 확인
      return newTimers;
    });
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
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SingleTimerScreen;
