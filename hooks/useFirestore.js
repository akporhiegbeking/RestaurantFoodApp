import { useState, useCallback } from 'react';
import {
    collection,
    query,
    where,
    getDocs,
    limit,
    startAfter,
    orderBy,
    onSnapshot
} from 'firebase/firestore';
import { db } from '../constants/firebase';

export const useFirestore = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch paginated restaurants
    const getRestaurants = async (lastDoc = null, pageSize = 10) => {
        setLoading(true);
        try {
            let q = query(
                collection(db, 'restaurants'),
                where('isApproved', '==', true),
                orderBy('createdAt', 'desc'),
                limit(pageSize)
            );

            if (lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const lastVisible = snapshot.docs[snapshot.docs.length - 1];

            return { data, lastVisible };
        } catch (err) {
            setError(err.message);
            return { data: [], lastVisible: null };
        } finally {
            setLoading(false);
        }
    };

    // Fetch paginated foods by restaurant
    const getFoodsByRestaurant = async (restaurantId, lastDoc = null, pageSize = 10) => {
        setLoading(true);
        try {
            let q = query(
                collection(db, 'foods'),
                where('restaurantId', '==', restaurantId),
                where('isAvailable', '==', true),
                orderBy('createdAt', 'desc'),
                limit(pageSize)
            );

            if (lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const lastVisible = snapshot.docs[snapshot.docs.length - 1];

            return { data, lastVisible };
        } catch (err) {
            setError(err.message);
            return { data: [], lastVisible: null };
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories
    const getCategories = async () => {
        try {
            const q = query(collection(db, 'restaurant_categories'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err) {
            setError(err.message);
            return [];
        }
    };

    return {
        loading,
        error,
        getRestaurants,
        getFoodsByRestaurant,
        getCategories
    };
};
