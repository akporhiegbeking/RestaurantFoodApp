import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, ScrollView, Dimensions, TextInput
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs, limit, startAfter, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../constants/firebase';
import {
    ChevronLeftIcon, ShoppingCartIcon, MagnifyingGlassIcon,
    ArrowsUpDownIcon
} from 'react-native-heroicons/outline';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;
const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const CACHE_KEY = 'cached_merchants';

const MerchantCard = React.memo(({ item, onPress }) => (
    <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => onPress(item)}
    >
        <View style={styles.imageWrapper}>
            <Image
                source={item.imageUrl ? { uri: item.imageUrl } : require('../assets/images/background.png')}
                placeholder={{ blurhash }}
                contentFit="cover"
                transition={0}
                style={styles.cardImage}
                cachePolicy="memory-and-disk"
            />
            <View style={styles.badgeRow}>
                <View style={styles.dealBadge}>
                    <Text style={styles.dealText}>Official Store</Text>
                </View>
                {item.isOpen && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>OPEN</Text>
                    </View>
                )}
            </View>
        </View>

        <View style={styles.cardContent}>
            <Text style={styles.businessName} numberOfLines={2}>
                {item.businessName || 'Business Name'}
            </Text>

            <Text style={styles.businessType}>
                {item.businessType || 'General'}
            </Text>

            <View style={styles.actionBtn}>
                <Text style={styles.actionBtnText}>Visit Store</Text>
            </View>
        </View>
    </TouchableOpacity>
));

