import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const Timer = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

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
    setTime(0);
  };

  const addTime = () => {
    setTime(time + 60); // 60초 추가
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>{formatTime(time)}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Start" onPress={startTimer} disabled={isRunning || time === 0} />
        <Button title="Pause" onPress={pauseTimer} disabled={!isRunning} />
        <Button title="Reset" onPress={resetTimer} />
        <Button title="Add 1 Minute" onPress={addTime} />
      </View>
    </View>
  );
};

const formatTime = (seconds) => {
  const getMinutes = Math.floor(seconds / 60);
  const getSeconds = seconds % 60;
  const minutes = String(getMinutes).padStart(2, '0');
  const sec = String(getSeconds).padStart(2, '0');
  return `${minutes}:${sec}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 48,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
  },
});

export default Timer;
