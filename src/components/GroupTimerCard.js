import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, LayoutAnimation, Platform, UIManager, Alert } from 'react-native';
import UUID from 'react-native-uuid';  // UUID 패키지 임포트
import TimerCard from './TimerCard';
import Modal from 'react-native-modal'; // 모달 패키지 임포트
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Entypo'; // 세로 점 3개 아이콘을 위한 패키지

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
    const [isOptionsModalVisible, setOptionsModalVisible] = useState(false); // 옵션 모달 상태 관리

    // 각 타이머에 대한 Ref 배열을 생성합니다.
    const timerRefs = useRef([]);

    useEffect(() => {
        loadGroupData();
    }, []);

    // 그룹 데이터 불러오기
    const loadGroupData = async () => {
        try {
            const savedGroupData = await AsyncStorage.getItem(`GROUP_TIMER_${id}`);
            if (savedGroupData) {
                const parsedData = JSON.parse(savedGroupData);
                setTimers(parsedData.timers);
                setGroupName(parsedData.groupName);
                setNameInputValue(parsedData.groupName);  // 수정 가능한 입력 필드에 값 설정
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load group data.');
        }
    };

    // 그룹 데이터 저장
    const saveGroupData = async (data) => {
        try {
            await AsyncStorage.setItem(`GROUP_TIMER_${id}`, JSON.stringify(data));
        } catch (error) {
            Alert.alert('Error', 'Failed to save group data.');
        }
    };

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
        const updatedTimers = timers.filter(timerId => timerId.id !== id);
        setTimers(updatedTimers);
        saveGroupData({ timers: updatedTimers, groupName });  // 타이머 삭제 후 데이터 저장
    };

    const handleAddTimer = () => {
        const newTimer = { id: UUID.v4() };  // UUID로 고유한 ID 생성
        const updatedTimers = [...timers, newTimer];
        setTimers(updatedTimers);
        saveGroupData({ timers: updatedTimers, groupName });  // 타이머 추가 후 데이터 저장
    };

    const handleSaveGroupName = () => {
        setGroupName(nameInputValue);
        saveGroupData({ timers, groupName: nameInputValue });  // 그룹 이름 수정 후 데이터 저장
    };

    const renderItem = ({ item, index }) => (
        <TimerCard
            ref={el => timerRefs.current[index] = el}
            id={item.id}
            onDelete={handleDeleteTimer}
        />
    );

    // 옵션 모달 표시 토글 함수
    const toggleOptionsModal = () => {
        setOptionsModalVisible(!isOptionsModalVisible);
    };

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
                <TouchableOpacity onPress={toggleOptionsModal}>
                    <Icon name="dots-three-vertical" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={timers}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />

            {/* 타이머가 1개 이상일 때만 버튼들이 보이도록 조건 추가 */}
            {timers.length > 0 && (
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
            )}

            {/* 옵션 모달 */}
            <Modal isVisible={isOptionsModalVisible} onBackdropPress={toggleOptionsModal}>
                <View style={styles.modalContent}>
                    <TouchableOpacity onPress={() => { /* 수정 기능 구현 */ toggleOptionsModal(); }}>
                        <Text style={styles.modalOptionText}>수정</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { handleDeleteGroup(id); toggleOptionsModal(); }}>
                        <Text style={styles.modalOptionText}>삭제</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={toggleOptionsModal}>
                        <Text style={styles.modalCancelText}>취소</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
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
        borderColor: COLORS.border,
        color: COLORS.text, // 텍스트 색상
        fontSize: 18,
        flex: 1,
        marginRight: 10,
        marginLeft: 12,
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
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalOptionText: {
        fontSize: 16,
        marginBottom: 10,
    },
    modalCancelText: {
        fontSize: 16,
        color: 'blue',
    },
});

export default GroupTimerCard;
