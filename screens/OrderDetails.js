import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ChevronLeftIcon,
  PhoneIcon,
  CheckIcon
} from 'react-native-heroicons/solid';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../constants/firebase';

const { width, height } = Dimensions.get('window');
const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const OrderDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { order: initialOrder } = route.params;
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Real-time listener for current order
    const unsub = onSnapshot(doc(db, 'orders', initialOrder.id), (docSnap) => {
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
      }
    });

    return () => unsub();
  }, [initialOrder.id]);

  const statuses = [
    'Pending Payment', 'Paid', 'Accepted', 'Preparing',
    'Ready For Pickup', 'Picked Up', 'On The Way', 'Delivered'
  ];

  const currentStatusIndex = statuses.indexOf(order.orderStatus);

  const getStatusDetails = (status) => {
    switch (status) {
      case 'Accepted': return { title: 'Order Accepted', desc: 'Restaurant is reviewing your order' };
      case 'Preparing': return { title: 'Preparing Food', desc: 'Chef is making your delicious meal' };
      case 'Ready For Pickup': return { title: 'Ready For Pickup', desc: 'Order is ready for the rider' };
      case 'Picked Up': return { title: 'Picked Up', desc: 'Rider has collected your order' };
      case 'On The Way': return { title: 'On The Way', desc: 'Rider is heading to your location' };
      case 'Delivered': return { title: 'Delivered', desc: 'Enjoy your meal!' };
      default: return { title: status, desc: '' };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-50">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-gray-100 p-2 rounded-full"
        >
          <ChevronLeftIcon size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Track Order</Text>
        <TouchableOpacity className="bg-gray-100 p-2 rounded-full">
          <PhoneIcon size={20} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Verification Code Card */}
        <View className="mx-5 mt-6 bg-orange-500 p-6 rounded-[32px] items-center shadow-lg shadow-orange-500/30">
          <Text className="text-white/80 font-medium mb-2">Delivery Verification Code</Text>
          <View className="flex-row gap-3">
            {order.deliveryCode?.split('').map((char, i) => (
              <View key={i} className="bg-white/20 w-12 h-16 rounded-2xl items-center justify-center border border-white/30">
                <Text className="text-white text-2xl font-black">{char}</Text>
              </View>
            )) || <Text className="text-white text-4xl font-black">----</Text>}
          </View>
          <Text className="text-white/80 text-xs mt-4 text-center">Give this code to the rider when your food arrives</Text>
        </View>

        {/* Restaurant Info */}
        <View className="mx-5 mt-8 flex-row items-center bg-gray-50 p-4 rounded-3xl">
          <Image
            source={{ uri: order.foodItems?.[0]?.imageUrl }}
            className="h-16 w-16 rounded-2xl"
          />
          <View className="ml-4 flex-1">
            <Text className="text-lg font-bold text-gray-900">{order.restaurantName}</Text>
            <Text className="text-gray-500 text-xs">Order #{order.orderNumber || order.id.substring(0, 6)}</Text>
          </View>
          <View className="items-end">
            <Text className="text-gray-900 font-extrabold">₦{order.totalAmount.toLocaleString()}</Text>
            <Text className="text-gray-500 text-xs">{order.foodItems?.length} items</Text>
          </View>
        </View>

        {/* Timeline */}
        <View className="mx-5 mt-10">
          <Text className="text-xl font-bold text-gray-900 mb-6">Order Timeline</Text>

          {statuses.slice(2).map((status, index) => {
            const actualIndex = index + 2;
            const isCompleted = actualIndex < currentStatusIndex;
            const isCurrent = actualIndex === currentStatusIndex;
            const details = getStatusDetails(status);

            return (
              <View key={status} className="flex-row">
                <View className="items-center mr-4">
                  <View className={`h-6 w-6 rounded-full items-center justify-center ${isCompleted ? 'bg-orange-500' : isCurrent ? 'bg-orange-500' : 'bg-gray-200'}`}>
                    {isCompleted ? (
                      <CheckIcon size={14} color="white" />
                    ) : (
                      <View className={`h-2 w-2 rounded-full ${isCurrent ? 'bg-white' : 'transparent'}`} />
                    )}
                  </View>
                  {index < statuses.slice(2).length - 1 && (
                    <View className={`w-0.5 h-12 ${actualIndex < currentStatusIndex ? 'bg-orange-500' : 'bg-gray-200'}`} />
                  )}
                </View>
                <View className="pb-8">
                  <Text className={`text-base font-bold ${isCurrent ? 'text-orange-500' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                    {details.title}
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">{details.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Cancel Order Button if still pending */}
      {order.orderStatus === 'Pending Payment' && (
        <View className="px-5 pb-6">
          <TouchableOpacity className="bg-red-50 py-4 rounded-2xl items-center border border-red-100">
            <Text className="text-red-500 font-bold">Cancel Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default OrderDetails;
