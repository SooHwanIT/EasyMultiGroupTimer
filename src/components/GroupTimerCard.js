import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, TextInput, FlatList, LayoutAnimation, Platform, UIManager } from 'react-native';
import UUID from 'react-native-uuid';  // UUID 패키지 임포트
import TimerCard from './TimerCard';

// LayoutAnimation 설정 (Android에서 사용하려면 UIManager 설정 필요)
if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}


const GroupTimerCard = () => {
    const [timers, setTimers] = useState([{ id: UUID.v4() }, { id: UUID.v4() }, { id: UUID.v4() }]);
    const [groupName, setGroupName] = useState('그룹 이름');
    const [nameInputValue, setNameInputValue] = useState(groupName);



    // 각 타이머에 대한 Ref 배열을 생성합니다.
    const timerRefs = useRef([]);

    const handleStartAll = () => {
        timerRefs.current.forEach(ref => ref?.startTimer()); // 모든 타이머 시작
    };

    const handlePauseAll = () => {
        timerRefs.current.forEach(ref => ref?.pauseTimer()); // 모든 타이머 멈춤
    };

    const handleResetAll = () => {
        timerRefs.current.forEach(ref => ref?.resetTimer()); // 모든 타이머 초기화
    };

    const handleDeleteTimer = id => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // 애니메이션 설정
        setTimers(prevTimers => prevTimers.filter(timerId => timerId.id !== id));
    };

    const handleAddTimer = () => {
        const newTimer = {id: UUID.v4()} ;  // UUID로 고유한 ID 생성
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
                />
                <Button title="타이머 추가" onPress={handleAddTimer} />
            </View>

            <FlatList
                data={timers}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />

            <View style={styles.buttonContainer}>
                <Button title="전체 시작" onPress={handleStartAll} />
                <Button title="전체 멈춤" onPress={handlePauseAll} />
                <Button title="전체 초기화" onPress={handleResetAll} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f0f0f0',
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    groupNameInput: {
        borderBottomWidth: 1,
        borderColor: '#ccc',
        fontSize: 18,
        flex: 1,
        marginRight: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
});

export default GroupTimerCard;
