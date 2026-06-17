import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Dimensions, ActivityIndicator, FlatList, TextInput
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
    ChevronLeftIcon, MagnifyingGlassIcon, ClockIcon, PlusIcon,
    HeartIcon, TruckIcon, ShieldCheckIcon, MapPinIcon, TagIcon,
    BarsArrowDownIcon, BarsArrowUpIcon
} from 'react-native-heroicons/outline';
import { HeartIcon as HeartIconSolid } from 'react-native-heroicons/solid';
import { StatusBar } from 'expo-status-bar';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, getDocs, limit, startAfter, orderBy, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../constants/firebase';
import Toast from 'react-native-root-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

// Memoized Food Item to prevent flickering and unnecessary re-renders
const FoodItem = React.memo(({ item, inCart, addingToCart, onAdd, onRemove }) => {
    return (
        <View style={styles.foodCard}>
            <Image
                source={{ uri: item.imageUrl }}
                placeholder={{ blurhash }}
                contentFit="cover"
                transition={0} // Fast transition
                style={styles.foodImage}
                cachePolicy="memory-and-disk"
            />
            <View style={styles.foodInfo}>
                <View style={styles.foodHeaderRow}>
                    <Text style={styles.foodName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.foodPrice}>₦{Number(item.price).toLocaleString()}</Text>
                </View>
                <Text style={styles.foodDescription} numberOfLines={2}>
                    {item.description || 'Enjoy our delicious and freshly prepared meal deals everyday.'}
                </Text>
                <View style={styles.foodFooter}>
                    <View style={styles.quantityRow}>
                        {inCart && (
                            <Text style={styles.quantityText}>1x</Text>
                        )}
                    </View>
                    <TouchableOpacity
                        style={[styles.addButton, inCart && styles.removeButton]}
                        onPress={() => inCart ? onRemove(item) : onAdd(item)}
                        disabled={addingToCart === item.id}
                    >
                        {addingToCart === item.id ? (
                            <ActivityIndicator size="small" color={inCart ? "#EF4444" : "#10B981"} />
                        ) : (
                            inCart ? (
                                <Text style={styles.removeButtonText}>-</Text>
                            ) : (
                                <PlusIcon size={18} color="#10B981" />
                            )
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
});

const RestaurantMerchantDetails = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { restaurant: initialRestaurant } = route.params;

    const [restaurant, setRestaurant] = useState(initialRestaurant);
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [addingToCart, setAddingToCart] = useState(null);
    const [cartItemIds, setCartItemIds] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [categories, setCategories] = useState(['All']);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' = A-Z, 'desc' = Z-A
    const [endorsed, setEndorsed] = useState(false);
    const [endorsing, setEndorsing] = useState(false);

    const PAGE_SIZE = 12; // Slightly larger page size for perceived speed

    // Caching logic
    const CACHE_KEY = `merchant_foods_${restaurant?.id}`;
    const LIKE_CACHE_KEY = `merchant_liked_${restaurant?.id}_${auth.currentUser?.uid}`;

    useEffect(() => {
        const loadCache = async () => {
            try {
                // Load food cache
                const cached = await AsyncStorage.getItem(CACHE_KEY);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    setFoods(parsed.foods || []);
                    setCategories(parsed.categories || ['All']);
                    setLoading(false);
                }
                // Load like state instantly from cache
                if (auth.currentUser) {
                    const likedCache = await AsyncStorage.getItem(LIKE_CACHE_KEY);
                    if (likedCache !== null) {
                        setEndorsed(likedCache === 'true');
                    }
                }
            } catch (e) {
                console.error("Cache load error", e);
            }
        };
        if (restaurant?.id) loadCache();
    }, [restaurant?.id]);

    useEffect(() => {
        if (!restaurant?.id) return;

        // Listen for merchant updates
        const merchantRef = doc(db, 'merchants', restaurant.id);
        const unsubscribeMerchant = onSnapshot(merchantRef, (docSnap) => {
            if (docSnap.exists()) {
                setRestaurant({ id: docSnap.id, ...docSnap.data() });
            }
        });

        // Listen for user cart
        const user = auth.currentUser;
        let unsubscribeCart = () => { };
        if (user) {
            const cartQuery = query(collection(db, 'carts'), where('userId', '==', user.uid));
            unsubscribeCart = onSnapshot(cartQuery, (snapshot) => {
                if (!snapshot.empty) {
                    const cartData = snapshot.docs[0].data();
                    const ids = (cartData.items || []).map(i => i.foodId);
                    setCartItemIds(ids);
                } else {
                    setCartItemIds([]);
                }
            });

            // Sync like state from Firestore in the background (non-blocking)
            (async () => {
                try {
                    const mySnap = await getDocs(query(collection(db, 'saved_merchants'), where('merchantId', '==', restaurant.id), where('uid', '==', user.uid)));
                    const isLiked = !mySnap.empty;
                    setEndorsed(isLiked);
                    // Keep cache in sync
                    AsyncStorage.setItem(LIKE_CACHE_KEY, String(isLiked)).catch(() => { });
                } catch (e) {
                    console.error('Saved merchant check error', e);
                }
            })();
        }

        return () => {
            unsubscribeMerchant();
            unsubscribeCart();
        };
    }, [restaurant?.id, auth.currentUser]);

    const fetchFoodsWithCategory = async (isLoadMore = false) => {
        if (isLoadMore && (!hasMore || loadingMore)) return;

        try {
            if (isLoadMore) setLoadingMore(true);
            else if (foods.length === 0) setLoading(true); // Only show loader if no cache

            let constraints = [
                where('merchantId', '==', restaurant.id),
                where('isAvailable', '==', true),
                orderBy('name')
            ];

            if (activeCategory !== 'All') {
                constraints.push(where('category', '==', activeCategory));
            }

            let q = query(collection(db, 'foods'), ...constraints, limit(PAGE_SIZE));

            if (isLoadMore && lastVisible) {
                q = query(q, startAfter(lastVisible));
            }

            const snapshot = await getDocs(q);
            const fetchedFoods = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            let updatedFoods;
            let updatedCats = categories;

            if (isLoadMore) {
                // Deduplicate by ID to prevent React "same key" warning
                const existingIds = new Set(foods.map(f => f.id));
                const newFoods = fetchedFoods.filter(f => !existingIds.has(f.id));
                updatedFoods = [...foods, ...newFoods];
            } else {
                updatedFoods = fetchedFoods;
                if (activeCategory === 'All') {
                    updatedCats = ['All', ...new Set(fetchedFoods.map(f => f.category).filter(Boolean))];
                    setCategories(updatedCats);
                }
            }

            setFoods(updatedFoods);
            setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
            setHasMore(snapshot.docs.length === PAGE_SIZE);

            // Save to cache
            if (!isLoadMore && activeCategory === 'All') {
                AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
                    foods: updatedFoods,
                    categories: updatedCats,
                    timestamp: Date.now()
                })).catch(console.error);
            }

        } catch (error) {
            console.error("Error fetching foods:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (restaurant?.id) {
            fetchFoodsWithCategory();
        }
    }, [activeCategory, restaurant?.id]);

    const handleRemoveFromCart = useCallback(async (item) => {
        const user = auth.currentUser;
        if (!user) return;

        setAddingToCart(item.id);
        try {
            const cartQuery = query(collection(db, 'carts'), where('userId', '==', user.uid));
            const cartSnap = await getDocs(cartQuery);

            if (!cartSnap.empty) {
                const cartDoc = cartSnap.docs[0];
                const cartRef = doc(db, 'carts', cartDoc.id);
                let items = cartDoc.data().items || [];
                const filteredItems = items.filter(i => i.foodId !== item.id);
                await updateDoc(cartRef, { items: filteredItems, updatedAt: serverTimestamp() });
                Toast.show('Removed');
            }
        } catch (err) {
            console.error(err);
            Toast.show('Error');
        } finally {
            setAddingToCart(null);
        }
    }, [auth.currentUser]);

    const handleAddToCart = useCallback(async (item) => {
        const user = auth.currentUser;
        if (!user) {
            Toast.show('Login to add');
            return;
        }

        setAddingToCart(item.id);
        try {
            const cartQuery = query(collection(db, 'carts'), where('userId', '==', user.uid));
            const cartSnap = await getDocs(cartQuery);

            const newItem = {
                foodId: item.id || '',
                merchantId: restaurant.id,
                merchantName: restaurant.businessName || '',
                name: item.name || '',
                imageUrl: item.imageUrl || '',
                price: item.price || 0,
                quantity: 1,
            };

            if (!cartSnap.empty) {
                const cartDoc = cartSnap.docs[0];
                const cartRef = doc(db, 'carts', cartDoc.id);
                let items = cartDoc.data().items || [];
                const idx = items.findIndex(i => i.foodId === item.id);
                if (idx > -1) {
                    items[idx].quantity += 1;
                } else {
                    items.push(newItem);
                }
                await updateDoc(cartRef, { items, updatedAt: serverTimestamp() });
            } else {
                await addDoc(collection(db, 'carts'), {
                    items: [newItem],
                    userId: user.uid,
                    updatedAt: serverTimestamp()
                });
            }
            Toast.show('Added!');
        } catch (err) {
            console.error(err);
            Toast.show('Error');
        } finally {
            setAddingToCart(null);
        }
    }, [auth.currentUser, restaurant]);

    // Filter foods by search query (client-side, under current merchant)
    const filteredFoods = useMemo(() => {
        let result = foods;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = foods.filter(f =>
                (f.name || '').toLowerCase().includes(q) ||
                (f.description || '').toLowerCase().includes(q) ||
                (f.category || '').toLowerCase().includes(q)
            );
        }
        // Apply A-Z / Z-A sort
        return [...result].sort((a, b) => {
            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();
            return sortOrder === 'asc'
                ? nameA.localeCompare(nameB)
                : nameB.localeCompare(nameA);
        });
    }, [foods, searchQuery, sortOrder]);

    const handleEndorse = useCallback(async () => {
        const user = auth.currentUser;
        if (!user) { Toast.show('Login to save merchant'); return; }
        if (endorsing) return;

        // Optimistic update — instant UI response
        const nextState = !endorsed;
        setEndorsed(nextState);
        AsyncStorage.setItem(LIKE_CACHE_KEY, String(nextState)).catch(() => { });

        setEndorsing(true);
        try {
            const q = query(
                collection(db, 'saved_merchants'),
                where('merchantId', '==', restaurant.id),
                where('uid', '==', user.uid)
            );
            const existing = await getDocs(q);

            if (!nextState && !existing.empty) {
                // Was liked, now unliking
                await deleteDoc(doc(db, 'saved_merchants', existing.docs[0].id));
            } else if (nextState && existing.empty) {
                // Was not liked, now liking
                await addDoc(collection(db, 'saved_merchants'), {
                    merchantId: restaurant.id,
                    uid: user.uid,
                    savedAt: serverTimestamp(),
                });
            }
        } catch (err) {
            console.error(err);
            // Revert on error
            setEndorsed(!nextState);
            AsyncStorage.setItem(LIKE_CACHE_KEY, String(!nextState)).catch(() => { });
            Toast.show('Error, please try again');
        } finally {
            setEndorsing(false);
        }
    }, [endorsed, endorsing, restaurant?.id, LIKE_CACHE_KEY]);

    const listData = useMemo(() => [
        { id: 'header', type: 'header' },
        { id: 'search', type: 'search' },
        { id: 'categories', type: 'categories' },
        ...filteredFoods.map(f => ({ ...f, type: 'food' }))
    ], [filteredFoods, restaurant]);

    const renderItem = ({ item }) => {
        if (item.type === 'header') {
            return (
                <View>
                    <View style={styles.headerContainer}>
                        <Image
                            source={restaurant.imageUrl ? { uri: restaurant.imageUrl } : require('../assets/images/background.png')}
                            placeholder={{ blurhash }}
                            contentFit="cover"
                            blurRadius={40}
                            style={styles.coverImage}
                            cachePolicy="memory-and-disk"
                        />
                        <SafeAreaView style={styles.headerButtons}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                                <ChevronLeftIcon size={25} color="white" />
                            </TouchableOpacity>
                        </SafeAreaView>

                        <View style={styles.logoWrapper}>
                            <Image
                                source={restaurant.imageUrl ? { uri: restaurant.imageUrl } : require('../assets/images/background.png')}
                                placeholder={{ blurhash }}
                                contentFit="cover"
                                style={styles.logoImage}
                                cachePolicy="memory-and-disk"
                            />
                        </View>
                    </View>

                    <View style={styles.merchantInfo}>
                        <Text style={styles.merchantTitle}>{restaurant.businessName}</Text>

                        {/* Business type and address only */}
                        <View style={styles.detailsGrid}>
                            <View style={styles.detailItem}>
                                <TagIcon size={16} color="#6B7280" />
                                <Text style={styles.detailText}>{restaurant.businessType || 'Restaurant'}</Text>
                            </View>
                        </View>

                        <View style={[styles.detailItem, { marginTop: 4, marginBottom: 10 }]}>
                            <MapPinIcon size={16} color="#6B7280" />
                            <Text style={styles.detailText} numberOfLines={2}>{restaurant.address || 'Location not available'}</Text>
                        </View>

                        <View style={styles.statsLayout}>
                            {/* Heart Like Button */}
                            <TouchableOpacity style={styles.statBox} onPress={handleEndorse}>
                                {endorsed
                                    ? <HeartIconSolid size={26} color="#EA4C89" />
                                    : <HeartIcon size={26} color="#788EA5" />
                                }
                            </TouchableOpacity>
                            <View style={styles.statBox}>
                                <ClockIcon size={22} color="#1F2937" />
                                <Text style={styles.statLabel}>20-30'</Text>
                            </View>
                            <View style={styles.statBox}>
                                <TruckIcon size={22} color="#1F2937" />
                                <Text style={styles.statLabel}>₦2,000</Text>
                            </View>
                        </View>
                    </View>
                </View>
            );
        }

        if (item.type === 'search') {
            return (
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <MagnifyingGlassIcon size={20} color="#9CA3AF" />
                        <TextInput
                            placeholder="Search products"
                            placeholderTextColor="#9CA3AF"
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>
            );
        }

        if (item.type === 'categories') {
            return (
                <View style={styles.categoryContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, flex: 1 }}>
                        {categories.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setActiveCategory(cat)}
                                style={[styles.categoryBtn, activeCategory === cat && styles.categoryBtnActive]}
                            >
                                <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity
                        onPress={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        style={styles.sortBtn}
                    >
                        {sortOrder === 'asc'
                            ? <BarsArrowDownIcon size={22} color="#1F2937" />
                            : <BarsArrowUpIcon size={22} color="#10B981" />
                        }
                    </TouchableOpacity>
                </View>
            );
        }

        if (item.type === 'food') {
            return (
                <View style={{ paddingHorizontal: 20 }}>
                    <FoodItem
                        item={item}
                        inCart={cartItemIds.includes(item.id)}
                        addingToCart={addingToCart}
                        onAdd={handleAddToCart}
                        onRemove={handleRemoveFromCart}
                    />
                </View>
            );
        }

        return null;
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {loading && foods.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#F59E0B" />
                </View>
            ) : (
                <FlatList
                    data={listData}
                    keyExtractor={(item, index) => item.id || `item-${index}`}
                    renderItem={renderItem}
                    stickyHeaderIndices={[2]} // Categories is now index 2
                    contentContainerStyle={{ paddingBottom: 40 }}
                    onEndReached={() => fetchFoodsWithCategory(true)}
                    onEndReachedThreshold={0.5}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={7}
                    removeClippedSubviews={true}
                    ListFooterComponent={() => (
                        loadingMore ? (
                            <View style={{ paddingVertical: 20 }}>
                                <ActivityIndicator size="small" color="#F59E0B" />
                            </View>
                        ) : null
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    headerContainer: {
        height: 220,
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: 200,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerButtons: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 10,
    },
    backBtn: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 10,
        borderRadius: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    logoWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 30,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 5,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    logoImage: {
        width: 70,
        height: 70,
        borderRadius: 12,
    },
    merchantInfo: {
        paddingHorizontal: 25,
        paddingTop: 15,
    },
    merchantTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1F2937',
        marginBottom: 8,
    },
    detailsGrid: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 8,
    },
    detailsFull: {
        marginBottom: 10,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 5,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        gap: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: 'white',
    },
    statsLayout: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingHorizontal: 5,
    },
    statBox: {
        alignItems: 'center',
        gap: 6,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1F2937',
    },
    primeCircle: {
        backgroundColor: '#6366F1',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 25,
        paddingHorizontal: 20,
        height: 50,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
    },
    categoryContainer: {
        backgroundColor: 'white',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryBtn: {
        marginRight: 20,
        paddingBottom: 8,
    },
    categoryBtnActive: {
        borderBottomWidth: 3,
        borderBottomColor: '#10B981',
    },
    categoryText: {
        color: '#9CA3AF',
        fontWeight: '700',
        fontSize: 16,
    },
    categoryTextActive: {
        color: '#1F2937',
    },
    sortBtn: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderLeftWidth: 1,
        borderLeftColor: '#F3F4F6',
    },
    foodCard: {
        flexDirection: 'row',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
        gap: 15,
    },
    foodImage: {
        width: 110,
        height: 110,
        borderRadius: 20,
    },
    foodInfo: {
        flex: 1,
    },
    foodHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    foodName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
    },
    foodPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    foodDescription: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 8,
        lineHeight: 18,
    },
    foodFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    addButton: {
        backgroundColor: '#ECFDF5',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#D1FAE5',
    },
    addButtonText: {
        color: '#10B981',
        fontSize: 18,
        fontWeight: 'bold',
    },
    removeButton: {
        backgroundColor: '#FEF2F2',
        borderColor: '#FEE2E2',
    },
    removeButtonText: {
        color: '#EF4444',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

export default RestaurantMerchantDetails;
