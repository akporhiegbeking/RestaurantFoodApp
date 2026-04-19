import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bars3CenterLeftIcon, ShoppingCartIcon } from 'react-native-heroicons/solid';
import * as Animatable from 'react-native-animatable';
import FoodCard from '../components/FoodCard';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../constants/firebase';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

export default function HomeScreen() {
  const [foodItems, setFoodItems] = useState([]);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFoodItems = async () => {
    try {
      const foodCollection = collection(db, 'food');
      const foodSnapshot = await getDocs(foodCollection);
      const foodList = foodSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFoodItems(foodList);
      console.log("Fetched Food Items: ", foodList);
    } catch (error) {
      console.error("Error fetching food items: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFoodItems().then(() => setRefreshing(false));
  }, []);
  
  return (
    <View className="flex-1 relative">
      <Image blurRadius={40} source={require('../assets/images/background.png')} className="absolute w-full h-full" />
      <SafeAreaView className="flex-1">
        {/* Top Buttons */}
        <View className="flex-row justify-between items-center mx-4">
         
          <TouchableOpacity
            onPress={()=> navigation.navigate('Profile')}         
          >
            <Image 
              className="h-12 w-12 rounded-2xl" 
              source={require('../assets/images/avatar.png')} 
              style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
            /> 
          </TouchableOpacity>  

          <View className="shadow-md rounded-2xl p-3">
            <TouchableOpacity
              onPress={()=> navigation.navigate('Cart')}         
            >
              <Ionicons name="cart-outline" size={30} color="white" /> 
            </TouchableOpacity>
          </View>

        </View>

        {/* Punch Line */}
        <View className="my-12 space-y-2">
          <Text className="mx-4 text-5xl font-medium text-gray-800">For the Love of </Text>
          <Text className="mx-4 text-5xl font-medium text-gray-800">
            <Text className="text-yellow-400 font-extrabold">Delicious</Text> Food
          </Text>
        </View>

        {/* Food Cards */}
        {loading ? (
          <ActivityIndicator size="large" color="#00ff00" />
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20 }}
            horizontal
            showsHorizontalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {foodItems.map((item, index) => (
              <FoodCard item={item} index={index} key={index} />
            ))}
          </ScrollView>
        )}

      </SafeAreaView>
    </View>
  );
}
