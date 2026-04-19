import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Modal 
} from 'react-native';
import { Paystack } from 'react-native-paystack-webview';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../constants/firebase';
import Toast from 'react-native-root-toast';
import { StatusBar as RNStatusBar } from 'react-native';

const PayStackPayment = ({ route }) => {
  const navigation = useNavigation();
  const { totalPrice, cartItems, userData } = route.params;
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const paystackWebViewRef = useRef(null);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handlePaymentSuccess = async (response) => {
    console.log('Payment success response:', response);
    setLoading(true);
    try {
      const orderData = {
        foodItems: cartItems,
        totalPrice,
        user: userData,
        paymentReference: response.transactionRef,
        paymentStatus: response.status,
        timestamp: new Date(),
      };

      console.log('Saving order data:', orderData);

      const ordersCollection = collection(db, 'orders');
      await addDoc(ordersCollection, orderData);
      console.log('Order saved successfully!');
      setLoading(false);
      navigation.navigate('OrderSuccess');
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
    navigation.navigate('Cart');
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <RNStatusBar backgroundColor="#06191D" barStyle="white-content" />
      <View style={styles.container}>
        <View 
          className="flex-1 bg-white px-8 pt-8"
          style={styles.infoContainer}
        >
          <Text style={styles.infoText}>Total Price: ₦{totalPrice.toFixed(2)}</Text>
          <Text style={styles.infoText}>Name: {userData.fullName}</Text>
          <Text style={styles.infoText}>Email: {userData.email}</Text>
          <Text style={styles.infoText}>Phone: {userData.phoneNumber}</Text>
          <Text style={styles.infoText}>Address: {userData.home_address}</Text>
        </View>

        <TouchableOpacity style={styles.payNowButton} onPress={toggleModal}>
          <Text style={styles.payNowButtonText}>Pay Now</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={{ flex: 1 }}>
              <Paystack
                paystackKey="pk_test_171072423cd87d4bdd73185a603e918349106d04"
                // paystackKey="pk_live_90b55fa1a44464d95656f61a26f0389d53bd467a"
                amount={totalPrice * 100} // Convert to kobo
                billingEmail={userData.email}
                activityIndicatorColor="green"
                onCancel={(e) => {
                  console.log('Payment cancelled:', e);
                  handlePaymentCancel(e);
                }}
                onSuccess={(response) => {
                  console.log('Paystack response:', response);
                  handlePaymentSuccess(response);
                }}
                ref={paystackWebViewRef}
              />
            </View>

            <TouchableOpacity
              onPress={() => paystackWebViewRef.current.startTransaction()}
              style={styles.payNowButton}
            >
              <Text style={styles.payNowButtonText}>Proceed with Payment</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="green" />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'black',
  },
  infoContainer: {
    borderTopLeftRadius: 50, 
    marginTop: 30,
    borderTopRightRadius: 50
  },
  infoText: {
    fontSize: 16,
    marginVertical: 4,
  },
  payNowButton: {
    backgroundColor: 'green',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payNowButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    marginTop: 16,
  },
  closeButtonText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PayStackPayment;
