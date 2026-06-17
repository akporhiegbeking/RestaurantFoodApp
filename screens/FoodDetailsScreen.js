import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, ActivityIndicator,
    ScrollView, StyleSheet, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import {
    HeartIcon as HeartIconSolid,
    ChevronLeftIcon, MinusIcon, PlusIcon,
} from 'react-native-heroicons/solid';
import {
    HeartIcon as HeartIconOutline,
} from 'react-native-heroicons/outline';
import { auth, db } from '../constants/firebase';
import {
    doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp,
    collection, query, where, getDocs, deleteDoc, addDoc
} from 'firebase/firestore';
import Toast from 'react-native-root-toast';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function FoodDetailsScreen(props) {
    let item = props.route.params;
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [added, setAdded] = useState(false);
    const [liked, setLiked] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [foodData, setFoodData] = useState(item);

    useEffect(() => {
        if (!auth.currentUser) return;
        const cartQuery = query(collection(db, 'carts'), where('userId', '==', auth.currentUser.uid));
        const unsubCart = onSnapshot(cartQuery, (snapshot) => {
            if (!snapshot.empty) {
                const cartDoc = snapshot.docs[0];
                const cartData = cartDoc.data();
                const existingItem = cartData.items.find(i => i.foodId === item.id);
                if (existingItem) {
                    setAdded(true);
                    setQuantity(existingItem.quantity);
                } else {
                    setAdded(false);
                }
            } else {
                setAdded(false);
            }
        });

        const checkIfLiked = async () => {
            try {
                const savedQuery = query(
                    collection(db, 'saved_items'),
                    where('uid', '==', auth.currentUser.uid),
                    where('food_id', '==', item.id)
                );
                const snapshot = await getDocs(savedQuery);
                if (!snapshot.empty) setLiked(true);
            } catch (err) { console.error(err); }
        };
        checkIfLiked();

        const foodRef = doc(db, 'foods', item.id);
        const unsubFood = onSnapshot(foodRef, (docSnap) => {
            if (docSnap.exists()) setFoodData({ id: docSnap.id, ...docSnap.data() });
        });

        return () => {
            unsubCart();
            unsubFood();
        };
    }, []);

    const handleAddToCart = async (newQty = quantity) => {
        if (!auth.currentUser) return;
        setLoading(true);
        try {
            const cartQuery = query(collection(db, 'carts'), where('userId', '==', auth.currentUser.uid));
            const cartSnap = await getDocs(cartQuery);

            const newItem = {
                foodId: item.id || '',
                merchantId: item.merchantId || item.restaurantId || foodData.merchantId || foodData.restaurantId || '',
                merchantName: item.merchantName || item.restaurantName || foodData.merchantName || foodData.restaurantName || '',
                name: item.name || '',
                imageUrl: item.imageUrl || '',
                price: item.price || 0,
                quantity: newQty,
            };

            if (!cartSnap.empty) {
                const cartDoc = cartSnap.docs[0];
                const cartRef = doc(db, 'carts', cartDoc.id);
                let items = cartDoc.data().items || [];
                const idx = items.findIndex(i => i.foodId === item.id);
                if (idx > -1) {
                    items[idx].quantity = newQty;
                } else {
                    items.push(newItem);
                }
                await updateDoc(cartRef, { items, updatedAt: serverTimestamp() });
            } else {
                await addDoc(collection(db, 'carts'), {
                    items: [newItem],
                    userId: auth.currentUser.uid,
                    updatedAt: serverTimestamp()
                });
            }
            Toast.show('Cart updated!');
            setAdded(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromCart = async () => {
        if (!auth.currentUser) return;
        setLoading(true);
        try {
            const cartQuery = query(collection(db, 'carts'), where('userId', '==', auth.currentUser.uid));
            const cartSnap = await getDocs(cartQuery);
            if (!cartSnap.empty) {
                const cartDoc = cartSnap.docs[0];
                const items = cartDoc.data().items.filter(i => i.foodId !== item.id);
                await updateDoc(doc(db, 'carts', cartDoc.id), { items, updatedAt: serverTimestamp() });
                setAdded(false);
                setQuantity(1);
                Toast.show('Removed from cart');
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSaveItem = async () => {
        if (!auth.currentUser) return;
        try {
            if (liked) {
                const savedQuery = query(
                    collection(db, 'saved_items'),
                    where('uid', '==', auth.currentUser.uid),
                    where('food_id', '==', item.id)
                );
                const snapshot = await getDocs(savedQuery);
                snapshot.forEach(async (d) => await deleteDoc(doc(db, 'saved_items', d.id)));
                setLiked(false);
                Toast.show('Removed from saved');
            } else {
                await setDoc(doc(collection(db, 'saved_items')), {
                    uid: auth.currentUser.uid,
                    food_id: item.id,
                    name: item.name || '',
                    price: item.price || 0,
                    imageUrl: item.imageUrl || '',
                    savedAt: serverTimestamp(),
                });
                setLiked(true);
                Toast.show('Saved!');
            }
        } catch (err) { console.error(err); }
    };

    // Removed calories, prepTime, rating, weight as per user request

    return (
        <View style={styles.container}>
            <StatusBar style="light" translucent backgroundColor="transparent" />

            {/* Blurred background image */}
            <Image
                source={require('../assets/images/background.png')}
                style={styles.heroBg}
                contentFit="cover"
                blurRadius={40}
                transition={0}
                cachePolicy="memory-and-disk"
            />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Top nav */}
                <View style={styles.topNav}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronLeftIcon size={22} color="#1a2a4a" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSaveItem} style={styles.heartBtn}>
                        {liked
                            ? <HeartIconSolid size={22} color="#ef4444" />
                            : <HeartIconOutline size={22} color="#374151" />
                        }
                    </TouchableOpacity>
                </View>

                {/* Food image */}
                <Animatable.View animation="fadeInDown" duration={700} style={styles.imageWrapper}>
                    <Image
                        source={{ uri: item.imageUrl }}
                        placeholder={{ blurhash }}
                        contentFit="contain"
                        transition={0}
                        style={styles.foodImage}
                        cachePolicy="memory-and-disk"
                    />
                </Animatable.View>

                {/* Food name */}
                <Animatable.Text animation="fadeInUp" delay={100} duration={600} style={styles.foodName}>
                    {item.name}
                </Animatable.Text>

                {/* White card sheet */}
                <View style={styles.sheet}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>

                        {/* Quantity stepper centered */}
                        <View style={styles.statsRow}>
                            <View style={styles.stepper}>
                                <TouchableOpacity
                                    onPress={() => {
                                        const newQ = Math.max(1, quantity - 1);
                                        setQuantity(newQ);
                                        if (added) handleAddToCart(newQ);
                                    }}
                                    style={styles.stepBtn}
                                >
                                    <MinusIcon size={16} color="#374151" />
                                </TouchableOpacity>
                                <Text style={styles.stepCount}>{quantity}</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        const newQ = quantity + 1;
                                        setQuantity(newQ);
                                        if (added) handleAddToCart(newQ);
                                    }}
                                    style={styles.stepBtn}
                                >
                                    <PlusIcon size={16} color="#374151" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Description */}
                        <View style={styles.descSection}>
                            <Text style={styles.descTitle}>Description</Text>
                            <Text style={styles.descText}>
                                {item.description || "Indulge in our chef's special creation, a beautifully crafted dish made with the finest ingredients. Each bite is a burst of flavour, carefully seasoned and slow-cooked to perfection."}
                            </Text>
                        </View>
                    </ScrollView>

                    {/* Bottom bar: Price left | Button right */}
                    <View style={styles.bottomBar}>
                        <View>
                            <Text style={styles.priceLabel}>Price</Text>
                            <Text style={styles.priceValue}>₦{(item.price * quantity).toLocaleString()}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={added ? handleRemoveFromCart : () => handleAddToCart(quantity)}
                            disabled={loading || foodData.isAvailable === false}
                            style={[styles.cartBtn, added && styles.cartBtnRemove]}
                            activeOpacity={0.85}
                        >
                            {loading
                                ? <ActivityIndicator color="white" />
                                : <Text style={styles.cartBtnText}>{added ? 'Remove' : 'Add to Cart'}</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const HERO_HEIGHT = height * 0.47;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f1c2e',
    },
    heroBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: HERO_HEIGHT,
    },
    topNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 8,
    },
    backBtn: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    heartBtn: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    imageWrapper: {
        alignItems: 'center',
        marginTop: 8,
    },
    foodImage: {
        width: width * 0.58,
        height: width * 0.58,
    },
    foodName: {
        color: 'white',
        fontSize: 30,
        fontWeight: '800',
        textAlign: 'center',
        marginTop: -8,
        marginBottom: 18,
        paddingHorizontal: 20,
        letterSpacing: 0.3,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    sheet: {
        flex: 1,
        backgroundColor: 'white',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        paddingTop: 28,
        paddingHorizontal: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 50,
        paddingHorizontal: 6,
        paddingVertical: 4,
        gap: 4,
    },
    stepBtn: {
        backgroundColor: 'white',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    stepCount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        minWidth: 28,
        textAlign: 'center',
    },
    descSection: {
        marginBottom: 8,
    },
    descTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 10,
    },
    descText: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 22,
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
        marginBottom: 8,
    },
    priceLabel: {
        fontSize: 13,
        color: '#9ca3af',
        fontWeight: '500',
        marginBottom: 2,
    },
    priceValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
    },
    cartBtn: {
        backgroundColor: '#1a2a4a',
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1a2a4a',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    cartBtnRemove: {
        backgroundColor: '#ef4444',
        shadowColor: '#ef4444',
    },
    cartBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
