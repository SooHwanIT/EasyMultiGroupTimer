import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Button, Animated, PanResponder, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Modal from 'react-native-modal';

const TimerCard = ({ id, onDelete }) => {
  const [time, setTime] = useState(60); // 기본 시간 60초로 설정
  const [isRunning, setIsRunning] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [timerName, setTimerName] = useState('타이머 이름');
  const [nameInputValue, setNameInputValue] = useState(timerName);
  const [showDecimals, setShowDecimals] = useState(false);
  const [pressStart, setPressStart] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;
  const longPressDuration = 1000;
  const longPressTimerRef = useRef(null);
  const initialTime = useRef(60); // 초기 시간을 useRef로 관리

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (!isRunning && time !== 0) {
      clearInterval(interval);
    }

    if (time === 0) {
      clearInterval(interval);
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, time]);

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
    setTime(initialTime.current); // 초기 시간으로 리셋
    setIsEnabled(false); //버튼 off
  };

  const saveTime = () => {
    if (inputValue !== '') {
      const timeInSeconds = parseInt(inputValue, 10) * 60;
      setTime(timeInSeconds);
      initialTime.current = timeInSeconds; // 초기 시간 업데이트
      setIsRunning(false); //타이머 off
      setIsEnabled(false); //버튼 off
    }
    setIsModalVisible(false);
    setInputValue('');
    setTimerName(nameInputValue);
  };

  const toggleTimer = () => {
    setIsEnabled((prev) => !prev);
    if (!isEnabled) {
      startTimer();
    } else {
      pauseTimer();
    }
  };

  const handlePressIn = () => {
    setPressStart(Date.now());
    longPressTimerRef.current = setTimeout(() => {
      if (!isDragging) {
        setIsModalVisible(true);
      }
    }, longPressDuration);
  };

  const handlePressOut = () => {
    clearTimeout(longPressTimerRef.current);
    if (!isDragging && Date.now() - pressStart < longPressDuration) {
      toggleTimer();
    }
    setPressStart(null);
    setIsDragging(false);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (e, gestureState) => Math.abs(gestureState.dx) > 5,
      onPanResponderGrant: () => {
        setIsDragging(true);
        clearTimeout(longPressTimerRef.current);
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (e, gestureState) => {
        const dragX = Math.max(-80, Math.min(80, gestureState.dx));
        pan.setValue({ x: dragX, y: 0 });
      },
      onPanResponderRelease: (e, { dx }) => {
        setIsDragging(false);
        pan.flattenOffset();

        if (dx < -100) {
          onDelete(id);
        } else if (dx > 100) {
          resetTimer();
        }

        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          friction: 7,
          tension: 40,
          useNativeDriver: false,
        }).start();
      },
    })
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
        style={[styles.card, { transform: pan.getTranslateTransform() }]}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Text style={styles.timeText}>{formatTime(time, showDecimals)}</Text>
          <View style={styles.timerInfo}>
            <Text style={styles.timerName}>{timerName}</Text>
            <Text style={styles.timerDetails}>{formatTime(time, showDecimals)}</Text>
          </View>
          <TouchableOpacity style={styles.customSwitch} onPress={toggleTimer}>
            <View style={[styles.circle, isEnabled && styles.circleEnabled]} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.actionContainer, styles.refreshContainer, { opacity: refreshIconOpacity }]}>
        <Icon name="refresh-cw" size={24} color="#007BFF" />
      </Animated.View>

      <Animated.View style={[styles.actionContainer, styles.deleteContainer, { opacity: deleteIconOpacity }]}>
        <Icon name="trash-2" size={24} color="red" />
      </Animated.View>

      {/* 수정 창 (Modal) */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>타이머 수정</Text>
          <TextInput
            style={styles.input}
            placeholder="타이머 이름"
            value={nameInputValue}
            onChangeText={setNameInputValue}
          />
          <TextInput
            style={styles.input}
            placeholder="분"
            keyboardType="numeric"
            value={inputValue}
            onChangeText={setInputValue}
          />
          <View style={styles.switchContainer}>
            <Text>소수점 표기</Text>
            <Switch
              value={showDecimals}
              onValueChange={setShowDecimals}
            />
          </View>
          <View style={styles.modalButtons}>
            <Button title="저장" onPress={saveTime} />
            <Button title="취소" onPress={() => setIsModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// 초를 시, 분, 초로 포맷하는 함수
const formatTime = (seconds, showDecimals) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = showDecimals ? (seconds % 60).toFixed(2) : Math.floor(seconds % 60);

  return hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${showDecimals ? String(secs).padStart(5, '0') : String(secs).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${showDecimals ? String(secs).padStart(5, '0') : String(secs).padStart(2, '0')}`;
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity:  0.2,
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
    whiteSpace: 'nowrap', // 소수점 줄바꿈 방지
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
    shadowOffset: { width: 0, height: 2 },
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    width: '100%',
    textAlign: 'center',
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
});

export default TimerCard;
