import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react';
import { ArrowRightIcon, ShoppingBagIcon } from 'react-native-heroicons/solid'
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../constants/firebase'; 
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import Toast from 'react-native-root-toast';

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

      // Fetch and log cart items
      const cartCollection = collection(db, 'cart');
      const cartQuery = query(cartCollection, where('uid', '==', auth.currentUser.uid));
      const cartSnapshot = await getDocs(cartQuery);
      const cartItems = cartSnapshot.docs.map(doc => doc.data());
      console.log('Cart Items:', cartItems);

    } catch (error) {
      console.error('Error adding item to cart: ', error);
    }
  };


  return (
    <Animatable.View
      delay={index*120}
      animation="slideInRight"
      className="w-60 h-70 my-5 mr-6 p-3 py-5 rounded-3xl"
      style={{backgroundColor: 'rgba(255,255,255,0.2)'}}
    >
      <View className="flex-row justify-center">
        <TouchableOpacity
          onPress={()=> navigation.navigate('FoodDetails', {...item})}         
        >
          <Image 
            source={{ uri: item.imageURL }} 
            className="h-32 w-32"
          />
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-3 py-2 space-y-2">
        <Text
          onPress={()=> navigation.navigate('FoodDetails', {...item})} 
          className="text-white text-xl font-medium tracking-wider"
        >
          {item.name}
        </Text>
        
        <Text
          onPress={()=> navigation.navigate('FoodDetails', {...item})} 
          className="text-white"
        >
          {item.description}
        </Text>

      </View>

      <View className="flex-row justify-between items-center px-1">
        <Text className="text-2xl font-semibold text-white">₦ {item.price}</Text>

        <TouchableOpacity
          className="bg-white p-3 rounded-full"
          onPress={handleAddToCart}
        >
          <ShoppingBagIcon size="25" color="black"/>
        </TouchableOpacity>

      </View>
      
    </Animatable.View>
  )
}
