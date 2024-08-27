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
  Modal,
  Text,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TimerCard from '../components/TimerCard';
import UUID from 'react-native-uuid';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

// LayoutAnimation 설정 (Android에서 사용하려면 UIManager 설정 필요)
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STORAGE_KEY = 'SINGLE_TIMER_DATA';  // 저장할 데이터의 키

function SingleTimerScreen() {
  const [timers, setTimers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);  // 모달 가시성 상태

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
      <LinearGradient
          colors={['#f0f4f8', '#ffffff']} // 연한 색깔의 그라데이션
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {timers.map(id => (
              <TimerCard key={id} id={id} onDelete={() => deleteTimer(id)} />
          ))}
        </ScrollView>
        {/* 타이머 추가 버튼 */}
        <TouchableOpacity style={styles.addButton} onPress={addTimer}>
          <Icon name="add" size={30} color="#000000" />
        </TouchableOpacity>

        {/* 사용법 안내 모달 */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(!modalVisible)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>타이머 사용법</Text>
              <Text style={styles.instructionText}>• 타이머 카드를 클릭하여 시작 및 정지</Text>
              <Text style={styles.instructionText}>• 왼쪽으로 드래그하여 초기화</Text>
              <Text style={styles.instructionText}>• 오른쪽으로 드래그하여 삭제</Text>
              <Text style={styles.instructionText}>• 타이머를 길게 눌러 수정</Text>

              <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.textStyle}>닫기</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* 사용법 버튼 */}
        <TouchableOpacity style={styles.helpButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.helpButtonText}>?</Text>
        </TouchableOpacity>
      </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructionText: {
    marginBottom: 5,
    textAlign: 'center',
    fontSize: 16,
  },
  helpButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    left: 20,
    bottom: 20,
  },
  helpButtonText: {
    fontSize: 24,
    color: '#000',
  },
});

export default SingleTimerScreen;
