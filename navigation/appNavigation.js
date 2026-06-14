import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LogBox, ActivityIndicator, View } from 'react-native';
import FoodDetailsScreen from '../screens/FoodDetailsScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CartScreen from '../screens/CartScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PayStackPayment from '../screens/PayStackPayment';
import OrderSuccess from '../screens/OrderSuccessScreen';

import SavedItemsScreen from '../screens/SavedItemsScreen';
import OrderDetails from '../screens/OrderDetails';
import useAuth from '../hooks/useAuth';
import RestaurantDetailsScreen from '../screens/RestaurantDetailsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

export default function AppNavigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FFC107" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? 'MainTabs' : 'Welcome'}>
        {user ? (
          <>
            {/* Main tab navigator — contains Home, Marketplace, Orders */}
            <Stack.Screen name="MainTabs" options={{ headerShown: false }} component={TabNavigator} />
            {/* Detail screens pushed on top of tabs */}
            <Stack.Screen name="FoodDetails" options={{ headerShown: false }} component={FoodDetailsScreen} />
            <Stack.Screen name="Profile" options={{ headerShown: false }} component={ProfileScreen} />
            <Stack.Screen name="Cart" options={{ headerShown: false }} component={CartScreen} />
            <Stack.Screen name="EditProfile" options={{ headerShown: false }} component={EditProfileScreen} />
            <Stack.Screen name="PayStackPayment" options={{ headerShown: false }} component={PayStackPayment} />

            <Stack.Screen name="OrderSuccess" options={{ headerShown: false }} component={OrderSuccess} />
            <Stack.Screen name="SavedItems" options={{ headerShown: false }} component={SavedItemsScreen} />
            <Stack.Screen name="OrderDetails" options={{ headerShown: false }} component={OrderDetails} />
            <Stack.Screen name="RestaurantDetails" options={{ headerShown: false }} component={RestaurantDetailsScreen} />
            <Stack.Screen name="Notifications" options={{ headerShown: false }} component={NotificationsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" options={{ headerShown: false }} component={WelcomeScreen} />
            <Stack.Screen name="Login" options={{ headerShown: false }} component={LoginScreen} />
            <Stack.Screen name="SignUp" options={{ headerShown: false }} component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
