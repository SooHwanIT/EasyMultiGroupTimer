import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, LayoutAnimation, Platform, UIManager } from 'react-native';
import UUID from 'react-native-uuid';  // UUID 패키지 임포트
import TimerCard from './TimerCard';

// LayoutAnimation 설정 (Android에서 사용하려면 UIManager 설정 필요)
if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// 색상 상수 설정
const COLORS = {
    background: '#ffffff',        // 배경색: 흰색
    text: '#000000',              // 텍스트 색상: 검정색
    border: '#444444',            // 테두리 색상: 중간 회색
    buttonBackground: 'transparent', // 버튼 배경색: 투명
    buttonText: '#000000',        // 버튼 텍스트 색상: 검정색
    deleteButtonText: '#888888',  // 삭제 버튼 텍스트 색상: 연한 회색
};

const GroupTimerCard = ({ id, handleDeleteGroup }) => {
    const [timers, setTimers] = useState([]);
    const [groupName, setGroupName] = useState('그룹 이름');
    const [nameInputValue, setNameInputValue] = useState(groupName);

    // 각 타이머에 대한 Ref 배열을 생성합니다.
    const timerRefs = useRef([]);

    const handleStartAll = () => {
        const startAllTimers = () => {
            timerRefs.current.forEach(ref => ref?.startTimer());
        };

        if ('requestAnimationFrame' in window) {
            requestAnimationFrame(startAllTimers);
        } else {
            startAllTimers();
        }
    };

    const handlePauseAll = () => {
        const pauseAllTimers = () => {
            timerRefs.current.forEach(ref => ref?.pauseTimer());
        };

        if ('requestAnimationFrame' in window) {
            requestAnimationFrame(pauseAllTimers);
        } else {
            pauseAllTimers();
        }
    };

    const handleResetAll = () => {
        const resetAllTimers = () => {
            timerRefs.current.forEach(ref => ref?.resetTimer());
        };

        if ('requestAnimationFrame' in window) {
            requestAnimationFrame(resetAllTimers);
        } else {
            resetAllTimers();
        }
    };

    const handleDeleteTimer = id => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // 애니메이션 설정
        setTimers(prevTimers => prevTimers.filter(timerId => timerId.id !== id));
    };

    const handleAddTimer = () => {
        const newTimer = { id: UUID.v4() };  // UUID로 고유한 ID 생성
        setTimers([...timers, newTimer]);
    };

    const handleSaveGroupName = () => {
        setGroupName(nameInputValue);
    };

    const renderItem = ({ item, index }) => (
        <TimerCard
            ref={el => timerRefs.current[index] = el}
            id={item.id}
            onDelete={handleDeleteTimer}
        />
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TextInput
                    style={styles.groupNameInput}
                    value={nameInputValue}
                    onChangeText={setNameInputValue}
                    onEndEditing={handleSaveGroupName}
                    placeholderTextColor={COLORS.border} // 입력란 텍스트 색상
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddTimer}>
                    <Text style={styles.buttonText}>타이머 추가</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={timers}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.buttonStyle} onPress={handleStartAll}>
                    <Text style={styles.buttonText}>전체 시작</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonStyle} onPress={handlePauseAll}>
                    <Text style={styles.buttonText}>전체 멈춤</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonStyle} onPress={handleResetAll}>
                    <Text style={styles.buttonText}>전체 초기화</Text>
                </TouchableOpacity>
            </View>

            {/* 그룹 삭제 버튼 추가 (텍스트로 표시) */}
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteGroup(id)}
            >
                <Text style={styles.deleteButtonText}>그룹 삭제</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.background,
        flex: 1,
        padding: 10, // 기본 패딩 추가
        borderRadius: 20,
        marginBottom: 20, // 다른 그룹 카드와의 간격
        position: 'relative', // 삭제 버튼 위치를 위해 상대적 위치 설정
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    groupNameInput: {
        borderBottomWidth: 1,
        borderColor: COLORS.border,
        color: COLORS.text, // 텍스트 색상
        fontSize: 18,
        flex: 1,
        marginRight: 10,
        paddingVertical: 5, // 텍스트 입력 상자 패딩
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 30,
        paddingBottom: 10,
    },
    buttonStyle: {
        backgroundColor: COLORS.buttonBackground, // 투명 배경색
        padding: 10,
        borderRadius: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: COLORS.buttonText,
        fontSize: 16,
    },
    addButton: {
        padding: 10,
        alignItems: 'center',
    },
    deleteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    deleteButtonText: {
        color: COLORS.deleteButtonText,
        fontSize: 14,
    },
});

export default GroupTimerCard;
