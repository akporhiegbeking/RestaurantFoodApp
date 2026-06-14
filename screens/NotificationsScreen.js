import {
    View, Text, FlatList, TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../constants/firebase';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

const NotificationsScreen = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        if (!auth.currentUser) return;

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', auth.currentUser.uid),
            orderBy('createdAt', 'desc')
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(data);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const markAsRead = async (id) => {
        try {
            await updateDoc(doc(db, 'notifications', id), { isRead: true });
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            className={`flex-row p-4 mb-3 rounded-3xl border ${item.isRead ? 'bg-white border-gray-100' : 'bg-orange-50 border-orange-100'}`}
            onPress={() => {
                markAsRead(item.id);
                if (item.orderId) {
                    // Navigate to order details if available
                    // Since we need the order object, we might need to fetch it first or just navigate to OrdersList
                    navigation.navigate('MainTabs', { screen: 'OrdersList' });
                }
            }}
        >
            <View className={`h-12 w-12 rounded-2xl items-center justify-center ${item.isRead ? 'bg-gray-100' : 'bg-orange-200'}`}>
                {item.type === 'order' ? (
                    <Ionicons name="basket" size={24} color={item.isRead ? '#6B7280' : '#F59E0B'} />
                ) : (
                    <Ionicons name="pricetag" size={24} color={item.isRead ? '#6B7280' : '#F59E0B'} />
                )}
            </View>
            <View className="ml-4 flex-1">
                <View className="flex-row justify-between items-start">
                    <Text className={`text-base flex-1 ${item.isRead ? 'text-gray-700 font-medium' : 'text-gray-900 font-bold'}`}>
                        {item.title}
                    </Text>
                    <Text className="text-[10px] text-gray-500 ml-2">
                        {item.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>{item.body}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar style="dark" />
            <View className="flex-1 px-5">
                {/* Header */}
                <View className="flex-row justify-between items-center py-4">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="bg-white p-2 rounded-full shadow-sm"
                    >
                        <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">Notifications</Text>
                    <View className="w-10" />
                </View>

                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#F59E0B" />
                    </View>
                ) : notifications.length === 0 ? (
                    <View className="flex-1 justify-center items-center">
                        <Ionicons name="notifications" size={64} color="#D1D5DB" />
                        <Text className="text-xl font-bold text-gray-400 mt-4">All caught up!</Text>
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

export default NotificationsScreen;
