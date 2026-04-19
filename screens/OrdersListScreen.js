import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../constants/firebase';
import { MaterialIcons } from '@expo/vector-icons';
import { ChevronLeftIcon } from 'react-native-heroicons/solid';

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
        const foodItems = orderData.foodItems;
        foodItems.forEach((foodItem, index) => {
          fetchedOrders.push({ ...foodItem, orderId: doc.id, index, ...orderData.paymentReference });
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
    <View style={styles.orderItem}>
      <Image source={{ uri: item.imageURL || 'https://via.placeholder.com/150' }} style={styles.image} />
      <View style={styles.orderInfo}>
        <Text style={styles.orderName}>{item.name}</Text>
        <Text style={styles.orderId}>Order #{item.orderId}</Text>
        {/* <Text style={styles.orderDate}>On {item.timestamp ? new Date(item.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}</Text> */}
        <View style={styles.statusContainer}>
          <Text style={styles.orderStatus}>{item.paymentStatus || 'CONFIRMED'}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
    </View>
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
  },
  orderId: {
    fontSize: 14,
    color: '#888',
  },
  orderDate: {
    fontSize: 14,
    color: '#888',
  },
  statusContainer: {
    backgroundColor: '#4caf50',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  orderStatus: {
    fontSize: 14,
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
