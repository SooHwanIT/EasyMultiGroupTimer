import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Button,
  Animated,
  PanResponder,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Modal from 'react-native-modal';
import { WheelPicker } from 'react-native-wheel-picker-android';
import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TimerCard = forwardRef(({ id, onDelete }, ref) => {
  const [time, setTime] = useState(60); // 타이머에 표시되는 시간
  const [isRunning, setIsRunning] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [timerName, setTimerName] = useState('타이머 이름');
  const [nameInputValue, setNameInputValue] = useState(timerName);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [showDecimals, setShowDecimals] = useState(false);

  const isDragging = useRef(false); // Ref로 드래깅 상태 유지
  const pan = useRef(new Animated.ValueXY()).current;
  const longPressDuration = 750;
  const longPressTimerRef = useRef(null);
  const pressStart = useRef(null);

  const startTimeRef = useRef(null); // 타이머가 시작된 시점
  const initialTime = useRef(60); // 타이머의 초기 설정 시간
  const pauseTime = useRef(0); // 타이머가 멈춘 시점의 남은 시간
  const animationFrameRef = useRef(null);

  useImperativeHandle(ref, () => ({
    startTimer,
    pauseTimer,
    resetTimer,
  }));

  useEffect(() => {
    // AsyncStorage에서 저장된 상태를 불러옵니다.
    const loadTimerState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(`timerState_${id}`);
        if (savedState) {
          const { savedTime, savedInitialTime, savedPauseTime, savedIsEnabled, savedTimerName, savedShowDecimals } = JSON.parse(savedState);
          setTime(savedTime);
          initialTime.current = savedInitialTime;
          pauseTime.current = savedPauseTime;
          setIsEnabled(savedIsEnabled);
          setTimerName(savedTimerName);
          setShowDecimals(savedShowDecimals);
        }
      } catch (e) {
        console.log('Failed to load timer state', e);
      }
    };

    loadTimerState();
  }, [id]);

  const saveTimerState = async () => {
    try {
      const state = {
        savedTime: time,
        savedInitialTime: initialTime.current,
        savedPauseTime: pauseTime.current,
        savedIsEnabled: isEnabled,
        savedTimerName: timerName,
        savedShowDecimals: showDecimals,
      };
      await AsyncStorage.setItem(`timerState_${id}`, JSON.stringify(state));
    } catch (e) {
      console.log('Failed to save timer state', e);
    }
  };

  const playAlarm = () => {
    const alarmSound = new Sound('alarm.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load the sound', error);
        return;
      }
      alarmSound.play((success) => {
        if (!success) {
          console.log('Sound playback failed');
        }
        alarmSound.release(); // 메모리 해제를 위해 사운드를 해제합니다.
      });
    });
  };



  const updateTimer = () => {
    const now = Date.now();
    const elapsedTime = (now - startTimeRef.current) / 1000; // 경과 시간 (초)
    const remainingTime = Math.max(initialTime.current - elapsedTime, 0);

    setTime(remainingTime);

    if (remainingTime > 0) {
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    } else {
      setIsRunning(false);
      setTime(0);
      playAlarm(); // 타이머가 0초일 때 알람 사운드 재생
      saveTimerState();
    }
  };

  const startTimer = () => {
    if (isRunning) return;

    if (pauseTime.current) {
      startTimeRef.current = Date.now() - (initialTime.current - pauseTime.current) * 1000;
      pauseTime.current = 0;
    } else {
      startTimeRef.current = Date.now();
    }
    setIsRunning(true);
    animationFrameRef.current = requestAnimationFrame(updateTimer);
    saveTimerState();
  };

  const pauseTimer = () => {
    if (!isRunning) return;

    setIsRunning(false);
    pauseTime.current = time; // 현재 남은 시간을 기록
    cancelAnimationFrame(animationFrameRef.current);
    saveTimerState();
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(initialTime.current);
    pauseTime.current = initialTime.current;
    setIsEnabled(false);
    cancelAnimationFrame(animationFrameRef.current);
    saveTimerState(); // 타이머 리셋 시 상태 저장
  };

  const saveTime = () => {
    const timeInSeconds = hours * 3600 + minutes * 60 + seconds;
    setTime(timeInSeconds);
    initialTime.current = timeInSeconds;
    pauseTime.current = timeInSeconds;
    setIsModalVisible(false);
    setTimerName(nameInputValue);
    saveTimerState(); // 타이머 설정 변경 시 상태 저장
  };

  const toggleTimer = () => {
    setIsEnabled(prev => !prev);
  };

  useEffect(() => {
    if (isEnabled) {
      startTimer();
    } else {
      pauseTimer();
    }
  }, [isEnabled]);

  const handlePress = isPressIn => {
    if (isPressIn) {
      pressStart.current = Date.now();
      longPressTimerRef.current = setTimeout(() => {
        if (!isDragging.current) {
          setIsModalVisible(true);
        }
      }, longPressDuration);
    } else {
      clearTimeout(longPressTimerRef.current);
      const duration = Date.now() - pressStart.current;
      if (!isDragging.current) {
        toggleTimer();
      }
      pressStart.current = null;
    }
  };

  const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,

        onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 5,

        onPanResponderGrant: () => {
          isDragging.current = false;
          handlePress(true);
          clearTimeout(longPressTimerRef.current);
          pan.setOffset({
            x: pan.x._value,
            y: pan.y._value,
          });
          pan.setValue({ x: 0, y: 0 });
          pressStart.current = Date.now();
          longPressTimerRef.current = setTimeout(() => {
            if (!isDragging.current) {
              setIsModalVisible(true);
            }
            isDragging.current = true;
          }, longPressDuration);
        },

        onPanResponderMove: (_, gestureState) => {
          isDragging.current = true;
          const dragX = Math.max(-80, Math.min(80, gestureState.dx));
          pan.setValue({ x: dragX, y: 0 });
        },

        onPanResponderRelease: (e, gestureState) => {
          handlePress(false);
          pan.flattenOffset();

          if (gestureState.dx < -100) {
            onDelete(id);
          } else if (gestureState.dx > 100) {
            resetTimer();
          }

          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 7,
            tension: 40,
            useNativeDriver: false,
          }).start();
        },

        onPanResponderTerminate: () => {
          handlePress(false);
        },

        onPanResponderTerminationRequest: () => true,
      }),
  ).current;

  const refreshIconOpacity = pan.x.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const deleteIconOpacity = pan.x.interpolate({
    inputRange: [-80, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });


  const progress = (time / initialTime.current) * 100;

  return (
      <View style={styles.container}>
        <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.card,
              time === 0 ? styles.completedCard : isRunning && styles.runningCard, // 조건부 스타일 적용
              { transform: pan.getTranslateTransform() },
            ]}
        >
          <View style={styles.cardContent}>
            <Text
                style={styles.timeText}
                adjustsFontSizeToFit
                numberOfLines={1}
                minimumFontScale={0.5}
            >
              {formatTime(time, showDecimals)}
            </Text>
            <View style={styles.timerInfo}>
              <Text style={styles.timerName}>{timerName}</Text>
              <Text style={styles.timerDetails}>
                {formatTime(initialTime.current, showDecimals)}
              </Text>
            </View>

            {/*<CircularProgress progress={progress}/>*/}
          </View>
        </Animated.View>

        <Animated.View
            style={[
              styles.actionContainer,
              styles.refreshContainer,
              { opacity: refreshIconOpacity },
            ]}
        >
          <Icon name="refresh-cw" size={24} color="#007BFF" />
        </Animated.View>

        <Animated.View
            style={[
              styles.actionContainer,
              styles.deleteContainer,
              { opacity: deleteIconOpacity },
            ]}
        >
          <Icon name="trash-2" size={24} color="red" />
        </Animated.View>

        <Modal
            isVisible={isModalVisible}
            onBackdropPress={() => setIsModalVisible(false)}
            style={styles.modal}
        >
          <View style={styles.modalContent}>
            {/*<Text style={styles.modalTitle}>타이머 수정</Text>*/}
            <TextInput
                style={styles.timerNameInput}
                value={nameInputValue}
                onChangeText={setNameInputValue}
                placeholder="타이머 이름"
            />

            <View style={styles.timePickerContainer}>
              <WheelPicker
                  selectedItem={hours}
                  data={Array.from({ length: 100 }, (_, i) =>
                      String(i).padStart(2, "0")
                  )}
                  onItemSelected={(index) => setHours(index)}
                  style={styles.picker}
                  itemTextSize={24}
                  selectedItemTextSize={28}
              />
              <WheelPicker
                  selectedItem={minutes}
                  data={Array.from({ length: 60 }, (_, i) =>
                      String(i).padStart(2, "0")
                  )}
                  onItemSelected={(index) => setMinutes(index)}
                  style={styles.picker}
                  itemTextSize={24}
                  selectedItemTextSize={28}
              />
              <WheelPicker
                  selectedItem={seconds}
                  data={Array.from({ length: 60 }, (_, i) =>
                      String(i).padStart(2, "0")
                  )}
                  onItemSelected={(index) => setSeconds(index)}
                  style={styles.picker}
                  itemTextSize={24}
                  selectedItemTextSize={28}
              />
            </View>
            <View style={styles.switchContainer}>
              <Text>소수점 표기</Text>
              <Switch value={showDecimals} onValueChange={setShowDecimals} />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                  style={[styles.button,styles.saveButton]}
                  onPress={saveTime}>
                <Text style={styles.buttonText}>저장</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setIsModalVisible(false)}>
              <Text style={styles.buttonText}>취소</Text>
            </TouchableOpacity>
            </View>

            <View style={styles.addTimeButtons}>
              {/*<Button title="10분 추가" onPress={() => addMinutes(10)} />*/}
              {/*<Button title="1분 추가" onPress={() => addMinutes(1)} />*/}
            </View>
          </View>
        </Modal>
      </View>
  );

});

