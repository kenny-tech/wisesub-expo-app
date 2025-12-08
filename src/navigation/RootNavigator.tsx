import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { RootStackParamList } from './types';

import ForgotPassword from '../screens/auth/ForgotPassword';
import ResetPassword from '../screens/auth/ResetPassword';
import Signin from '../screens/auth/Signin';
import Signup from '../screens/auth/Signup';
import Verification from '../screens/auth/Verification';
import Airtime from '../screens/bill/Airtime';
import CableTv from '../screens/bill/CableTv';
import Data from '../screens/bill/Data';
import Electricity from '../screens/bill/Electricity';
import ChangePassword from '../screens/ChangePassword';
import DeleteAccount from '../screens/DeleteAccount';
import FundAmount from '../screens/FundAmount';
import ProfileInfo from '../screens/ProfileInfo';
import Referral from '../screens/Referral';
import Support from '../screens/Support';
import Welcome from '../screens/Welcome';
import TabNavigator from './TabNavigator';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Signin" component={Signin} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="Airtime" component={Airtime} />
      <Stack.Screen name="Data" component={Data} />
      <Stack.Screen name="CableTv" component={CableTv} />
      <Stack.Screen name="Electricity" component={Electricity} />
      <Stack.Screen name="Referral" component={Referral} />
      <Stack.Screen name="ProfileInfo" component={ProfileInfo} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="Support" component={Support} />
      <Stack.Screen name="FundAmount" component={FundAmount} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccount} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="Verification" component={Verification} />
      <Stack.Screen name="Tabs" component={TabNavigator} />
    </Stack.Navigator>
  );
}
