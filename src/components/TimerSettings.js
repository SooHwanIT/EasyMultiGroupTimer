// TimerSettings.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TimerSettings = ({ route, navigation }) => {
  const { timer } = route.params;
  const [name, setName] = useState(timer.name || '');
  const [minutes, setMinutes] = useState(Math.floor(timer.time / 60).toString());
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(timer.isNotificationEnabled || false);

  const saveSettings = () => {
    const timeInSeconds = parseInt(minutes, 10) * 60;
    // Pass back the updated timer data to the previous screen
    navigation.navigate('TimerCard', {
      timer: {
        ...timer,
        name,
        time: timeInSeconds,
        isNotificationEnabled,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Timer</Text>
      <TextInput
        style={styles.input}
        placeholder="Timer Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Minutes"
        keyboardType="numeric"
        value={minutes}
        onChangeText={setMinutes}
      />
      <View style={styles.switchContainer}>
        <Text>Enable Notification</Text>
        <Switch
          onValueChange={setIsNotificationEnabled}
          value={isNotificationEnabled}
        />
      </View>
      <TouchableOpacity onPress={saveSettings} style={styles.saveButton}>
        <Icon name="check" size={30} color="white" />
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
  },
});

export default TimerSettings;
