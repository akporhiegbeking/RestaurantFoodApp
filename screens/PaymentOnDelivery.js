import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../constants/firebase';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import Toast from 'react-native-root-toast';
import { StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PaymentOnDelivery = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { totalPrice, cartItems, userData } = route.params;
  const [loading, setLoading] = useState(false);

  const handleConfirmOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        foodItems: cartItems,
        totalPrice,
        user: userData,
        paymentStatus: 'pending',
        status: 'pending',
        paymentMethod: 'POS/Bank Transfer on Delivery',
        createdAt: serverTimestamp(),
      };

      const ordersCollection = collection(db, 'orders');
      await addDoc(ordersCollection, orderData);
      
      // Mark items as placed in cart instead of deleting
      for (const item of cartItems) {
        try {
          await updateDoc(doc(db, 'cart', item.id), { orderStatus: 'placed' });
        } catch (err) {
          console.error(`Error updating item ${item.id} in cart:`, err);
        }
      }

      setLoading(false);
      navigation.navigate('OrderSuccess');
    } catch (error) {
      console.error('Error saving order:', error);
      Toast.show('Error confirming order. Please try again.', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        backgroundColor: 'red',
      });
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar backgroundColor="#f8fafc" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <ChevronLeftIcon size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Confirmation</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Pay on Delivery</Text>
          <Text style={styles.infoDescription}>
            Your order will be processed immediately. You can pay our rider upon arrival using:
          </Text>
          <View style={styles.paymentMethodsGrid}>           
            <View style={styles.paymentMethodItem}>
              <Text style={styles.paymentMethodLabel}>💳 POS Machine</Text>
            </View>
            <View style={styles.paymentMethodItem}>
              <Text style={styles.paymentMethodLabel}>🏦 Bank Transfer</Text>
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.card}>
            {cartItems.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemText}>{item.quantity}x {item.name}</Text>
                <Text style={styles.itemPriceText}>₦{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total to Pay</Text>
              <Text style={styles.totalValue}>₦{totalPrice.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Delivery to */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <View style={styles.card}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Recipient</Text>
              <Text style={styles.detailValue}>{userData.fullName || 'User'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{userData.phoneNumber || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Address</Text>
              <Text style={styles.detailValue}>{userData.home_address || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.confirmButton} 
          onPress={handleConfirmOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  scrollContent: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 15,
    color: '#1e3a8a',
    lineHeight: 22,
    marginBottom: 16,
  },
  paymentMethodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  paymentMethodItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  paymentMethodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemText: {
    fontSize: 15,
    color: '#334155',
    flex: 1,
  },
  itemPriceText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ff6347',
  },
  detailItem: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  confirmButton: {
    backgroundColor: '#ff6347',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#ff6347',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});

export default PaymentOnDelivery;
