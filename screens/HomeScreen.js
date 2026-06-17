import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput, FlatList, Dimensions
} from 'react-native';
import { Image } from 'expo-image';
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ShoppingCartIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon, UserIcon,
  DocumentTextIcon, ChevronRightIcon
} from 'react-native-heroicons/outline';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import FoodCard from '../components/FoodCard';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '../constants/firebase';
import { useNavigation } from '@react-navigation/native';

const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [userData, setUserData] = useState(null);

  const fetchFoodItems = async () => {
    try {
      const foodCollection = collection(db, 'foods');
      const foodSnapshot = await getDocs(foodCollection);
      const foodList = foodSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setFoodItems(foodList);

      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(foodList.map(item => item.category).filter(Boolean))];
      setCategories(uniqueCategories);

      // Cache data for offline viewing
      await AsyncStorage.setItem('foodItems', JSON.stringify(foodList));
    } catch (error) {
      console.error("Error fetching food items: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch from cache then network
    const initializeData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem('foodItems');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setFoodItems(parsedData);

          // Also set categories from cache
          const uniqueCategories = ['All', ...new Set(parsedData.map(item => item.category).filter(Boolean))];
          setCategories(uniqueCategories);

          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading cached data:", error);
      }
      // Always fetch fresh data from network
      fetchFoodItems();
    };

    initializeData();

    // Fetch user profile image
    const fetchUserProfile = async () => {
      if (auth.currentUser) {
        try {
          const userQuery = query(collection(db, 'users'), where('uid', '==', auth.currentUser.uid));
          const snapshot = await getDocs(userQuery);
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            setUserData(data);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    fetchUserProfile();

    // Real-time cart count listener
    if (auth.currentUser) {
      const cartQuery = query(collection(db, 'carts'), where('userId', '==', auth.currentUser.uid));
      const unsubscribe = onSnapshot(cartQuery, (snapshot) => {
        if (!snapshot.empty) {
          const cartData = snapshot.docs[0].data();
          const totalCount = (cartData.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
          setCartCount(totalCount);
        } else {
          setCartCount(0);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFoodItems().then(() => setRefreshing(false));
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Blurred Status Bar Background */}
      <Image
        // source={require('../assets/images/')}
        placeholder={{ blurhash }}
        contentFit="cover"
        transition={0}
        style={{ position: 'absolute', top: 0, width: '100%', height: 120 }}
        blurRadius={40}
        cachePolicy="memory-and-disk"
      />

      {/* Background Image */}
      <Image
        source={require('../assets/images/background.png')}
        placeholder={{ blurhash }}
        contentFit="cover"
        transition={0}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        blurRadius={40}
        cachePolicy="memory-and-disk"
      />

      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={foodItems.filter(item => activeCategory === 'All' || item.category === activeCategory)}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 15 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <>
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginTop: 10 }}>
                {/* Profile Section (Left) */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('Profile')}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
                >
                  <View style={{
                    padding: 2,
                    backgroundColor: 'white',
                    borderRadius: 25,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 5,
                    elevation: 3
                  }}>
                    <Image
                      source={userData?.imageUrl ? { uri: userData.imageUrl } : require('../assets/images/avatar.png')}
                      placeholder={{ blurhash }}
                      contentFit="cover"
                      transition={0}
                      style={{ height: 48, width: 48, borderRadius: 24 }}
                      cachePolicy="memory-and-disk"
                    />
                  </View>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)', fontWeight: '500' }}>Welcome back,</Text>
                      <ChevronRightIcon size={20} color="rgba(0,0,0,0.4)" style={{ fontWeight: 'bold' }} />
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' }}>
                      {userData?.fullName?.split(' ')[0] || 'Guest'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Icons Area (Right) */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Cart')}
                    style={{ padding: 5 }}
                  >
                    <ShoppingCartIcon size={32} color="white" />
                    {cartCount > 0 && (
                      <View style={{ position: 'absolute', right: -2, top: -2, backgroundColor: '#EF4444', borderRadius: 10, width: 22, height: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' }}>
                        <Text style={{ color: 'white', fontSize: 10, fontWeight: '800' }}>{cartCount}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Search Bar */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 30 }}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 20, paddingHorizontal: 15, height: 50, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }}>
                  <MagnifyingGlassIcon size={24} color="#999" />
                  <TextInput
                    placeholder="Search"
                    style={{ flex: 1, marginLeft: 10, fontSize: 18, color: '#333' }}
                  />
                </View>
              </View>

              {/* Categories */}
              <FlatList
                horizontal
                data={categories}
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, marginTop: 30, paddingBottom: 10 }}
                renderItem={({ item: cat, index }) => {
                  const isActive = activeCategory === cat;
                  return (
                    <TouchableOpacity
                      onPress={() => setActiveCategory(cat)}
                      style={{ marginRight: 30, alignItems: 'center' }}
                    >
                      <Text style={{ fontSize: 18, fontWeight: isActive ? 'bold' : '500', color: isActive ? 'white' : '#fff' }}>
                        {cat}
                      </Text>
                      {isActive && <View style={{ width: 20, height: 3, backgroundColor: 'white', marginTop: 5, borderRadius: 2 }} />}
                    </TouchableOpacity>
                  );
                }}
              />

              {loading && (
                <View style={{ width: '100%', height: 200, justifyContent: 'center' }}>
                  <ActivityIndicator size="large" color="orange" />
                </View>
              )}
            </>
          }
          renderItem={({ item, index }) => (
            <FoodCard item={item} index={index} key={index} />
          )}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      </SafeAreaView>
    </View>
  );
}
