import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; // useNavigation 임포트

function OptionTimerScreen() {
  const navigation = useNavigation(); // useNavigation 훅 사용

  // 모든 타이머 삭제 함수
  const handleDeleteAllTimers = async () => {
    Alert.alert(
        '모든 타이머 삭제',
        '정말로 모든 타이머를 삭제하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '삭제',
            onPress: async () => {
              try {
                // AsyncStorage에서 모든 데이터 삭제
                await AsyncStorage.clear();
                Alert.alert('성공', '모든 타이머가 삭제되었습니다.');

                // 화면 리셋 (네비게이션 상태 초기화)
                navigation.reset({
                  index: 0,
                  routes: [{ name: '싱글' }], // 'SingleTimerScreen'을 실제 화면 이름으로 변경
                });
              } catch (error) {
                Alert.alert('오류', '타이머 삭제 중 오류가 발생했습니다.');
              }
            },
          },
        ],
        { cancelable: true }
    );
  };

  const handlePress = () => {
    Alert.alert('알림', '개발 중입니다');
  };

  return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>옵션 설정</Text>

        <TouchableOpacity style={styles.optionContainer} onPress={handlePress}>
          <Text style={styles.optionTitle}>알림 설정</Text>
          <Text style={styles.optionValue}>켜짐</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionContainer} onPress={handlePress}>
          <Text style={styles.optionTitle}>테마 설정</Text>
          <Text style={styles.optionValue}>어두운 모드</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionContainer} onPress={handlePress}>
          <Text style={styles.optionTitle}>사운드 설정</Text>
          <Text style={styles.optionValue}>알림 소리 1</Text>
        </TouchableOpacity>

        {/* 모든 타이머 삭제 버튼 */}
        <TouchableOpacity style={[styles.optionContainer, styles.deleteButton]} onPress={handleDeleteAllTimers}>
          <Text style={[styles.optionTitle, { color: '#ff5555' }]}>모든 타이머 삭제</Text>
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
  deleteButton: {
    backgroundColor: '#ffe6e6', // 삭제 버튼 배경색 변경
  },
});

export default OptionTimerScreen;
