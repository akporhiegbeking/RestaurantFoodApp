import { 
  View,  Text, Image, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl, TextInput, FlatList, Dimensions
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Bars3Icon, 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon 
} from 'react-native-heroicons/outline';
import { LinearGradient } from 'expo-linear-gradient';
import FoodCard from '../components/FoodCard';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../constants/firebase';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const categories = ['Burger', 'Pizza', 'Sushi', 'Kebab', 'Sweet'];

export default function HomeScreen() {
  const [foodItems, setFoodItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Burger');
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFoodItems = async () => {
    try {
      const foodCollection = collection(db, 'food');
      const foodSnapshot = await getDocs(foodCollection);
      const foodList = foodSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFoodItems(foodList);
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
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#FFD700', '#F59E0B', '#FFFFFF', '#001F33']}
        locations={[0, 0.1, 0.3, 0.7]}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />
      
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginTop: 10 }}>
            <TouchableOpacity style={{ backgroundColor: 'white', padding: 10, borderRadius: 25, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
              <Bars3Icon size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Image 
                source={require('../assets/images/avatar.png')} 
                style={{ height: 50, width: 50, borderRadius: 15 }}
              />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={{ marginHorizontal: 20, marginTop: 30 }}>
            <Text style={{ fontSize: 42, fontWeight: 'bold', color: '#1A1A1A', lineHeight: 50 }}>Fast and</Text>
            <Text style={{ fontSize: 42, fontWeight: 'bold', color: '#1A1A1A', lineHeight: 50 }}>Deliciouse Food</Text>
          </View>

          {/* Search Bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 30 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 20, paddingHorizontal: 15, height: 60, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }}>
              <MagnifyingGlassIcon size={24} color="#999" />
              <TextInput 
                placeholder="Search" 
                style={{ flex: 1, marginLeft: 10, fontSize: 18, color: '#333' }}
              />
            </View>
            <TouchableOpacity style={{ backgroundColor: 'white', marginLeft: 15, padding: 15, borderRadius: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }}>
              <AdjustmentsHorizontalIcon size={28} color="black" />
            </TouchableOpacity>
          </View>

          {/* Categories */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: 20, marginTop: 30 }}
          >
            {categories.map((cat, index) => {
              const isActive = activeCategory === cat;
              return (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => setActiveCategory(cat)}
                  style={{ marginRight: 30, alignItems: 'center' }}
                >
                  <Text style={{ fontSize: 18, fontWeight: isActive ? 'bold' : '500', color: isActive ? 'white' : '#666' }}>
                    {cat}
                  </Text>
                  {isActive && <View style={{ width: 20, height: 3, backgroundColor: 'white', marginTop: 5, borderRadius: 2 }} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Food Items */}
          <View style={{ paddingHorizontal: 15, marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {loading ? (
              <View style={{ width: '100%', height: 200, justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="orange" />
              </View>
            ) : (
              foodItems.map((item, index) => (
                <FoodCard item={item} index={index} key={index} />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

