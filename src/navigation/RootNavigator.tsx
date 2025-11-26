import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { RootStackParamList } from './types';

import Welcomecreen from '../screens/Welcome';
import SigninScreen from '../screens/auth/Signin';
import SignupScreen from '../screens/auth/Signup';
import AirtimeScreen from '../screens/bill/Airtime';
import CableTvScreen from '../screens/bill/CableTv';
import DataScreen from '../screens/bill/Data';
import ElectricityScreen from '../screens/bill/Electricity';
import TabNavigator from './TabNavigator';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={Welcomecreen} />
      <Stack.Screen name="Signin" component={SigninScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Airtime" component={AirtimeScreen} />
      <Stack.Screen name="Data" component={DataScreen} />
      <Stack.Screen name="CableTv" component={CableTvScreen} />
      <Stack.Screen name="Electricity" component={ElectricityScreen} />
      <Stack.Screen name="Tabs" component={TabNavigator} />
    </Stack.Navigator>
  );
}
