import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, Text } from 'react-native';
import UUID from 'react-native-uuid';  // UUID 패키지 임포트
import GroupTimerCard from '../components/GroupTimerCard';

function GroupTimerScreen() {
    const [groups, setGroups] = useState([]);

    const handleAddGroup = () => {
        const newGroup = { id: UUID.v4() };  // UUID로 고유한 ID 생성
        setGroups([...groups, newGroup]);
    };

    const handleDeleteGroup = id => {
        Alert.alert(
            '삭제 확인',
            '정말로 이 그룹을 삭제하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                { text: '삭제', onPress: () => setGroups(groups.filter(group => group.id !== id)) },
            ],
            { cancelable: true }
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.groupContainer}>
            <GroupTimerCard id = {item.id} handleDeleteGroup={handleDeleteGroup}/>
        </View>
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
        padding: 10,
        paddingVertical: 20,
        backgroundColor: '#f0f0f0',
    },
    groupContainer: {
        marginBottom: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 5,
        // elevation: 2,
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
