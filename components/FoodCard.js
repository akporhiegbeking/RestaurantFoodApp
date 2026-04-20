import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react';
import { ShoppingBagIcon } from 'react-native-heroicons/solid'
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../constants/firebase'; 
import { collection, addDoc } from 'firebase/firestore';
import Toast from 'react-native-root-toast';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.44;

export default function FoodCard({item, index}) {
  const navigation = useNavigation();

  const handleAddToCart = async () => {
    try {
      await addDoc(collection(db, 'cart'), {
        uid: auth.currentUser.uid, 
        food_id: item.id,
        quantity: 1,
        price: item.price,
        name: item.name,  
        imageUrl: item.imageUrl, 
      });
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
        onPress={() => navigation.navigate('FoodDetails', {...item})}
        style={styles.glassTop}
      >
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.image}
          resizeMode="contain"
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
            onPress={handleAddToCart}
          >
            <ShoppingBagIcon size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Animatable.View>
  )
}

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

