import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, Text, Modal, Pressable } from 'react-native';
import UUID from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GroupTimerCard from '../components/GroupTimerCard';
import LinearGradient from 'react-native-linear-gradient';
import Icon from "react-native-vector-icons/MaterialIcons";

function GroupTimerScreen() {
    const [groups, setGroups] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);  // 모달 가시성 상태

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        try {
            const savedGroups = await AsyncStorage.getItem('GROUPS');
            if (savedGroups) {
                setGroups(JSON.parse(savedGroups));
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load groups.');
        }
    };

    const saveGroups = async (updatedGroups) => {
        try {
            await AsyncStorage.setItem('GROUPS', JSON.stringify(updatedGroups));
        } catch (error) {
            Alert.alert('Error', 'Failed to save groups.');
        }
    };

    const handleAddGroup = () => {
        const newGroup = { id: UUID.v4() };
        const updatedGroups = [...groups, newGroup];
        setGroups(updatedGroups);
        saveGroups(updatedGroups);
    };

    const handleDeleteGroup = id => {
        Alert.alert(
            '삭제 확인',
            '정말로 이 그룹을 삭제하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '삭제',
                    onPress: () => {
                        const updatedGroups = groups.filter(group => group.id !== id);
                        setGroups(updatedGroups);
                        saveGroups(updatedGroups);
                    }
                },
            ],
            { cancelable: true }
        );
    };

    const renderItem = ({ item }) => (
        <GroupTimerCard id={item.id} handleDeleteGroup={handleDeleteGroup} />
    );

    return (
        <LinearGradient
            colors={['#f0f4f8', '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <FlatList
                data={groups}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />

            {/* 사용법 안내 모달 */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(!modalVisible)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>타이머 사용법</Text>
                        <Text style={styles.instructionText}>• 타이머 카드를 클릭하여 시작 및 정지</Text>
                        <Text style={styles.instructionText}>• 왼쪽으로 드래그하여 초기화</Text>
                        <Text style={styles.instructionText}>• 오른쪽으로 드래그하여 삭제</Text>
                        <Text style={styles.instructionText}>• 타이머를 길게 눌러 수정</Text>

                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(!modalVisible)}
                        >
                            <Text style={styles.textStyle}>닫기</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* 플로팅 액션 버튼 */}

            <TouchableOpacity style={styles.addButton} onPress={handleAddGroup}>
                <Icon name="add" size={30} color="#000000" />
            </TouchableOpacity>
            {/* 사용법 버튼 */}
            <TouchableOpacity style={styles.helpButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.helpButtonText}>?</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 2,
        paddingVertical: 20,
    },
    addButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    fabIcon: {
        fontSize: 24,
        color: '#000',
    },
    helpButton: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        left: 20,
        bottom: 20,
    },
    helpButtonText: {
        fontSize: 24,
        color: '#000',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    buttonClose: {
        backgroundColor: '#2196F3',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    instructionText: {
        marginBottom: 5,
        textAlign: 'center',
        fontSize: 16,
    },
});

export default GroupTimerScreen;
