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
import {Picker} from '@react-native-picker/picker';
import { WheelPicker } from 'react-native-wheel-picker-android';


const TimerCard = forwardRef(({ id, onDelete }, ref) => {
  const [time, setTime] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [timerName, setTimerName] = useState('타이머 이름');
  const [nameInputValue, setNameInputValue] = useState(timerName);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [showDecimals, setShowDecimals] = useState(false);
  const [pressStart, setPressStart] = useState(null);
  const isDragging = useRef(false); // Ref로 드래깅 상태 유지
  const pan = useRef(new Animated.ValueXY()).current;
  const longPressDuration = 1000;
  const longPressTimerRef = useRef(null);
  const initialTime = useRef(60);

  useImperativeHandle(ref, () => ({
    startTimer,
    pauseTimer,
    resetTimer
  }));

  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 0) {
            clearInterval(interval);
            setIsRunning(false);
            return 0;
          }
          return (prevTime - 0.1).toFixed(1); // 0.1초씩 감소
        });
      }, 100); // 100ms마다 실행
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  const startTimer = () => {
    if (time > 0) {
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(initialTime.current);
    setIsEnabled(false);
  };

  const saveTime = () => {
    const timeInSeconds = hours * 3600 + minutes * 60 + seconds;
    setTime(timeInSeconds);
    initialTime.current = timeInSeconds;
    setIsModalVisible(false);
    setTimerName(nameInputValue);
  };

  const toggleTimer = () => {
    setIsEnabled(prev => !prev);
  };

  // useEffect를 추가하여 isEnabled가 변경될 때마다 타이머를 제어
  useEffect(() => {
    if (isEnabled) {
      startTimer();
    } else {
      pauseTimer();
    }
  }, [isEnabled]);

  const handlePress = isPressIn => {
    if (isPressIn) {
      console.log('Press in');
      setPressStart(Date.now());
      longPressTimerRef.current = setTimeout(() => {
        if (!isDragging.current) {
          // Ref로 드래깅 상태 확인
          setIsModalVisible(true);
        }
      }, longPressDuration);
    } else {
      clearTimeout(longPressTimerRef.current);
      const duration = Date.now() - pressStart;
      console.log(
          'Press out, duration:',
          duration,
          'isDragging:',
          isDragging.current,
      );

      if (!isDragging.current) {
        // if (!isDragging.current && duration < longPressDuration) {
        toggleTimer();
      }

      setPressStart(null);
    }
  };

  const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => {
          console.log(
              'onStartShouldSetPanResponder: 터치 시작 시 PanResponder 활성화 여부 결정',
          );
          return true;
        },

        onMoveShouldSetPanResponder: (_, gestureState) =>
            Math.abs(gestureState.dx) > 5,

        onPanResponderGrant: () => {
          isDragging.current = false;
          handlePress(true); // Press In
          clearTimeout(longPressTimerRef.current);
          pan.setOffset({
            x: pan.x._value,
            y: pan.y._value,
          });
          pan.setValue({x: 0, y: 0});
          setPressStart(Date.now());
          longPressTimerRef.current = setTimeout(() => {
            if (!isDragging.current) {
              // Ref로 드래깅 상태 확인
              setIsModalVisible(true);
            }
            isDragging.current = true;
          }, longPressDuration);
        },

        onPanResponderMove: (_, gestureState) => {
          isDragging.current = true; // Ref로 드래깅 상태 설정
          console.log(
              'onPanResponderMove: PanResponder 이동 isDragging : ',
              isDragging.current,
          );
          const dragX = Math.max(-80, Math.min(80, gestureState.dx));
          pan.setValue({x: dragX, y: 0});
        },

        onPanResponderRelease: (e, gestureState) => {
          console.log('onPanResponderRelease: PanResponder 해제');
          handlePress(false); // Press Out
          pan.flattenOffset();

          if (gestureState.dx < -100) {
            console.log('Swiped left, calling onDelete');
            onDelete(id);
          } else if (gestureState.dx > 100) {
            console.log('Swiped right, calling resetTimer');
            resetTimer();
          }

          Animated.spring(pan, {
            toValue: {x: 0, y: 0},
            friction: 7,
            tension: 40,
            useNativeDriver: false,
          }).start();
        },

        onPanResponderTerminate: () => {
          console.log('onPanResponderTerminate: PanResponder 종료');
          handlePress(false); // Press Out
        },

        onPanResponderTerminationRequest: () => {
          console.log('onPanResponderTerminationRequest: PanResponder 종료 요청');
          return true;
        },

        // onShouldBlockNativeResponder: () => {
        //     console.log('onShouldBlockNativeResponder: 네이티브 리스너 이벤트 차단 여부 결정');
        //     return false;
        // },
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
            <TouchableOpacity style={styles.customSwitch}>
              <View style={[styles.circle, isEnabled && styles.circleEnabled]} />
            </TouchableOpacity>
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
  customSwitch: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    paddingHorizontal: 3,
    marginLeft: 10,
  },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
  },
  circleEnabled: {
    backgroundColor: '#007BFF',
    alignSelf: 'flex-end',
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
