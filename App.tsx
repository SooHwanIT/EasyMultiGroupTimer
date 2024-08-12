import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GroupTimerScreen from './src/screens/GroupTimerScreen';
import SingleTimerScreen from './src/screens/SingleTimerScreen';
import TemporaryTimerScreen from './src/screens/TemporaryTimerScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
      {/*  <Tab.Screen name="Group" component={GroupTimerScreen} />*/}
        <Tab.Screen name="Single" component={SingleTimerScreen} />
        <Tab.Screen name="Temporary" component={TemporaryTimerScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
