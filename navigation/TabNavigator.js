import React from 'react';
import { View, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import RestaurantListScreen from '../screens/RestaurantListScreen';
import OrdersListScreen from '../screens/OrdersListScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Octicons } from '@expo/vector-icons';
import {
    HomeIcon,
    BuildingStorefrontIcon,
    ShoppingBagIcon,
} from 'react-native-heroicons/solid';
import {
    HomeIcon as HomeIconLinear,
    BuildingStorefrontIcon as BuildingStorefrontIconLinear,
    ShoppingBagIcon as ShoppingBagIconLinear
} from 'react-native-heroicons/outline';

const Tab = createBottomTabNavigator();

const ACTIVE_COLOR = '#000080';   // teal-700 – matches the image's green active icon
const INACTIVE_COLOR = '#9CA3AF'; // gray-400

export default function TabNavigator() {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: ACTIVE_COLOR,
                tabBarInactiveTintColor: INACTIVE_COLOR,
                tabBarShowLabel: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 0.25,
                    borderTopColor: '#E5E7EB',
                    height: 58 + insets.bottom,
                    paddingBottom: insets.bottom > 0 ? insets.bottom - 2 : 12,
                    paddingTop: 10,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 2,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Octicons name="home-fill" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Marketplace"
                component={RestaurantListScreen}
                options={{
                    tabBarLabel: 'Marketplace',
                    tabBarIcon: ({ focused, color, size }) => (
                        focused ? <BuildingStorefrontIcon size={size} color={color} /> : <BuildingStorefrontIconLinear size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="OrdersList"
                component={OrdersListScreen}
                options={{
                    tabBarLabel: 'Orders',
                    tabBarIcon: ({ focused, color, size }) => (
                        focused ? <ShoppingBagIcon size={size} color={color} /> : <ShoppingBagIconLinear size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
