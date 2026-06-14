import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, ScrollView, Dimensions, TextInput
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../constants/firebase';
import {
    ChevronLeftIcon, ShoppingCartIcon, MagnifyingGlassIcon, AdjustmentsVerticalIcon,
    ArrowsUpDownIcon, HeartIcon, StarIcon, EllipsisVerticalIcon
} from 'react-native-heroicons/outline';
import { HeartIcon as HeartIconSolid } from 'react-native-heroicons/solid';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;
const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const RestaurantListScreen = () => {
    const navigation = useNavigation();
    const [merchants, setMerchants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState({});

    useEffect(() => {
        const q = query(
            collection(db, 'merchants'),
            where('isApproved', '==', true)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMerchants = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMerchants(fetchedMerchants);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching merchants:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const toggleFavorite = (id) => {
        setFavorites(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const MerchantCard = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('RestaurantDetails', { restaurantId: item.id })}
        >
            <View style={styles.imageWrapper}>
                <Image
                    source={item.imageUrl ? { uri: item.imageUrl } : require('../assets/images/background.png')}
                    placeholder={{ blurhash }}
                    contentFit="cover"
                    transition={1000}
                    style={styles.cardImage}
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
                <TouchableOpacity
                    style={styles.favoriteBtn}
                    onPress={() => toggleFavorite(item.id)}
                >
                    {favorites[item.id] ? (
                        <HeartIconSolid size={20} color="#F59E0B" />
                    ) : (
                        <HeartIcon size={20} color="#F59E0B" />
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.businessName} numberOfLines={2}>
                    {item.businessName || 'Business Name'}
                </Text>

                <Text style={styles.businessType}>
                    {item.businessType || 'General'}
                </Text>

                <View style={styles.ratingRow}>
                    <View style={styles.stars}>
                        {[1, 2, 3, 4, 5].map((s) => (
                            <StarIcon key={s} size={12} color="#F59E0B" style={{ marginRight: 1 }} />
                        ))}
                    </View>
                    <Text style={styles.ratingCount}>(12)</Text>
                </View>

                <View style={styles.footerRow}>
                    <Text style={styles.expressText}>EXPRESS</Text>
                </View>

                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('RestaurantDetails', { restaurantId: item.id })}
                >
                    <Text style={styles.actionBtnText}>Visit Store</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeftIcon size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>MarketPlace</Text>
                <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
                    <ShoppingCartIcon size={24} color="#1A1A1A" />
                    <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>1</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.body}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#F59E0B" />
                    </View>
                ) : merchants.length === 0 ? (
                    <View style={styles.center}>
                        <Text style={styles.emptyText}>No approved merchants found</Text>
                    </View>
                ) : (
                    <FlatList
                        data={merchants}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <MerchantCard item={item} />}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </View>

            {/* Floating Controls */}
            <View style={styles.floatingControls}>
                <TouchableOpacity style={styles.controlBtn}>
                    <ArrowsUpDownIcon size={20} color="white" />
                    <Text style={styles.controlText}>Sort</Text>
                </TouchableOpacity>
                <View style={styles.controlDivider} />
                <TouchableOpacity style={styles.controlBtn}>
                    <AdjustmentsVerticalIcon size={20} color="white" />
                    <Text style={styles.controlText}>Filters</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1A1A1A',
    },
    cartBtn: {
        padding: 4,
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#F59E0B',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    cartBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '900',
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
    favoriteBtn: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 6,
        borderRadius: 20,
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
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    stars: {
        flexDirection: 'row',
    },
    ratingCount: {
        fontSize: 11,
        color: '#9CA3AF',
        marginLeft: 4,
    },
    footerRow: {
        marginBottom: 12,
    },
    expressText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#F59E0B',
        fontStyle: 'italic',
    },
    actionBtn: {
        backgroundColor: '#F59E0B',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
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
    controlDivider: {
        width: 1,
        height: 20,
        backgroundColor: '#4B5563',
        marginHorizontal: 15,
    },
    emptyText: {
        fontSize: 16,
        color: '#9CA3AF',
        fontWeight: '600',
    }
});

export default RestaurantListScreen;

