import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import React from 'react';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const RestaurantCard = ({ item }) => {
    const navigation = useNavigation();

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate('RestaurantDetails', { restaurant: item })}
            className="bg-white rounded-3xl shadow-sm mb-4 overflow-hidden mx-4"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 3
            }}
        >
            <View className="relative">
                <Image
                    source={{ uri: item.logoUrl || 'https://via.placeholder.com/300' }}
                    placeholder={{ blurhash }}
                    contentFit="cover"
                    transition={1000}
                    className="h-44 w-full"
                />
                <View className="absolute top-4 right-4 bg-white/80 px-2 py-1 rounded-full flex-row items-center">
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <Text className="text-xs font-bold ml-1">{item.rating || '4.5'}</Text>
                </View>
            </View>

            <View className="p-4">
                <Text className="text-xl font-bold text-gray-900">{item.name}</Text>
                <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>{item.description}</Text>

                <View className="flex-row items-center mt-3">
                    <Ionicons name="location" size={16} color="gray" />
                    <Text className="text-xs text-gray-500 ml-1">{item.address || 'Lagos, Nigeria'}</Text>
                    <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
                    <Text className="text-xs text-gray-500">20-30 min</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default React.memo(RestaurantCard);
