import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import DetailScreen from '../screens/DetailScreen';
import ListScreen from '../screens/ListScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

export type RootStackParamList = {
  Home: undefined;
  List: undefined;
  Detail: { id: string } | undefined;
  Login: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
        <Stack.Screen name="List" component={ListScreen} options={{ title: 'Danh sách' }} />
        <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Chi tiết' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Đăng nhập' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Đăng ký' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
