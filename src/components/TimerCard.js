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
  const longPressDuration = 1000;
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

  const updateTimer = () => {
    const now = Date.now();
    const elapsedTime = (now - startTimeRef.current) / 1000; // 경과 시간 (초)
    const remainingTime = Math.max(initialTime.current - elapsedTime, 0);

    setTime(remainingTime);

    if (remainingTime > 0) {
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    } else {
      setIsRunning(false);
    }
  };

  const startTimer = () => {
    if (pauseTime.current) {
      startTimeRef.current = Date.now() - (initialTime.current - pauseTime.current) * 1000;
      pauseTime.current = 0;
    } else {
      startTimeRef.current = Date.now();
    }
    setIsRunning(true);
    animationFrameRef.current = requestAnimationFrame(updateTimer);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    pauseTime.current = time; // 현재 남은 시간을 기록
    cancelAnimationFrame(animationFrameRef.current);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(initialTime.current);
    pauseTime.current = initialTime.current;
    setIsEnabled(false);
    cancelAnimationFrame(animationFrameRef.current);
  };

  const saveTime = () => {
    const timeInSeconds = hours * 3600 + minutes * 60 + seconds;
    setTime(timeInSeconds);
    initialTime.current = timeInSeconds;
    pauseTime.current = timeInSeconds;
    setIsModalVisible(false);
    setTimerName(nameInputValue);
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
  return (
      <View style={styles.container}>
        <Animated.View
            {...panResponder.panHandlers}
            style={[styles.card, {transform: pan.getTranslateTransform()}]}>
          <View style={styles.cardContent}>
            <Text
                style={styles.timeText}
                adjustsFontSizeToFit
                numberOfLines={1} // 한 줄로 유지
                minimumFontScale={0.5} // 폰트 크기 조정 시 최소 크기 설정
            >
              {formatTime(time, showDecimals)}
            </Text>
            <View style={styles.timerInfo}>
              <Text style={styles.timerName}>{timerName}</Text>
              <Text style={styles.timerDetails}>
                {formatTime(initialTime.current, showDecimals)}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
            style={[
              styles.actionContainer,
              styles.refreshContainer,
              {opacity: refreshIconOpacity},
            ]}>
          <Icon name="refresh-cw" size={24} color="#007BFF" />
        </Animated.View>

        <Animated.View
            style={[
              styles.actionContainer,
              styles.deleteContainer,
              {opacity: deleteIconOpacity},
            ]}>
          <Icon name="trash-2" size={24} color="red" />
        </Animated.View>

        <Modal
            isVisible={isModalVisible}
            onBackdropPress={() => setIsModalVisible(false)}
            style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>타이머 수정</Text>
            <View style={styles.timePickerContainer}>
              {/* 휠 피커로 변경된 시간 설정 */}
              <WheelPicker
                  selectedItem={hours}
                  data={Array.from({length: 100}, (_, i) => String(i).padStart(2, '0'))}
                  onItemSelected={index => setHours(index)}
                  style={styles.picker}
              />
              <WheelPicker
                  selectedItem={minutes}
                  data={Array.from({length: 60}, (_, i) => String(i).padStart(2, '0'))}
                  onItemSelected={index => setMinutes(index)}
                  style={styles.picker}
              />
              <WheelPicker
                  selectedItem={seconds}
                  data={Array.from({length: 60}, (_, i) => String(i).padStart(2, '0'))}
                  onItemSelected={index => setSeconds(index)}
                  style={styles.picker}
              />
            </View>
            <View style={styles.switchContainer}>
              <Text>소수점 표기</Text>
              <Switch value={showDecimals} onValueChange={setShowDecimals} />
            </View>
            <View style={styles.modalButtons}>
              <Button title="저장" onPress={saveTime} />
              <Button
                  title="취소"
                  onPress={() => setIsModalVisible(false)}
                  color="red"
              />
            </View>
            <View style={styles.addTimeButtons}>
              <Button title="10분 추가" onPress={() => addMinutes(10)} />
              <Button title="1분 추가" onPress={() => addMinutes(1)} />
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
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    zIndex: 1,
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
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
    fontSize: 20,
    marginBottom: 15,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  picker: {
    width: '30%',
    height: 150,
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
  },
  addTimeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
});

export default TimerCard;
