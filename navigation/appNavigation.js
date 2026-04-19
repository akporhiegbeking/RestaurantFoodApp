import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import { LogBox, ActivityIndicator, View } from 'react-native';
import FoodDetailsScreen from '../screens/FoodDetailsScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CartScreen from '../screens/CartScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PayStackPayment from '../screens/PayStackPayment';
import OrderSuccess from '../screens/OrderSuccessScreen';
import SavedItemsScreen from '../screens/SavedItemsScreen';
import OrdersListScreen from '../screens/OrdersListScreen';
import useAuth from '../hooks/useAuth'; 

const Stack = createNativeStackNavigator();

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

export default function AppNavigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? 'Home' : 'Login'}>
        {user ? (
          <>
            <Stack.Screen name="Home" options={{headerShown: false}} component={HomeScreen} />
            <Stack.Screen name="FoodDetails" options={{headerShown: false}} component={FoodDetailsScreen} />
            <Stack.Screen name="Profile" options={{headerShown: false}} component={ProfileScreen} />
            <Stack.Screen name="Cart" options={{headerShown: false}} component={CartScreen} />
            <Stack.Screen name="EditProfile" options={{headerShown: false}} component={EditProfileScreen} />
            <Stack.Screen name="PayStackPayment" options={{headerShown: false}} component={PayStackPayment} />
            <Stack.Screen name="OrderSuccess" options={{headerShown: false}}  component={OrderSuccess} />
            <Stack.Screen name="SavedItems" options={{headerShown: false}} component={SavedItemsScreen} />
            <Stack.Screen name="OrdersList" options={{headerShown: false}} component={OrdersListScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" options={{headerShown: false}} component={LoginScreen} />
            <Stack.Screen name="SignUp" options={{headerShown: false}} component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
