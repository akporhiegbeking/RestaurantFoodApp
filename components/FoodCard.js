import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, memo } from 'react';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../constants/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc, query, where, getDocs } from 'firebase/firestore';
import Toast from 'react-native-root-toast';

const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.44;

const FoodCard = memo(({ item, index }) => {
  const navigation = useNavigation();

  const handleAddToCart = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Toast.show('Please login to add to cart', {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
        });
        return;
      }

      const cartQuery = query(collection(db, 'carts'), where('userId', '==', user.uid));
      const cartSnap = await getDocs(cartQuery);

      const newItem = {
        foodId: item.id || '',
        merchantId: item.merchantId || item.restaurantId || '',
        merchantName: item.merchantName || item.restaurantName || '',
        name: item.name || '',
        imageUrl: item.imageUrl || '',
        price: item.price || 0,
        quantity: 1,
      };

      if (!cartSnap.empty) {
        const cartDoc = cartSnap.docs[0];
        const cartRef = doc(db, 'carts', cartDoc.id);
        const cartData = cartDoc.data();
        const existingItemIndex = cartData.items.findIndex(i => i.foodId === item.id);

        if (existingItemIndex > -1) {
          cartData.items[existingItemIndex].quantity += 1;
        } else {
          cartData.items.push(newItem);
        }

        await updateDoc(cartRef, {
          items: cartData.items,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'carts'), {
          items: [newItem],
          userId: user.uid,
          updatedAt: serverTimestamp()
        });
      }

      Toast.show('Item added to cart!', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
    } catch (error) {
      console.error('Error adding item to cart: ', error);
    }
  };

  return (
    <Animatable.View
      delay={index * 100}
      animation="fadeInUp"
      style={styles.card}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('FoodDetails', { ...item })}
        style={styles.glassTop}
      >
        <Image
          source={{ uri: item.imageUrl }}
          placeholder={{ blurhash }}
          contentFit="contain"
          transition={0}
          style={styles.image}
          cachePolicy="memory-and-disk"
        />
      </TouchableOpacity>

      <View style={styles.bottomSection}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.price}>₦ {item.price}</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.cartButton}
            onPress={() => navigation.navigate('FoodDetails', { ...item })}
          >
            <Ionicons name="arrow-forward" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Animatable.View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.25)', // Glassmorphism base
    borderRadius: 35,
    marginBottom: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)', // Glass border
  },
  glassTop: {
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  bottomSection: {
    backgroundColor: 'white',
    padding: 14,
    paddingTop: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937', // Darker gray/black for contrast on white
    marginBottom: 2,
  },
  description: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 15,
    height: 30, // Keep consistent height
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#111827',
  },
  cartButton: {
    backgroundColor: '#001F33', // Dark matching the app theme
    padding: 10,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    elevation: 5,
  }
});

export default FoodCard;

