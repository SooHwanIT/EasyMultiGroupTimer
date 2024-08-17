import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Button,
  LayoutAnimation,
  Platform,
  UIManager,
  TouchableOpacity
} from 'react-native';
import TimerCard from '../components/TimerCard';
import UUID from 'react-native-uuid';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
      <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      {timers.map(id => (
        <TimerCard key={id} id={id} onDelete={() => deleteTimer(id)} />
      ))}

    </ScrollView>
  {/* 타이머 추가 버튼 */}
  <TouchableOpacity style={styles.addButton} onPress={addTimer}>
    <Icon name="add" size={30} color="#000000" />
  </TouchableOpacity>
</View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollContainer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default SingleTimerScreen;
