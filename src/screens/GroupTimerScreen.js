import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Button, Alert } from 'react-native';
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
        <GroupTimerCard />
        <Button
            title="그룹 삭제"
            color="red"
            onPress={() => handleDeleteGroup(item.id)}
        />
      </View>
  );

  return (
      <View style={styles.container}>
        <FlatList
            data={groups}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ListHeaderComponent={
              <Button title="그룹 추가" onPress={handleAddGroup} />
            }
        />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  groupContainer: {
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
});

export default GroupTimerScreen;
