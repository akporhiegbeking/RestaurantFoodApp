import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { StatusBar as RNStatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

const FloatingMoney = ({ delay, startX, startY }) => {
  return (
    <Animatable.View
      animation={{
        from: { translateY: height + 100, rotate: '0deg', opacity: 0 },
        to: { translateY: -200, rotate: '360deg', opacity: 1 },
      }}
      duration={4000 + Math.random() * 2000}
      delay={delay}
      iterationCount="infinite"
      easing="linear"
      style={[
        styles.moneyLayer,
        { left: startX, top: startY }
      ]}
    >
      <FontAwesome5 name="money-bill-wave" size={24} color="#A5D6A7" opacity={0.6} />
    </Animatable.View>
  );
};

const OrderSuccessScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <RNStatusBar backgroundColor="#22C55E" barStyle="light-content" />
      <LinearGradient
        colors={['#22C55E', '#15803D']}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Money Decorations */}
      {[...Array(12)].map((_, i) => (
        <FloatingMoney 
          key={i} 
          delay={i * 400} 
          startX={Math.random() * width} 
          startY={height + 50}
        />
      ))}

      <View style={styles.content}>
        <Animatable.Text 
          animation="fadeInDown" 
          duration={800}
          style={styles.headerTitle}
        >
          Payment made successfully
        </Animatable.Text>

        <Animatable.View 
          animation="zoomIn" 
          duration={1000}
          delay={200}
          style={styles.card}
        >
          <View style={styles.graphicContainer}>
            <View style={styles.heartCircle}>
              <Ionicons name="heart" size={60} color="#22C55E" />
            </View>
            <Animatable.View 
              animation="pulse" 
              iterationCount="infinite" 
              style={styles.pulseContainer}
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Success!</Text>
            <Text style={styles.cardDescription}>
              Your meal is being prepared. Share the joy with others!
            </Text>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Home')} 
              style={styles.homeButton}
            >
              <Text style={styles.homeButtonText}>Go to Home</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-social-outline" size={20} color="#64748b" />
              <Text style={styles.shareButtonText}>Share Receipt</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  moneyLayer: {
    position: 'absolute',
    zIndex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.12,
    alignItems: 'center',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 20,
  },
  graphicContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  heartCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    borderWidth: 4,
    borderColor: '#dcfce7',
  },
  pulseContainer: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    zIndex: 1,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  actionContainer: {
    width: '100%',
    gap: 16,
  },
  homeButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  shareButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  shareButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderSuccessScreen;