const formatTime = (seconds, showDecimals) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = showDecimals
      ? (seconds % 60).toFixed(1)
      : Math.floor(seconds % 60);

  return hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${showDecimals ? String(secs).padStart(4, '0') : String(secs).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${showDecimals ? String(secs).padStart(4, '0') : String(secs).padStart(2, '0')}`;
};
const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  card: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 6,
    borderRadius: 10,
    shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2, // 그림자 진하게 수정
    shadowRadius: 6, // 그림자 퍼짐 정도 조정
    elevation: 2,
    zIndex: 1,
  },
  runningCard: {

    backgroundColor: 'rgb(235,242,255)',
    borderColor: '#000000',
    borderWidth: 1,
    marginVertical: 5,
    margin: -1,  // 보더 너비와 동일한 음수 마진 적용
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 }, // 음각 효과를 주기 위해 그림자를 위로 이동
    shadowOpacity: 0.3, // 그림자를 조금 더 진하게
    shadowRadius: 4,    // 그림자 퍼짐 정도를 줄여서 더 선명한 음각 효과
    elevation: 4,       // 음각 효과를 더 높게
  },
  completedCard:{
    backgroundColor: 'rgb(255,235,238)',
    borderColor: '#000000',
    borderWidth: 1,
    marginVertical: 5,
    margin: -1,  // 보더 너비와 동일한 음수 마진 적용
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 }, // 음각 효과를 주기 위해 그림자를 위로 이동
    shadowOpacity: 0.3, // 그림자를 조금 더 진하게
    shadowRadius: 4,    // 그림자 퍼짐 정도를 줄여서 더 선명한 음각 효과
    elevation: 4,       // 음각 효과를 더 높게
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'left',
    flex: 1,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  timerInfo: {
    alignItems: 'flex-end',
    flex: 1,
  },
  timerName: {
    fontSize: 14,
    color: '#555',
  },
  timerDetails: {
    fontSize: 12,
    color: '#888',
  },
  actionContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    height: 68,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    zIndex: 0,
  },
  refreshContainer: {
    left: 0,
    backgroundColor: '#e0f7fa',
  },
  deleteContainer: {
    right: 0,
    backgroundColor: '#ffebee',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    paddingBottom: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,  // 폰트 크기 키움fontWeight: '600',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
    textAlign: 'center',
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 15,

  },
  picker: {
    width: '30%',
    height: 180,  // 높이 조정 (크기 키움)
  },
  timerNameInput: {
    fontSize: 24,  // 타이머 이름 입력 필드의 폰트 크기 키움fontWeight: '600',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    textAlign: 'center',
    width: '100%',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  addTimeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,  // 보더 라운드 추가marginHorizontal: 5,
    alignItems: 'center',
    backgroundColor: '#E0E0E0', // 배경 채도를 낮춰서 가독성 높임
  },

  saveButton: {
    backgroundColor: '#B0E57C', // 채도가 낮은 초록색 배경
  },

  cancelButton: {
    backgroundColor: '#FFCCCB', // 채도가 낮은 빨간색 배경
  },

  buttonText: {
    color: '#000000',  // 검정색 글씨fontSize: 18,      // 글씨 크기 키움fontWeight: '600',
  },
});

export default TimerCard;
