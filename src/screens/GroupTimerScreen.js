import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, Text } from 'react-native';
import UUID from 'react-native-uuid';  // UUID 패키지 임포트
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage 임포트
import GroupTimerCard from '../components/GroupTimerCard';

function GroupTimerScreen() {
    const [groups, setGroups] = useState([]);

    // 초기 로드 시 저장된 그룹 데이터 불러오기
    useEffect(() => {
        loadGroups();
    }, []);

    // 그룹 데이터 불러오기
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

    // 그룹 데이터 저장
    const saveGroups = async (updatedGroups) => {
        try {
            await AsyncStorage.setItem('GROUPS', JSON.stringify(updatedGroups));
        } catch (error) {
            Alert.alert('Error', 'Failed to save groups.');
        }
    };

    const handleAddGroup = () => {
        const newGroup = { id: UUID.v4() };  // UUID로 고유한 ID 생성
        const updatedGroups = [...groups, newGroup];
        setGroups(updatedGroups);
        saveGroups(updatedGroups);  // 그룹 추가 후 데이터 저장
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
                        saveGroups(updatedGroups);  // 그룹 삭제 후 데이터 저장
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
        <View style={styles.container}>
            <FlatList
                data={groups}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />

            {/* 플로팅 액션 버튼 */}
            <TouchableOpacity style={styles.fab} onPress={handleAddGroup}>
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 2,
        paddingVertical: 20,
        backgroundColor: '#f0f4f8',
    },
    fab: {
        position: 'absolute',
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        right: 20,
        bottom: 20,
    },
    fabIcon: {
        fontSize: 24,
        color: '#000',
    },
});

export default GroupTimerScreen;
