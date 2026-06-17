import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    TouchableOpacity, ActivityIndicator, Dimensions
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../constants/firebase';
import { ChevronLeftIcon, BookmarkIcon } from 'react-native-heroicons/outline';
import { BookmarkIcon as BookmarkIconSolid } from 'react-native-heroicons/solid';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function SavedStoresScreen() {
    const navigation = useNavigation();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSavedStores = useCallback(async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            setLoading(true);
            // Get all saved_merchant docs for this user
            const savedQuery = query(
                collection(db, 'saved_merchants'),
                where('uid', '==', user.uid)
            );
            const savedSnap = await getDocs(savedQuery);

            if (savedSnap.empty) {
                setStores([]);
                return;
            }

            // Fetch each merchant's details in parallel
            const merchantPromises = savedSnap.docs.map(async (savedDoc) => {
                const { merchantId, savedAt } = savedDoc.data();
                try {
                    const merchantSnap = await getDoc(doc(db, 'merchants', merchantId));
                    if (merchantSnap.exists()) {
                        return {
                            savedDocId: savedDoc.id,
                            savedAt,
                            id: merchantSnap.id,
                            ...merchantSnap.data(),
                        };
                    }
                    return null;
                } catch {
                    return null;
                }
            });

            const results = (await Promise.all(merchantPromises)).filter(Boolean);
            setStores(results);
        } catch (error) {
            console.error('Error fetching saved stores:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSavedStores();
    }, [fetchSavedStores]);

    const renderStore = ({ item, index }) => (
        <TouchableOpacity
            activeOpacity={0.88}
            style={styles.card}
            onPress={() => navigation.navigate('RestaurantMerchantDetails', { restaurant: item })}
        >
            {/* Cover image */}
            <Image
                source={item.imageUrl ? { uri: item.imageUrl } : require('../assets/images/background.png')}
                placeholder={{ blurhash }}
                contentFit="cover"
                transition={0}
                style={styles.cardImage}
                cachePolicy="memory-and-disk"
            />

            {/* Overlay gradient info */}
            <View style={styles.cardBody}>
                <View style={styles.cardLeft}>
                    <Image
                        source={item.imageUrl ? { uri: item.imageUrl } : require('../assets/images/background.png')}
                        placeholder={{ blurhash }}
                        contentFit="cover"
                        transition={0}
                        style={styles.logoThumb}
                        cachePolicy="memory-and-disk"
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.storeName} numberOfLines={1}>{item.businessName || 'Unknown'}</Text>
                        <Text style={styles.storeType}>{item.businessType || 'Restaurant'}</Text>
                        {item.address ? (
                            <Text style={styles.storeAddress} numberOfLines={1}>{item.address}</Text>
                        ) : null}
                    </View>
                </View>

                <View style={styles.cardRight}>
                    {item.isOpen ? (
                        <View style={styles.openBadge}>
                            <Text style={styles.openText}>OPEN</Text>
                        </View>
                    ) : (
                        <View style={[styles.openBadge, styles.closedBadge]}>
                            <Text style={[styles.openText, { color: '#9CA3AF' }]}>CLOSED</Text>
                        </View>
                    )}
                    <BookmarkIconSolid size={18} color="#F59E0B" style={{ marginTop: 8 }} />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" translucent backgroundColor="transparent" />

            {/* Blurred background */}
            <Image
                source={require('../assets/images/background.png')}
                placeholder={{ blurhash }}
                contentFit="cover"
                transition={0}
                style={StyleSheet.absoluteFill}
                blurRadius={40}
                cachePolicy="memory-and-disk"
            />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronLeftIcon size={22} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Saved Stores</Text>
                    <View style={{ width: 42 }} />
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#F59E0B" />
                    </View>
                ) : stores.length === 0 ? (
                    <View style={styles.center}>
                        <BookmarkIcon size={52} color="rgba(255,255,255,0.4)" />
                        <Text style={styles.emptyTitle}>No saved stores yet</Text>
                        <Text style={styles.emptySubtitle}>Tap the 👍 on a merchant's page to save it here</Text>
                    </View>
                ) : (
                    <FlatList
                        data={stores}
                        keyExtractor={(item) => item.savedDocId}
                        renderItem={renderStore}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f1c2e',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    backBtn: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 50,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: 'white',
        letterSpacing: 0.3,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.75)',
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.45)',
        textAlign: 'center',
        lineHeight: 20,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 5,
    },
    cardImage: {
        width: '100%',
        height: 130,
    },
    cardBody: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        gap: 12,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    logoThumb: {
        width: 48,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    storeName: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1F2937',
    },
    storeType: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
        marginTop: 2,
    },
    storeAddress: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 2,
    },
    cardRight: {
        alignItems: 'center',
    },
    openBadge: {
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    closedBadge: {
        backgroundColor: '#F3F4F6',
    },
    openText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#059669',
    },
});
