// src/components/TimerCard.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, TextInput, Button } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';  // Feather 아이콘 임포트
import Modal from 'react-native-modal';

const TimerCard = ({ onDelete }) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

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

  const saveTime = () => {
    const timeInSeconds = parseInt(inputValue, 10) * 60;
    setTime(timeInSeconds);
    setIsModalVisible(false);
    setInputValue('');
  };

  const toggleSwitch = () => {
    setIsEnabled((prev) => !prev);
    if (!isEnabled) {
      startTimer();
    } else {
      pauseTimer();
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.timerSection}>
          <Text style={styles.timeText}>{formatTime(time)}</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity onPress={resetTimer}>
              <Icon name="refresh-cw" size={30} color="#007BFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsModalVisible(true)}>
              <Icon name="edit-3" size={30} color="#007BFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete}>
              <Icon name="trash-2" size={30} color="red" />
            </TouchableOpacity>
          </View>
        </View>
        <Switch
          style={styles.switch}
          onValueChange={toggleSwitch}
          value={isEnabled}
          thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
        />
      </View>

      {/* Bottom Sheet Modal */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Timer</Text>
          <TextInput
            style={styles.input}
            placeholder="Minutes"
            keyboardType="numeric"
            value={inputValue}
            onChangeText={setInputValue}
          />
          <View style={styles.modalButtons}>
            <Button title="Save" onPress={saveTime} />
            <Button title="Cancel" onPress={() => setIsModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    width: '100%',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerSection: {
    flex: 1,
  },
  timeText: {
    fontSize: 48,
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  switch: {
    marginLeft: 20,
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
