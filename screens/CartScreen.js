import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../constants/firebase';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { collection, getDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Toast from 'react-native-root-toast';
import { ChevronLeftIcon } from 'react-native-heroicons/solid';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartScreen = () => {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({}); 
  const [paymentMethod, setPaymentMethod] = useState('Pay now'); 

  const getUserData = async () => {
    const userQuery = query(
      collection(db, 'users'),
      where('uid', '==', auth.currentUser.uid)
    );
    try {
      const userSnapshot = await getDocs(userQuery);
      if (userSnapshot.size === 0) {
        console.error('User not found');
        return;
      }
      const userDoc = userSnapshot.docs[0];
      const user = userDoc.data();
      if (!user) {
        console.error('User data is null');
        return;
      }
      
      setUserData({
        ...user,
      });
     
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  
  const fetchData = async () => {
    try {
      await getUserData();
      const user = auth.currentUser;
      if (user) {
        const cartQuery = query(collection(db, 'cart'), where('uid', '==', user.uid));
        const querySnapshot = await getDocs(cartQuery);
        const items = querySnapshot.docs
          .map(doc => ({ ...doc.data(), id: doc.id }))
          .filter(item => item.orderStatus !== 'placed'); // Filter out already placed items
        setCartItems(items);
        calculateTotal(items);
      } else {
        Toast.show('User is not logged in', {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
        });
      }
    } catch (error) {
      console.error('Error fetching cart items: ', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [auth.currentUser]);

  const handleBuyNow = () => {
    if (paymentMethod === 'Pay now') {
      navigation.navigate('PayStackPayment', {
        totalPrice,
        cartItems,
        userData,
      });
    } else {
      navigation.navigate('PaymentOnDelivery', {
        totalPrice,
        cartItems,
        userData,
      });
    }
  };

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => {
      const itemPrice = Number(item.price);
      const itemQuantity = Number(item.quantity);
      return sum + (itemPrice * itemQuantity);
    }, 0);
    setTotalPrice(total);
  };

  const handleQuantityChange = async (id, delta) => {
    const updatedItems = cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) {
          handleRemoveItem(id);
        } else {
          item.quantity = newQuantity;
          updateDoc(doc(db, 'cart', id), { quantity: newQuantity });
        }
      }
      return item;
    });
    setCartItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const handleRemoveItem = async (id) => {
    try {
      await deleteDoc(doc(db, 'cart', id));
      const updatedItems = cartItems.filter(item => item.id !== id);
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
    } catch (error) {
      console.error('Error removing item from cart: ', error);
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />

      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.itemPrice}>
            ₦ {item.price}
          </Text>          
        </View>

        <Text style={styles.stockInfo}>{item.stockInfo}</Text>

        <View style={styles.quantityControl}>
          <TouchableOpacity onPress={() => handleQuantityChange(item.id, -1)}>
            <Text style={styles.quantityButton}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => handleQuantityChange(item.id, 1)}>
            <Text style={styles.quantityButton}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
            <Text style={styles.removeButton}>Remove</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ChevronLeftIcon size="23" stroke={50} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>       
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : cartItems.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartText}>No item on your Cart</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.shopButton}>
            <Text style={styles.shopButtonText}>Shop Food Item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>Subtotal</Text>
            <Text style={styles.totalPrice}>₦ {totalPrice.toFixed(2)}</Text>
          </View>

          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={renderCartItem}
            contentContainerStyle={styles.cartList}
          />
      
          <View style={styles.deliveryDetails}>
            <Text style={styles.deliveryTitle}>Delivery details</Text>
            <View style={styles.deliveryItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.deliveryLabel}>Location</Text>
                <Text style={[styles.deliveryValue, { marginLeft: 10 }]}>
                  {userData.home_address?.length > 25 ? userData.home_address.substring(0, 25) + '...' : userData.home_address || ''}
                </Text>
              </View>

              <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.deliveryItem}>
              <Text style={styles.deliveryLabel}>Contact</Text>
              <Text style={styles.deliveryValue}>{userData.phoneNumber || ''}</Text>              
            </View>

            <View style={styles.deliveryItem}>
              <Text style={styles.deliveryLabel}>Estimated delivery time</Text>
              <Text style={styles.deliveryValue}>20 - 50 mins</Text>             
            </View>

            <View style={styles.paymentSection}>
              <Text style={styles.deliveryTitle}>Payment method</Text>
              <TouchableOpacity 
                style={styles.paymentOption} 
                onPress={() => setPaymentMethod('Pay now')}
              >
                <View style={[styles.radioButton, paymentMethod === 'Pay now' && styles.radioButtonSelected]}>
                  {paymentMethod === 'Pay now' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.paymentOptionText}>Pay now</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.paymentOption} 
                onPress={() => setPaymentMethod('Pay on Delivery')}
              >
                <View style={[styles.radioButton, paymentMethod === 'Pay on Delivery' && styles.radioButtonSelected]}>
                  {paymentMethod === 'Pay on Delivery' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.paymentOptionText}>Pay on Delivery</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={handleBuyNow} style={styles.checkoutButton}>
            <Text style={styles.checkoutButtonText}>Checkout (₦ {totalPrice.toFixed(2)})</Text>
          </TouchableOpacity>
        </>
      )}
      </View>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  carTextSummary: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartList: {
    padding: 15,
  },
  cartItem: {
    flexDirection: 'row',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    color: '#888',
    marginRight: 10,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  stockInfo: {
    fontSize: 14,
    color: '#888',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  quantityButton: {
    fontSize: 20,
    width: 30,
    textAlign: 'center',
    backgroundColor: '#f1f1f1',
    padding: 5,
    borderRadius: 5,
  },
  quantity: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  removeButton: {
    fontSize: 14,
    color: 'red',
    marginLeft: 10,
  },
  checkoutButton: {
    backgroundColor: '#ff6347',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    marginHorizontal: 15,
    borderRadius: 10,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#000',
  },
  headerButton: {
    padding: 10,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: '#ff6347',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deliveryDetails: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  deliveryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  deliveryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  deliveryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deliveryValue: {
    fontSize: 16,
  },
  editButton: {
    marginLeft: 10,
  },
  editButtonText: {
    color: 'blue',
    fontSize: 16,
  },
  paymentSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  paymentOptionText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ff6347',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#ff6347',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff6347',
  },

});

export default CartScreen;
