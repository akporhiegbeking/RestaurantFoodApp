import React, { useState } from 'react';
import { 
  View, Text, ActivityIndicator, TouchableOpacity, 
  StyleSheet, ScrollView, Modal 
} from 'react-native';
import { usePaystack } from 'react-native-paystack-webview';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../constants/firebase';
import Toast from 'react-native-root-toast';
import { StatusBar as RNStatusBar } from 'react-native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';

const PayStackPayment = ({ route }) => {
  const navigation = useNavigation();
  const { totalPrice, cartItems, userData } = route.params;
  const [loading, setLoading] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  
  const { popup } = usePaystack();

  const amountNGN = totalPrice.toFixed(2);
  const amountInKobo = Math.round(totalPrice * 100);

  const handlePaymentSuccess = async (response) => {
    console.log('Payment success response:', response);
    const reference = response?.reference ?? response?.transactionRef?.reference ?? response?.transactionRef ?? "";
    
    setLoading(true);
    try {
      const orderData = {
        foodItems: cartItems,
        totalPrice, // Original field
        amountNGN, // New field from example logic
        amountInKobo, // New field from example logic
        user: userData,
        paymentReference: reference,
        paymentStatus: 'success',
        status: 'pending',
        provider: "paystack",
        createdAt: serverTimestamp(),
        reference, // New field from example logic
      };

      console.log('Saving order data:', orderData);

      const ordersCollection = collection(db, 'orders');
      await addDoc(ordersCollection, orderData);
      console.log('Order saved successfully!');
      setLoading(false);
      setSuccessVisible(true);
    } catch (error) {
      console.error('Error saving order:', error);
      Toast.show('Error saving order', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        backgroundColor: 'red',
      });
      setLoading(false);
    }
  };

  const handlePaymentCancel = (response) => {
    console.log('Payment cancelled:', response);
    Toast.show('Payment cancelled', {
      duration: Toast.durations.LONG,
      position: Toast.positions.BOTTOM,
    });
  };

  const handlePayNow = () => {
    if (!userData?.email) {
      alert("User email not found. Please try again.");
      return;
    }

    popup.checkout({
      email: userData.email,
      amount: totalPrice, // Use totalPrice directly to avoid 100x excess (NGN interpretation)
      reference: `order_ref_${userData.email.split('@')[0]}_${Date.now()}`,
      onSuccess: (res) => {
        handlePaymentSuccess(res);
      },
      onCancel: (e) => {
        handlePaymentCancel(e);
      },
      onError: (err) => {
        console.error("Payment error:", err);
        alert("Payment failed. Please try again.");
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar backgroundColor="#06191D" barStyle="light-content" />
      
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <ChevronLeftIcon size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Payment Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Price:</Text>
            <Text style={styles.amountValue}>₦{totalPrice.toFixed(2)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Customer Name:</Text>
            <Text style={styles.detailValue}>{userData.fullName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{userData.email}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone:</Text>
            <Text style={styles.detailValue}>{userData.phoneNumber}</Text>
          </View>

          <View style={styles.sectionDivider}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>
          <Text style={styles.addressText}>{userData.home_address}</Text>
        </View>

        {/* Pay Now Button */}
        <TouchableOpacity style={styles.payBtn} onPress={handlePayNow}>
          <Text style={styles.payText}>Pay ₦{totalPrice.toFixed(2)}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={successVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Payment Successful! 🎉
            </Text>
            <Text style={styles.modalSubtitle}>
              Your order has been recorded.
            </Text>

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setSuccessVisible(false);
                navigation.navigate('OrderSuccess');
              }}
            >
              <Text style={styles.modalBtnText}>
                View Order Details
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Processing Order...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 24,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
  },
  sectionDivider: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addressText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  payBtn: {
    backgroundColor: '#059669',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  payText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
    textAlign: 'center',
  },
  modalBtn: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PayStackPayment;
