import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TimerCard from '../components/TimerCard';
import UUID from 'react-native-uuid';
import Icon from 'react-native-vector-icons/MaterialIcons';

// LayoutAnimation 설정 (Android에서 사용하려면 UIManager 설정 필요)
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STORAGE_KEY = 'SINGLE_TIMER_DATA';  // 저장할 데이터의 키

function SingleTimerScreen() {
  const [timers, setTimers] = useState([]);

  // 앱 시작 시 저장된 데이터를 불러옴
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTimers = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedTimers) {
          setTimers(JSON.parse(savedTimers));
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load timers.');
      }
    };

    loadData();
  }, []);

  // 타이머 추가
  const addTimer = () => {
    const newId = UUID.v4();
    const newTimers = [...timers, newId];
    setTimers(newTimers);
    saveData(newTimers);  // 데이터를 저장
  };

  // 타이머 삭제
  const deleteTimer = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newTimers = timers.filter(timerId => timerId !== id);
    setTimers(newTimers);
    saveData(newTimers);  // 데이터를 저장
  };

  // 데이터 저장
  const saveData = async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      Alert.alert('Error', 'Failed to save timers.');
    }
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
