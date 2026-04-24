import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeftIcon } from 'react-native-heroicons/solid';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar as RNStatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

const OrderDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { order } = route.params;
  const [showTracking, setShowTracking] = useState(false);

  // Status mapping
  const status = order.status || 'pending';
  const isDelivered = status === 'delivered';
  const isShipped = status === 'shipped';
  const isPreparing = status === 'confirmed' || isShipped;
  const isConfirmed = status === 'pending' || status === 'confirmed' || isShipped;

  // Delivery code (Full doc ID)
  const deliveryCode = order.orderId ? order.orderId.toUpperCase() : 'N/A';

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar backgroundColor={showTracking ? "#15803D" : "#fff"} barStyle={showTracking ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, showTracking && styles.trackingHeader]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeftIcon size={24} color={showTracking ? "white" : "black"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, showTracking && styles.trackingHeaderTitle]}>
          {showTracking ? "Track Order" : "Order Details"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!showTracking ? (
          <>
            {/* Order Info Card */}
            <View style={styles.itemCard}>
              <Image source={{ uri: order.imageUrl || 'https://via.placeholder.com/150' }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{order.name}</Text>
                <Text style={styles.itemPrice}>₦{order.price}</Text>
                <Text style={styles.itemQty}>Quantity: {order.quantity}</Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Order Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Order ID</Text>
                <Text style={styles.detailValue}>#{order.orderId}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Method</Text>
                <Text style={styles.detailValue}>{order.paymentMethod || 'PayStack'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={[styles.statusText, { color: isDelivered ? '#22C55E' : '#EAB308' }]}>
                  {status.toUpperCase()}
                </Text>
              </View>
            </View>

            {isDelivered && (
              <View style={styles.arrivalBanner}>
                <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                <Text style={styles.arrivalText}>Order Arrived Successfully!</Text>
              </View>
            )}

            {!isDelivered && (
              <TouchableOpacity 
                style={styles.trackButton} 
                onPress={() => setShowTracking(true)}
              >
                <Text style={styles.trackButtonText}>Track Order</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.trackingContainer}>
            {/* Hero Section */}
            <View style={styles.trackingHero}>
              <Text style={styles.heroText}>From door to doorstep.</Text>
              <Text style={styles.heroSubtext}>Track every order live.</Text>
            </View>

            {/* Tracking Card */}
            <View style={styles.trackingCard}>
              <View style={styles.handle} />
              
              <Text style={styles.estTimeLabel}>Estimated time of delivery</Text>
              <Text style={styles.estTimeValue}>10:00–10:30</Text>

              <View style={styles.codeContainer}>
                <Text style={styles.codeLabel}>Delivery code (i){'\n'}For the courier</Text>
                <View style={styles.codeBoxes}>
                  {deliveryCode.split('').map((char, i) => (
                    <View key={i} style={styles.codeBox}>
                      <Text style={styles.codeChar}>{char}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Progress Steps */}
              <View style={styles.stepsContainer}>
                {/* Step 1 */}
                <View style={styles.stepRow}>
                  <View style={styles.stepIndicator}>
                    <View style={[styles.dot, isConfirmed && styles.dotActive]}>
                      {isConfirmed && <Ionicons name="checkmark" size={12} color="white" />}
                    </View>
                    <View style={[styles.line, isPreparing && styles.lineActive]} />
                  </View>
                  <Text style={[styles.stepText, isConfirmed && styles.stepTextActive]}>Confirming order</Text>
                </View>

                {/* Step 2 */}
                <View style={styles.stepRow}>
                  <View style={styles.stepIndicator}>
                    <View style={[styles.dot, isPreparing && styles.dotActive]}>
                       {isShipped && <Ionicons name="checkmark" size={12} color="white" />}
                       {!isShipped && isPreparing && <View style={styles.innerDot} />}
                    </View>
                    <View style={[styles.line, isShipped && styles.lineActive]} />
                  </View>
                  <Text style={[styles.stepText, isPreparing && styles.stepTextActive]}>Preparing your order</Text>
                </View>

                {/* Step 3 */}
                <View style={styles.stepRow}>
                  <View style={styles.stepIndicator}>
                    <View style={[styles.dot, isShipped && styles.dotActive]}>
                      {isDelivered && <Ionicons name="checkmark" size={12} color="white" />}
                      {!isDelivered && isShipped && <View style={styles.innerDot} />}
                    </View>
                  </View>
                  <Text style={[styles.stepText, isShipped && styles.stepTextActive]}>Order shipped, Rider on the way</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.closeTracking} 
                onPress={() => setShowTracking(false)}
              >
                <Text style={styles.closeTrackingText}>Hide Tracking</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  trackingHeader: {
    backgroundColor: '#15803D',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: 'black',
  },
  trackingHeaderTitle: {
    color: 'white',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  itemCard: {
    flexDirection: 'row',
    margin: 20,
    padding: 15,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 15,
  },
  itemDetails: {
    marginLeft: 15,
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemPrice: {
    fontSize: 16,
    color: '#22C55E',
    fontWeight: '700',
    marginTop: 4,
  },
  itemQty: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 15,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  statusText: {
    fontSize: 15,
    fontWeight: '800',
  },
  trackButton: {
    backgroundColor: '#0F172A',
    margin: 20,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 40,
  },
  trackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  arrivalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    margin: 20,
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  arrivalText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#15803D',
    fontWeight: '700',
  },
  trackingContainer: {
    backgroundColor: '#15803D',
    minHeight: height,
  },
  trackingHero: {
    padding: 30,
    paddingTop: 10,
  },
  heroText: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    lineHeight: 40,
  },
  heroSubtext: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 10,
  },
  trackingCard: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    marginTop: 20,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 30,
  },
  estTimeLabel: {
    textAlign: 'center',
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  estTimeValue: {
    textAlign: 'center',
    fontSize: 36,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 10,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 20,
    marginTop: 20,
  },
  codeLabel: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginRight: 10,
  },
  codeBoxes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    flex: 1,
    gap: 5,
  },
  codeBox: {
    width: 32,
    height: 32,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  codeChar: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepsContainer: {
    marginTop: 40,
  },
  stepRow: {
    flexDirection: 'row',
    height: 80,
  },
  stepIndicator: {
    width: 40,
    alignItems: 'center',
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  dotActive: {
    backgroundColor: '#22C55E',
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  line: {
    width: 2,
    height: 60,
    backgroundColor: '#F1F5F9',
    position: 'absolute',
    top: 24,
    zIndex: 1,
  },
  lineActive: {
    backgroundColor: '#22C55E',
  },
  stepText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
    marginLeft: 15,
    top: 2,
  },
  stepTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  closeTracking: {
    marginTop: 20,
    alignItems: 'center',
    padding: 10,
  },
  closeTrackingText: {
    color: '#64748B',
    fontWeight: '600',
  }
});

export default OrderDetails;
