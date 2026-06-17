import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { auth, db } from '../constants/firebase';
import { useNavigation } from '@react-navigation/native';
import {
  collection, getDocs, query, where, deleteDoc, doc, onSnapshot,
} from 'firebase/firestore';
import Toast from 'react-native-root-toast';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const SavedItemsScreen = () => {
  const navigation = useNavigation();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const savedItemsQuery = query(
      collection(db, 'saved_items'),
      where('uid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(savedItemsQuery, async (snapshot) => {
      const rawItems = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

      // Separate items with metadata from those without
      const completeItems = [];
      const pendingFoodIds = [];
      const pendingIndices = [];

      rawItems.forEach((item, index) => {
        if (item.name && item.price && item.imageUrl) {
          completeItems[index] = item;
        } else {
          pendingFoodIds.push(item.food_id);
          pendingIndices.push(index);
        }
      });

      if (pendingFoodIds.length > 0) {
        setSavedItems(rawItems); // Show what we have (even if empty)

        // Fetch missing food details in batches of 30 (Firestore limit for 'in')
        const fetchedFoods = {};
        for (let i = 0; i < pendingFoodIds.length; i += 30) {
          const batch = pendingFoodIds.slice(i, i + 30);
          const foodsQuery = query(collection(db, 'foods'), where('__name__', 'in', batch));
          const foodSnap = await getDocs(foodsQuery);
          foodSnap.forEach(doc => {
            fetchedFoods[doc.id] = { ...doc.data(), id: doc.id };
          });
        }

        // Merge fetched data back into the list
        const finalItems = rawItems.map(item => {
          if (!item.name && fetchedFoods[item.food_id]) {
            const { id, ...foodData } = fetchedFoods[item.food_id];
            return { ...item, ...foodData };
          }
          return item;
        });
        setSavedItems(finalItems);
      } else {
        setSavedItems(rawItems);
      }

      setLoading(false);
    }, (error) => {
      console.error('Error fetching saved items: ', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const handleRemoveItem = async (id) => {
    try {
      await deleteDoc(doc(db, 'saved_items', id));
      const updatedItems = savedItems.filter(item => item.id !== id);
      setSavedItems(updatedItems);
      Toast.show('Item removed from saved!', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
    } catch (error) {
      console.error('Error removing item from saved: ', error);
    }
  };

  const renderSavedItem = ({ item }) => (
    <View style={styles.savedItem}>
      <Image
        source={{ uri: item.imageUrl }}
        placeholder={{ blurhash }}
        contentFit="cover"
        transition={1000}
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₦ {Number(item.price).toLocaleString()}</Text>
        <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={styles.removeButton}>
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={23} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Items</Text>
          <View style={styles.headerSpacer} />
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : savedItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No saved items</Text>
          </View>
        ) : (
          <FlatList
            data={savedItems}
            keyExtractor={(item) => item.id}
            renderItem={renderSavedItem}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SavedItemsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // marginTop: 10,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#000',
  },
  headerButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
  },
  headerSpacer: {
    width: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: 'gray',
  },
  listContainer: {
    padding: 10,
  },
  savedItem: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 10,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemDetails: {
    marginLeft: 10,
    justifyContent: 'center',
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 16,
    color: 'green',
  },
  removeButton: {
    marginTop: 10,
    padding: 5,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  removeButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});
