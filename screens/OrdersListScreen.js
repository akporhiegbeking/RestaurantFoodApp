import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../constants/firebase';
import { MaterialIcons } from '@expo/vector-icons';
import { ChevronLeftIcon } from 'react-native-heroicons/solid';
import { SafeAreaView } from 'react-native-safe-area-context';

const OrdersListScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchOrders = async () => {
    try {
      const userUID = auth.currentUser.uid;
      const ordersQuery = query(collection(db, 'orders'), where('user.uid', '==', userUID));
      const querySnapshot = await getDocs(ordersQuery);
      const fetchedOrders = [];

      querySnapshot.forEach((doc) => {
        const orderData = doc.data();
        const foodItems = orderData.foodItems || [];
        foodItems.forEach((foodItem, index) => {
          fetchedOrders.push({ 
            ...foodItem, 
            orderId: doc.id, 
            index, 
            orderStatus: orderData.status || 'pending',
            totalPrice: orderData.totalPrice,
            paymentStatus: orderData.paymentStatus,
            createdAt: orderData.createdAt,
          });
        });
      });

      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.orderItem}
      onPress={() => navigation.navigate('OrderDetails', { order: item })}
    >
      <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} style={styles.image} />
      
      <View style={styles.orderInfo}>
        <View style={styles.orderHeaderRow}>
          <Text style={styles.orderName}>{item.name}</Text>
          <Text style={styles.orderPrice}>₦{item.price}</Text>
        </View>
        
        <View style={styles.orderSubRow}>
          <Text style={styles.orderId}>Order #{item.orderId.substring(0, 8)}...</Text>
          <Text style={styles.orderQuantity}>Qty: {item.quantity}</Text>
        </View>

        <View style={styles.actionRow}>
          <View style={[styles.statusContainer, { backgroundColor: item.orderStatus === 'completed' ? '#4caf50' : '#ff9800' }]}>
            <Text style={styles.orderStatus}>{item.orderStatus.toUpperCase()}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeftIcon size="23" color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}> Orders Placed</Text>
      </View>
      {orders.length === 0 ? (
        <View style={styles.noOrdersContainer}>
          <Text style={styles.noOrdersText}>No orders found</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.orderId}-${item.food_id}-${item.index}`} // Ensure unique key
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'black',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  listContainer: {
    padding: 15,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  orderInfo: {
    flex: 1,
  },
  orderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  orderId: {
    fontSize: 12,
    color: '#888',
  },
  orderQuantity: {
    fontSize: 14,
    color: '#666',
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 5,
  },
  statusContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  orderStatus: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOrdersText: {
    fontSize: 18,
    color: '#888',
  },
});

export default OrdersListScreen;
