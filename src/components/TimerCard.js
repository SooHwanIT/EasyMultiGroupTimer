import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Button, Animated, PanResponder } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';  // Feather 아이콘 임포트
import Modal from 'react-native-modal';

const TimerCard = ({ id, onDelete }) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [timerName, setTimerName] = useState('타이머 이름');
  const [nameInputValue, setNameInputValue] = useState(timerName);
  const [pressStart, setPressStart] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;
  const longPressDuration = 1000; // 롱프레스 시간 1초로 설정
  const longPressTimerRef = useRef(null);
  const defaultTime = 30 * 60; // 기본 시간(30분)

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
    setTime(defaultTime); // 기본 시간으로 리셋
  };

  const saveTime = () => {
    const timeInSeconds = parseInt(inputValue, 10) * 60;
    setTime(timeInSeconds);
    setIsModalVisible(false);
    setInputValue('');
    setTimerName(nameInputValue); // 이름 저장
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
      if (!isDragging) { // 드래그가 아닌 경우에만 수정 창 열기
        setIsModalVisible(true);
      }
    }, longPressDuration);
  };

  const handlePressOut = () => {
    clearTimeout(longPressTimerRef.current); // 롱프레스 타이머 취소
    if (!isDragging && Date.now() - pressStart < longPressDuration) {
      // 짧은 클릭이면서 드래그가 아닌 경우에만 스위치 토글
      toggleTimer();
    }
    setPressStart(null);
    setIsDragging(false);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (e, gestureState) => {
        // 일정한 움직임이 있을 때 팬 핸들러를 활성화
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
        setIsDragging(true); // 드래그 시작 시 설정
        clearTimeout(longPressTimerRef.current); // 드래그가 시작되면 롱프레스 타이머를 취소
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (e, gestureState) => {
        // 드래그 범위 제한
        const dragX = Math.max(-80, Math.min(80, gestureState.dx));
        pan.setValue({ x: dragX, y: 0 });
      },
      onPanResponderRelease: (e, { dx }) => {
        setIsDragging(false); // 드래그가 끝난 후 설정
        pan.flattenOffset(); // 오프셋을 플래튼

        if (dx < -100) {
          // 왼쪽으로 스와이프, 삭제 동작 수행
          onDelete(id);
        } else if (dx > 100) {
          // 오른쪽으로 스와이프, 리셋 동작 수행
          resetTimer();
        }

        // 원래 위치로 되돌리기 위한 애니메이션
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 }, // (0, 0) 위치로 되돌림
          friction: 7, // 부드러운 반동을 위한 마찰 설정
          tension: 40, // 반동 효과를 위한 텐션 설정
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
          <Text style={styles.timeText}>{formatTime(time)}</Text>
          <View style={styles.timerInfo}>
            <Text style={styles.timerName}>{timerName}</Text>
            <Text style={styles.timerDetails}>{formatTime(time)}</Text>
          </View>
          <TouchableOpacity style={styles.customSwitch} onPress={toggleTimer}>
            <View style={[styles.circle, isEnabled && styles.circleEnabled]} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.actionContainer, styles.refreshContainer, { opacity: refreshIconOpacity }]}>
        <Icon name="refresh-cw" size={30} color="#007BFF" />
      </Animated.View>

      <Animated.View style={[styles.actionContainer, styles.deleteContainer, { opacity: deleteIconOpacity }]}>
        <Icon name="trash-2" size={30} color="red" />
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
          <View style={styles.modalButtons}>
            <Button title="저장" onPress={saveTime} />
            <Button title="취소" onPress={() => setIsModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// 초를 분과 초로 포맷하는 함수
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative', // 액션 아이콘들이 이 컨테이너를 기준으로 배치되도록 함
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
    zIndex: 1, // 카드가 액션 아이콘들 위에 위치하도록 설정
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent:    'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 36,  // 시간 텍스트 크기를 줄여 세로 공간을 절약
    fontWeight: 'bold',
    textAlign: 'left',  // 텍스트를 왼쪽으로 정렬
    flex: 1,
  },
  timerInfo: {
    alignItems: 'flex-end', // 이름과 시간을 오른쪽 아래에 배치
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
    backgroundColor: '#007BFF',  // 활성화된 상태의 원 색상
    alignSelf: 'flex-end',  // 활성화된 상태에서 원을 오른쪽으로 이동
  },
  actionContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    height: 60, // 높이를 줄여서 세로로 얇게 조정
    padding: 20,
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
    zIndex: 0, // 아이콘이 카드 뒤에 위치하도록 설정
  },
  refreshContainer: {
    left: 0,
    backgroundColor: '#e0f7fa', // 새로고침 아이콘의 배경색(밝은 파란색)
  },
  deleteContainer: {
    right: 0,
    backgroundColor: '#ffebee', // 삭제 아이콘의 배경색(밝은 빨간색)
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default TimerCard;

