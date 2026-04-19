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
        imageURL: item.imageURL, 
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
        style={styles.imageContainer}
      >
        <Image 
          source={{ uri: item.imageURL }} 
          style={styles.image}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.price}>₦ {item.price}</Text>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={handleAddToCart}
          >
            <ShoppingBagIcon size={20} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </Animatable.View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: '#1E293B', // Dark Navy/Slate
    borderRadius: 30,
    marginBottom: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: -20,
    marginBottom: 10,
  },
  image: {
    width: 110,
    height: 110,
  },
  content: {
    flex: 1,
    paddingHorizontal: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 12,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  cartButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    elevation: 3,
  }
});

