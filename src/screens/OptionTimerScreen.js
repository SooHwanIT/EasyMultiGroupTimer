import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert} from 'react-native';

function OptionTimerScreen() {

  const handlePress = () => {
    Alert.alert('알림', '개발 중입니다');
  };

  return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>옵션 설정</Text>

        <TouchableOpacity style={styles.optionContainer}
                          onPress={handlePress}>
          <Text style={styles.optionTitle}>알림 설정</Text>
          <Text style={styles.optionValue}>켜짐</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionContainer}
                          onPress={handlePress}>
          <Text style={styles.optionTitle}>테마 설정</Text>
          <Text style={styles.optionValue}>어두운 모드</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionContainer}
                          onPress={handlePress}>
          <Text style={styles.optionTitle}>사운드 설정</Text>
          <Text style={styles.optionValue}>알림 소리 1</Text>
        </TouchableOpacity>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  optionContainer: {
    marginBottom: 15,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
  },
  optionValue: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
});

export default OptionTimerScreen;
