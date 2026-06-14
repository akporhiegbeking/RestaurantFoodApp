import {
    View, Text, TouchableOpacity, FlatList,
    ActivityIndicator, ScrollView, Dimensions
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
    ChevronLeftIcon,
    StarIcon,
    ClockIcon,
    MapPinIcon
} from 'react-native-heroicons/solid';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFirestore } from '../hooks/useFirestore';
import FoodCard from '../components/FoodCard';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');
const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function RestaurantDetailsScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { restaurant } = route.params;
    const { getFoodsByRestaurant } = useFirestore();

    const [foods, setFoods] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [categories, setCategories] = useState(['All']);
    const [activeCategory, setActiveCategory] = useState('All');

    const fetchFoods = async () => {
        setLoading(true);
        const data = await getFoodsByRestaurant(restaurant.id);
        setFoods(data.data);
        setLastVisible(data.lastVisible);

        // Extract categories
        const uniqueCats = ['All', ...new Set(data.data.map(item => item.category).filter(Boolean))];
        setCategories(uniqueCats);
        setLoading(false);
    };

    const loadMoreFoods = async () => {
        if (loadingMore || !lastVisible) return;
        setLoadingMore(true);
        const data = await getFoodsByRestaurant(restaurant.id, lastVisible);
        setFoods(prev => [...prev, ...data.data]);
        setLastVisible(data.lastVisible);
        setLoadingMore(false);
    };

    useEffect(() => {
        fetchFoods();
    }, [restaurant.id]);

    const filteredFoods = foods.filter(item =>
        activeCategory === 'All' || item.category === activeCategory
    );

    const renderHeader = () => (
        <View>
            {/* Cover Image & Back Button */}
            <View className="relative h-64 w-full">
                <Image
                    source={{ uri: restaurant.logoUrl || 'https://via.placeholder.com/600' }}
                    placeholder={{ blurhash }}
                    contentFit="cover"
                    className="h-full w-full"
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'transparent']}
                    className="absolute top-0 left-0 right-0 h-24"
                />
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="absolute top-12 left-5 bg-white/90 p-2 rounded-full shadow-sm"
                >
                    <ChevronLeftIcon size={24} color="#1A1A1A" />
                </TouchableOpacity>
            </View>

            {/* Restaurant Info */}
            <View className="bg-white px-5 py-6 -mt-10 rounded-t-[40px] shadow-sm">
                <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-4">
                        <Text className="text-3xl font-extrabold text-gray-900">{restaurant.name}</Text>
                        <Text className="text-gray-500 mt-2 leading-5">{restaurant.description}</Text>
                    </View>
                    <View className="bg-orange-50 px-3 py-2 rounded-2xl flex-row items-center">
                        <StarIcon size={18} color="#F59E0B" />
                        <Text className="text-orange-600 font-bold ml-1">{restaurant.rating || '4.5'}</Text>
                    </View>
                </View>

                <View className="flex-row items-center mt-6 py-4 border-y border-gray-100">
                    <View className="flex-1 flex-row items-center justify-center border-r border-gray-100">
                        <ClockIcon size={20} color="#6B7280" />
                        <Text className="text-gray-600 font-medium ml-2">20-30 min</Text>
                    </View>
                    <View className="flex-1 flex-row items-center justify-center">
                        <MapPinIcon size={20} color="#6B7280" />
                        <Text className="text-gray-600 font-medium ml-2" numberOfLines={1}>1.2 km away</Text>
                    </View>
                </View>

                {/* Menu Categories */}
                <View className="mt-8">
                    <Text className="text-xl font-bold text-gray-900 mb-4">Our Menu</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        {categories.map((cat, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setActiveCategory(cat)}
                                className={`mr-4 px-6 py-3 rounded-2xl border ${activeCategory === cat ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-200'}`}
                            >
                                <Text className={`font-bold ${activeCategory === cat ? 'text-white' : 'text-gray-500'}`}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="light" />
            <FlatList
                data={filteredFoods}
                keyExtractor={(item) => item.id}
                numColumns={2}
                renderItem={({ item, index }) => (
                    <View style={{ width: '50%' }}>
                        <FoodCard item={{ ...item, restaurantName: restaurant.name }} index={index} />
                    </View>
                )}
                ListHeaderComponent={renderHeader}
                columnWrapperStyle={{ paddingHorizontal: 10 }}
                onEndReached={loadMoreFoods}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    loadingMore ? (
                        <View className="py-6">
                            <ActivityIndicator color="#F59E0B" />
                        </View>
                    ) : <View className="h-20" />
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

// Helper for LinearGradient (mocking if not imported to keep it self-contained)
import { LinearGradient } from 'expo-linear-gradient';