const RestaurantListScreen = () => {
    const navigation = useNavigation();
    const [merchants, setMerchants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const [sortOrder, setSortOrder] = useState('none');
    const [searchQuery, setSearchQuery] = useState('');
    const [userData, setUserData] = useState(null);
    const [cartCount, setCartCount] = useState(0);

    const PAGE_SIZE = 10;

    useEffect(() => {
        const loadCache = async () => {
            try {
                const cached = await AsyncStorage.getItem(CACHE_KEY);
                if (cached) {
                    setMerchants(JSON.parse(cached));
                    setLoading(false);
                }
            } catch (e) {
                console.error("Cache load error", e);
            }
        };
        loadCache();
        fetchMerchants();

        // Fetch user profile
        const fetchUserProfile = async () => {
            if (!auth.currentUser) return;
            try {
                const userQuery = query(collection(db, 'users'), where('uid', '==', auth.currentUser.uid));
                const snapshot = await getDocs(userQuery);
                if (!snapshot.empty) setUserData(snapshot.docs[0].data());
            } catch (e) {
                console.error('Profile fetch error', e);
            }
        };
        fetchUserProfile();

        // Real-time cart count listener
        if (auth.currentUser) {
            const cartQuery = query(collection(db, 'carts'), where('userId', '==', auth.currentUser.uid));
            const unsubscribeCart = onSnapshot(cartQuery, (snapshot) => {
                if (!snapshot.empty) {
                    const cartData = snapshot.docs[0].data();
                    const totalCount = (cartData.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
                    setCartCount(totalCount);
                } else {
                    setCartCount(0);
                }
            });
            return () => unsubscribeCart();
        }
    }, []);

    const fetchMerchants = async () => {
        try {
            if (merchants.length === 0) setLoading(true);
            const q = query(
                collection(db, 'merchants'),
                where('isApproved', '==', true),
                orderBy('businessName'),
                limit(PAGE_SIZE)
            );

            const snapshot = await getDocs(q);
            const fetchedMerchants = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setMerchants(fetchedMerchants);
            setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
            setHasMore(snapshot.docs.length === PAGE_SIZE);

            // Save to cache
            AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fetchedMerchants)).catch(console.error);

        } catch (error) {
            console.error("Error fetching merchants:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMoreMerchants = async () => {
        if (loadingMore || !hasMore || !lastVisible) return;

        try {
            setLoadingMore(true);
            const q = query(
                collection(db, 'merchants'),
                where('isApproved', '==', true),
                orderBy('businessName'),
                startAfter(lastVisible),
                limit(PAGE_SIZE)
            );

            const snapshot = await getDocs(q);
            const newMerchants = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setMerchants(prev => [...prev, ...newMerchants]);
            setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
            setHasMore(snapshot.docs.length === PAGE_SIZE);
        } catch (error) {
            console.error("Error fetching more merchants:", error);
        } finally {
            setLoadingMore(false);
        }
    };



    const handlePressMerchant = useCallback((item) => {
        navigation.navigate('RestaurantMerchantDetails', { restaurant: item });
    }, [navigation]);

    const sortedMerchants = useMemo(() => {
        let result = [...merchants];
        if (sortOrder === 'asc') {
            result.sort((a, b) => (a.businessName || '').localeCompare(b.businessName || ''));
        } else if (sortOrder === 'desc') {
            result.sort((a, b) => (b.businessName || '').localeCompare(a.businessName || ''));
        }
        return result;
    }, [merchants, sortOrder]);

    const filteredMerchants = useMemo(() => {
        if (!searchQuery.trim()) return sortedMerchants;
        const q = searchQuery.toLowerCase();
        return sortedMerchants.filter(m =>
            (m.businessName || '').toLowerCase().includes(q) ||
            (m.businessType || '').toLowerCase().includes(q)
        );
    }, [sortedMerchants, searchQuery]);

    const toggleSort = () => {
        setSortOrder(prev => {
            if (prev === 'none') return 'asc';
            if (prev === 'asc') return 'desc';
            return 'none';
        });
    };

    return (
        <View style={{ flex: 1 }}>
            {/* Background Image - Blurred */}
            <Image
                source={require('../assets/images/background.png')}
                placeholder={{ blurhash }}
                contentFit="cover"
                transition={0}
                style={StyleSheet.absoluteFillObject}
                blurRadius={40}
                cachePolicy="memory-and-disk"
            />

            <SafeAreaView style={styles.container} edges={['top']}>
                <StatusBar style="light" />

                {/* Header */}
                <View style={styles.header}>
                    {/* User avatar — tappable to Profile */}
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <Image
                            source={userData?.imageUrl
                                ? { uri: userData.imageUrl }
                                : require('../assets/images/avatar.png')}
                            placeholder={{ blurhash }}
                            contentFit="cover"
                            transition={0}
                            style={styles.headerAvatar}
                            cachePolicy="memory-and-disk"
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>MarketPlace</Text>
                    {/* Cart icon with live badge */}
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Cart')}
                        style={{ padding: 5 }}
                    >
                        <ShoppingCartIcon size={28} color="white" />
                        {cartCount > 0 && (
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>{cartCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchWrapper}>
                    <MagnifyingGlassIcon size={18} color="#9CA3AF" style={{ marginLeft: 4 }} />
                    <TextInput
                        placeholder="Search merchants..."
                        placeholderTextColor="#9CA3AF"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                    />
                </View>

                <View style={styles.body}>
                    {loading && merchants.length === 0 ? (
                        <View style={styles.center}>
                            <ActivityIndicator size="large" color="#F59E0B" />
                        </View>
                    ) : filteredMerchants.length === 0 ? (
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>
                                {searchQuery ? 'No merchants match your search' : 'No approved merchants found'}
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredMerchants}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <MerchantCard
                                    item={item}
                                    onPress={handlePressMerchant}
                                />
                            )}
                            numColumns={2}
                            columnWrapperStyle={styles.row}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                            onEndReached={fetchMoreMerchants}
                            onEndReachedThreshold={0.5}
                            initialNumToRender={8}
                            maxToRenderPerBatch={10}
                            windowSize={5}
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

                {/* Floating Controls */}
                <View style={styles.floatingControls}>
                    <TouchableOpacity style={styles.controlBtn} onPress={toggleSort}>
                        <ArrowsUpDownIcon size={20} color="white" />
                        <Text style={styles.controlText}>
                            Sort {sortOrder === 'none' ? '' : `(${sortOrder === 'asc' ? 'A-Z' : 'Z-A'})`}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: 'white',
        textShadowColor: 'black',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 2,
        flex: 1,
        textAlign: 'center',
    },
    headerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: 'white',
    },
    headerSpacer: {
        width: 42,
    },
    cartBadge: {
        position: 'absolute',
        right: -2,
        top: -2,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    cartBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '800',
    },
    body: {
        flex: 1,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    row: {
        justifyContent: 'space-between',
    },
    card: {
        width: COLUMN_WIDTH,
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    imageWrapper: {
        position: 'relative',
        height: 180,
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    badgeRow: {
        position: 'absolute',
        top: 8,
        left: 8,
        right: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dealBadge: {
        backgroundColor: '#1E293B',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    dealText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700',
    },
    discountBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountText: {
        color: '#D97706',
        fontSize: 10,
        fontWeight: '800',
    },

    cardContent: {
        padding: 12,
    },
    businessName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        lineHeight: 20,
        height: 40,
    },
    businessType: {
        fontSize: 12,
        color: '#6B7280',
        marginVertical: 4,
    },
    actionBtn: {
        backgroundColor: '#F59E0B',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    actionBtnText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '800',
    },
    floatingControls: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        flexDirection: 'row',
        backgroundColor: '#374151',
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.92)',
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 8,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1F2937',
        paddingVertical: 0,
    },
    controlBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    controlText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#9CA3AF',
        fontWeight: '600',
    }
});

export default RestaurantListScreen;
