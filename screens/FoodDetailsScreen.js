import React, { useState, useEffect } from 'react';
import { 
  View, Text, Image, TouchableOpacity, ActivityIndicator, 
  ScrollView,
} from 'react-native';
import { 
  ChevronLeftIcon, MinusIcon, PlusIcon, FireIcon, ClockIcon, StarIcon,
  RectangleStackIcon, ShoppingBagIcon
} from 'react-native-heroicons/outline';
import { Ionicons } from '@expo/vector-icons';
const HeartIconSolid = (props) => <Ionicons name="heart" {...props} />;
const HeartIconOutline = (props) => <Ionicons name="heart-outline" {...props} />;
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { auth, db } from '../constants/firebase';
import { 
    collection, getDocs, addDoc, query, where, deleteDoc, doc, updateDoc,
    onSnapshot 
} from 'firebase/firestore';
import Toast from 'react-native-root-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FoodDetailsScreen(props) {
    let item = props.route.params;
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [added, setAdded] = useState(false);
    const [liked, setLiked] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [cartItemId, setCartItemId] = useState(null);
    const [foodData, setFoodData] = useState(item);

    useEffect(() => {
        const initializeQuantityAndCartStatus = async () => {
            try {
                // 1. Check Firestore for existing cart item
                const cartItemsQuery = query(
                    collection(db, 'cart'),
                    where('uid', '==', auth.currentUser.uid),
                    where('food_id', '==', item.id)
                );
                const querySnapshot = await getDocs(cartItemsQuery);
                
                if (!querySnapshot.empty) {
                    // Item is in cart
                    const cartDoc = querySnapshot.docs[0];
                    const cartData = cartDoc.data();
                    setAdded(true);
                    setCartItemId(cartDoc.id);
                    setQuantity(cartData.quantity || 1);
                } else {
                    // Item not in cart, default to 1
                    setAdded(false);
                    setQuantity(1);
                }

                // 2. Refresh the overall "addedItems" list for the Home Screen badge logic
                const addedItems = await AsyncStorage.getItem('addedItems');
                let parsedItems = addedItems !== null ? JSON.parse(addedItems) : [];
                if (!querySnapshot.empty && !parsedItems.includes(item.id)) {
                    parsedItems.push(item.id);
                    await AsyncStorage.setItem('addedItems', JSON.stringify(parsedItems));
                } else if (querySnapshot.empty && parsedItems.includes(item.id)) {
                    parsedItems = parsedItems.filter(id => id !== item.id);
                    await AsyncStorage.setItem('addedItems', JSON.stringify(parsedItems));
                }

            } catch (error) {
                console.error('Error initializing quantity: ', error);
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

        initializeQuantityAndCartStatus();
        checkIfLiked();

        // 3. Real-time listener for food availability and updates
        const foodDocRef = doc(db, 'foods', item.id);
        const unsubscribe = onSnapshot(foodDocRef, (doc) => {
            if (doc.exists()) {
                setFoodData({ id: doc.id, ...doc.data() });
            }
        }, (error) => {
            console.error("Error listening to food updates: ", error);
        });

        return () => unsubscribe();
    }, []);

    const syncQuantity = async (newQuantity) => {
        setQuantity(newQuantity);
        try {
            // If already in cart, update Firestore
            if (added && cartItemId) {
                const cartDocRef = doc(db, 'cart', cartItemId);
                await updateDoc(cartDocRef, { quantity: newQuantity });
            }
        } catch (error) {
            console.error('Error syncing quantity: ', error);
        }
    };

    const handleAddToCart = async () => {
        setLoading(true);
        try {
            const docRef = await addDoc(collection(db, 'cart'), {
                uid: auth.currentUser.uid,
                food_id: item.id,
                quantity: quantity,
                price: item.price,
                name: item.name, 
                imageUrl: item.imageUrl,  
            });
            Toast.show('Item added to cart!', {
                duration: Toast.durations.SHORT,
                position: Toast.positions.BOTTOM,
            });

            setAdded(true);
            setCartItemId(docRef.id);
            const addedItems = await AsyncStorage.getItem('addedItems');
            const parsedItems = addedItems !== null ? JSON.parse(addedItems) : [];
            if (!parsedItems.includes(item.id)) {
                parsedItems.push(item.id);
                await AsyncStorage.setItem('addedItems', JSON.stringify(parsedItems));
            }
        } catch (error) {
            console.error('Error adding item to cart: ', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromCart = async () => {
        setLoading(true);
        try {
            if (cartItemId) {
                await deleteDoc(doc(db, 'cart', cartItemId));
            } else {
                const cartItemsQuery = query(
                    collection(db, 'cart'),
                    where('uid', '==', auth.currentUser.uid),
                    where('food_id', '==', item.id)
                );
                const cartItemsSnapshot = await getDocs(cartItemsQuery);
                cartItemsSnapshot.forEach(async (docSnapshot) => {
                    await deleteDoc(doc(db, 'cart', docSnapshot.id));
                });
            }

            Toast.show('Item removed from cart!', {
                duration: Toast.durations.SHORT,
                position: Toast.positions.BOTTOM,
            });

            setAdded(false);
            setCartItemId(null);
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
            try {
                await addDoc(collection(db, 'saved_items'), {
                    uid: auth.currentUser.uid,
                    food_id: item.id,
                    quantity: 1,
                    price: item.price,
                    name: item.name,
                    imageUrl: item.imageUrl,
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
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Blurred Background Header */}
            <Image
                style={{ borderBottomLeftRadius: 50, borderBottomRightRadius: 50, height: 420, width: '100%', position: 'absolute' }}
                source={require('../assets/images/background.png')}
                blurRadius={40}
            />
            
            <SafeAreaView style={{ flex: 1 }}>
                {/* Header Controls */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, alignItems: 'center', marginTop: 10 }}>
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()} 
                        style={{ backgroundColor: 'white', padding: 12, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.1, elevation: 5 }}
                    >
                        <ChevronLeftIcon size={24} color="black" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={handleSaveItem} 
                        style={{ backgroundColor: 'white', padding: 12, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.1, elevation: 5 }}
                    >                       
                        {liked ? (
                            <HeartIconSolid size={24} color="red" />
                        ) : (
                            <HeartIconOutline size={24} color="black" />
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
                    {/* Food Image and Title */}
                    <View style={{ alignItems: 'center', marginTop: 20 }}>
                        <Animatable.Image 
                            animation="bounceIn"
                            duration={1200}
                            style={{ height: 260, width: 260 }} 
                            source={{ uri: item.imageUrl }} 
                            resizeMode="contain"
                        />
                        <Animatable.Text 
                            animation="fadeInUp"
                            style={{ fontSize: 32, fontWeight: '800', color: 'white', marginTop: 10, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.2)', textShadowRadius: 10 }}
                        >
                            {item.name}
                        </Animatable.Text>

                        {/* Availability Status */}
                        <Animatable.View 
                            animation="fadeInUp"
                            delay={400}
                            style={{ 
                                marginTop: 8, 
                                paddingHorizontal: 12, 
                                paddingVertical: 6, 
                                borderRadius: 15, 
                                backgroundColor: foodData.isAvailable !== false ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                borderWidth: 1,
                                borderColor: foodData.isAvailable !== false ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
                            }}
                        >
                            <Text style={{ 
                                fontSize: 13, 
                                fontWeight: 'bold', 
                                color: foodData.isAvailable !== false ? '#22C55E' : '#EF4444',
                                letterSpacing: 0.5
                            }}>
                                {foodData.isAvailable !== false ? 'Currently Available' : 'Unavailable/ Out of stock'}
                            </Text>
                        </Animatable.View>
                    </View>

                    {/* Quantity Stepper */}
                    <Animatable.View 
                        animation="fadeInUp"
                        delay={300}
                        style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 25, padding: 4, marginTop: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 }}
                    >
                        <TouchableOpacity 
                            onPress={() => syncQuantity(Math.max(1, quantity - 1))}
                            style={{ backgroundColor: '#F3F4F6', padding: 12, borderRadius: 20 }}
                        >
                            <MinusIcon size={20} color="black" />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', marginHorizontal: 20 }}>{quantity}</Text>
                        <TouchableOpacity 
                            onPress={() => syncQuantity(quantity + 1)}
                            style={{ backgroundColor: '#F3F4F6', padding: 12, borderRadius: 20 }}
                        >
                            <PlusIcon size={20} color="black" />
                        </TouchableOpacity>
                    </Animatable.View>

                    {/* Stats Section */}
                    <Animatable.View 
                        animation="fadeInUp"
                        delay={500}
                        style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 30, paddingHorizontal: 10 }}
                    >
                        {[
                            { icon: <FireIcon size={22} color="#EF4444" />, label: '130 cal' },
                            { icon: <ClockIcon size={22} color="#F59E0B" />, label: '15-20 min' },
                            { icon: <HeartIconOutline size={22} color="#DB2777" />, label: '4.8 vote' },
                            { icon: <RectangleStackIcon size={22} color="#10B981" />, label: '350 g' }
                        ].map((stat, idx) => (
                            <View key={idx} style={{ alignItems: 'center' }}>
                                <View style={{ backgroundColor: '#F9FAFB', padding: 10, borderRadius: 15, marginBottom: 5 }}>
                                    {stat.icon}
                                </View>
                                <Text style={{ fontSize: 13, fontWeight: '600', color: '#4B5563' }}>{stat.label}</Text>
                            </View>
                        ))}
                    </Animatable.View>

                    {/* Description Section */}
                    <View style={{ paddingHorizontal: 20, marginTop: 35 }}>
                        <Animatable.Text 
                            animation="fadeInUp" 
                            delay={600}
                            style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937' }}
                        >
                            Description
                        </Animatable.Text>
                        <Animatable.Text 
                            animation="fadeInUp"
                            delay={700}
                            style={{ fontSize: 15, color: '#6B7280', marginTop: 12, lineHeight: 24, letterSpacing: 0.3 }}
                        >
                            {item.description || "Indulge in our chef's special creation, prepared with the freshest ingredients and authentic spices to bring you a truly remarkable dining experience."}
                        </Animatable.Text>
                    </View>
                </ScrollView>

                {/* Footer Section */}
                <Animatable.View 
                    animation="fadeInUp"
                    delay={800}
                    style={{ 
                        flexDirection: 'row', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        paddingHorizontal: 20, 
                        paddingVertical: 20,
                        backgroundColor: 'white',
                        borderTopLeftRadius: 40,
                        borderTopRightRadius: 40,
                        shadowColor: '#000',
                        shadowOpacity: 0.1,
                        shadowRadius: 20,
                        elevation: 15
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>
                            ₦ {item.price.toLocaleString()} ({quantity})
                        </Text>
                        <Text style={{ fontSize: 14, color: '#9CA3AF', fontWeight: '500', marginTop: 4 }}>
                            ~ ₦ {(item.price * quantity).toLocaleString()}
                        </Text>
                    </View>
                    
                    <TouchableOpacity 
                        onPress={added ? handleRemoveFromCart : handleAddToCart}
                        disabled={loading || foodData.isAvailable === false}
                        style={{ 
                            backgroundColor: foodData.isAvailable === false ? '#9CA3AF' : (added ? '#EF4444' : '#001F33'), 
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 30, 
                            paddingVertical: 18, 
                            borderRadius: 25,
                            shadowColor: foodData.isAvailable === false ? '#9CA3AF' : (added ? '#EF4444' : '#001F33'),
                            shadowOpacity: 0.3,
                            shadowRadius: 10,
                            elevation: 5
                        }}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <ShoppingBagIcon size={20} color="white" />
                                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }}>
                                    {foodData.isAvailable === false ? 'Out of stock' : (added ? 'Remove' : 'Add to Cart')}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </Animatable.View>
            </SafeAreaView>
        </View>
    );
}
