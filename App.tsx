import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from "react-native-vector-icons/Ionicons"
import GroupTimerScreen from './src/screens/GroupTimerScreen';
import SingleTimerScreen from './src/screens/SingleTimerScreen';
import OptionTimerScreen from './src/screens/OptionTimerScreen';

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Tab.Navigator>
                <Tab.Screen
                    name="싱글"
                    component={SingleTimerScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="timer-outline" size={size} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="그룹"
                    component={GroupTimerScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="people-outline" size={size} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="옵션"
                    component={OptionTimerScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="settings-outline" size={size} color={color} />
                        ),
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
