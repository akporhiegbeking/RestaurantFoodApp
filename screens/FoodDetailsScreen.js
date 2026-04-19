import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeftIcon } from 'react-native-heroicons/solid';
import { HeartIcon as HeartIconOutline, MinusIcon, PlusIcon } from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { auth, db } from '../constants/firebase';
import { collection, getDocs, addDoc, query, where, deleteDoc, doc } from 'firebase/firestore';
import Toast from 'react-native-root-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HeartIcon as HeartIconSolid } from 'react-native-heroicons/solid';

export default function FoodDetailsScreen(props) {
    let item = props.route.params;
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [added, setAdded] = useState(false);
    const [liked, setLiked] = useState(false);

    useEffect(() => {

        const checkIfAdded = async () => {
            try {
                const addedItems = await AsyncStorage.getItem('addedItems');
                if (addedItems !== null) {
                    const parsedItems = JSON.parse(addedItems);
                    if (parsedItems.includes(item.id)) {
                        setAdded(true);
                    }
                }
            } catch (error) {
                console.error('Error checking if item is added: ', error);
            }
        };

        const checkIfLiked = async () => {
            try {
                const savedItemsQuery = query(
                    collection(db, 'saved_items'),
                    where('uid', '==', auth.currentUser.uid),
                    where('food_id', '==', item.id)
                );
                const querySnapshot = await getDocs(savedItemsQuery);
                if (!querySnapshot.empty) {
                    setLiked(true);
                }
            } catch (error) {
                console.error('Error checking if item is liked: ', error);
            }
        };

        checkIfAdded();
        checkIfLiked();

    }, []);

    const handleAddToCart = async () => {
        setLoading(true);
        try {
            await addDoc(collection(db, 'cart'), {
                uid: auth.currentUser.uid,
                food_id: item.id,
                quantity: 1,
                price: item.price,
                name: item.name, 
                imageURL: item.imageURL,  
            });
            Toast.show('Item added to cart!', {
                duration: Toast.durations.SHORT,
                position: Toast.positions.BOTTOM,
            });

            // Fetch and log cart items
            const cartCollection = collection(db, 'cart');
            const cartQuery = query(cartCollection, where('uid', '==', auth.currentUser.uid));
            const cartSnapshot = await getDocs(cartQuery);
            const cartItems = cartSnapshot.docs.map(doc => doc.data());
            console.log('Cart Items:', cartItems);

            setAdded(true);

            // Store the item in AsyncStorage
            const addedItems = await AsyncStorage.getItem('addedItems');
            const parsedItems = addedItems !== null ? JSON.parse(addedItems) : [];
            parsedItems.push(item.id);
            await AsyncStorage.setItem('addedItems', JSON.stringify(parsedItems));
        } catch (error) {
            console.error('Error adding item to cart: ', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromCart = async () => {
        setLoading(true);
        try {
            const cartItemsQuery = query(
                collection(db, 'cart'),
                where('uid', '==', auth.currentUser.uid),
                where('food_id', '==', item.id)
            );
            const cartItemsSnapshot = await getDocs(cartItemsQuery);
            cartItemsSnapshot.forEach(async (docSnapshot) => {
                await deleteDoc(doc(db, 'cart', docSnapshot.id));
            });

            Toast.show('Item removed from cart!', {
                duration: Toast.durations.SHORT,
                position: Toast.positions.BOTTOM,
            });

            setAdded(false);

            // Remove the item from AsyncStorage
            const addedItems = await AsyncStorage.getItem('addedItems');
            let parsedItems = addedItems !== null ? JSON.parse(addedItems) : [];
            parsedItems = parsedItems.filter(id => id !== item.id);
            await AsyncStorage.setItem('addedItems', JSON.stringify(parsedItems));
        } catch (error) {
            console.error('Error removing item from cart: ', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveItem = async () => {
        if (liked) {
            // Remove item from saved_items collection 
            try {
                const savedItemsQuery = query(
                    collection(db, 'saved_items'),
                    where('uid', '==', auth.currentUser.uid),
                    where('food_id', '==', item.id)
                );
                const savedItemsSnapshot = await getDocs(savedItemsQuery);
                savedItemsSnapshot.forEach(async (docSnapshot) => {
                    await deleteDoc(doc(db, 'saved_items', docSnapshot.id));
                });
                setLiked(false);
                Toast.show('Item removed from saved!', {
                    duration: Toast.durations.SHORT,
                    position: Toast.positions.BOTTOM,
                });
            } catch (error) {
                console.error('Error removing item from saved: ', error);
            }
        } else {
            // Add item to saved_items collection
            try {
                await addDoc(collection(db, 'saved_items'), {
                    uid: auth.currentUser.uid,
                    food_id: item.id,
                    quantity: 1,
                    price: item.price,
                    name: item.name,
                    imageURL: item.imageURL,
                });
                setLiked(true);
                Toast.show('Item saved!', {
                    duration: Toast.durations.SHORT,
                    position: Toast.positions.BOTTOM,
                });
            } catch (error) {
                console.error('Error saving item: ', error);
            }
        }
    };

    return (
        <View className="flex-1 bg-white">
            <Image
                style={{ borderBottomLeftRadius: 50, borderBottomRightRadius: 50 }}
                source={require('../assets/images/background.png')}
                blurRadius={40}
                className="h-96 w-full absolute"
            />
            <SafeAreaView>
                <View className="flex-row justify-between mx-4 items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="bg-white rounded-2xl p-3 shadow">
                        <ChevronLeftIcon size="23" stroke={50} color="black" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleSaveItem} className="bg-white rounded-2xl p-3 shadow">                       
                        {liked ? (
                            <HeartIconSolid size="23" color="red" />
                        ) : (
                            <HeartIconOutline size="23" color="black" />
                        )}
                    </TouchableOpacity>
                </View>

                <View className="flex justify-center items-center">
                    <Image className="h-48 w-48" source={{ uri: item.imageURL }} />
                    <Text className="text-3xl text-white"> {item.name}</Text>
                </View>

                <View className="flex-row justify-center items-center mt-6">
                    <View className="flex-row justify-between items-center bg-gray-100 rounded-2xl space-x-3">
                        <TouchableOpacity className="rounded-2xl bg-white border-2 border-gray-200 p-3">
                            <MinusIcon size="20" strokeWidth={1.8} color="black" />
                        </TouchableOpacity>

                        <Text className="text-xl">1</Text>

                        <TouchableOpacity className="rounded-2xl bg-white border-2 border-gray-200 p-3">
                            <PlusIcon size="20" strokeWidth={1.8} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="mx-4 mt-6 space-y-3 h-60">
                    <Animatable.Text animation="slideInUp" className="text-3xl font-semibold text-gray-800">
                        Description
                    </Animatable.Text>

                    <Animatable.Text delay={100} animation="slideInUp" className="text-gray-600 tracking-wider">
                        {item.description}
                    </Animatable.Text>
                </View>

                <View className="mx-4 flex-row justify-between items-center">
                    <Animatable.Text delay={100} animation="slideInLeft" className="text-3xl font-semibold text-gray-800">
                        ₦ {item.price}
                    </Animatable.Text>

                    <Animatable.View delay={100} animation="slideInRight">
                        {added ? (
                            <TouchableOpacity
                                className="bg-red-600 p-4 px-14 rounded-2xl"
                                onPress={handleRemoveFromCart}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text className="text-white text-xl font-semibold">
                                        Remove Item
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                className="bg-gray-800 p-4 px-14 rounded-2xl"
                                onPress={handleAddToCart}
                                disabled={loading || added}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text className="text-white text-xl font-semibold">
                                        Add to Cart
                                    </Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </Animatable.View>

                </View>
            </SafeAreaView>
        </View>
    );
}
