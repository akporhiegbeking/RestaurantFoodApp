import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, Animated,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const GridBackground = () => (
  <View style={styles.gridContainer}>
    {[...Array(20)].map((_, i) => (
      <View key={`v-${i}`} style={[styles.gridLineV, { left: (width / 10) * i }]} />
    ))}
    {[...Array(20)].map((_, i) => (
      <View key={`h-${i}`} style={[styles.gridLineH, { top: (height / 20) * i }]} />
    ))}
  </View>
);

export default function WelcomeScreen() {
  const navigation = useNavigation();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const burgerScale = useRef(new Animated.Value(0.7)).current;
  const buttonSlide = useRef(new Animated.Value(80)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(burgerScale, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background image */}
      <Image
        source={require('../assets/images/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
        blurRadius={18}
      />

      {/* Blur simulation: stacked dark overlays */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)' }]} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.30)' }]} />

      {/* Golden-to-black gradient overlay */}
      <LinearGradient
        colors={['rgba(139, 111, 0, 0.72)', 'rgba(0,0,0,0.93)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.72 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle grid overlay */}
      <GridBackground />

      <SafeAreaView style={styles.safeArea}>
        {/* Top tag */}
        <Animated.View style={[styles.tagContainer, { opacity: fadeAnim }]}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>🍔  RestaurantFoodApp </Text>
          </View>
        </Animated.View>

        {/* Burger image */}
        <Animated.View style={[styles.burgerWrapper, { transform: [{ scale: burgerScale }], opacity: fadeAnim }]}>
          <View style={styles.burgerGlow} />
          <ExpoImage
            source={require('../assets/images/burger.png')}
            style={styles.burgerImage}
            contentFit="contain"
            transition={600}
          />
        </Animated.View>

        {/* Text content */}
        <Animated.View
          style={[
            styles.textContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.headline}>
            Delicious Food,{'\n'}
            <Text style={styles.headlineAccent}>Delivered Fast 🚀</Text>
          </Text>
          <Text style={styles.subText}>
            Order your favourite meals from the best restaurants near you, right at your fingertips.
          </Text>
        </Animated.View>

        {/* Bottom card with button */}
        <Animated.View
          style={[
            styles.bottomCard,
            { opacity: fadeAnim, transform: [{ translateY: buttonSlide }] },
          ]}
        >
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => navigation.navigate('SignUp')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#FFD54F', '#FFC107']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 0.5,
    backgroundColor: 'white',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: 'white',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  tagContainer: {
    marginTop: 10,
  },
  tag: {
    backgroundColor: 'rgba(255, 193, 7, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.45)',
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 7,
  },
  tagText: {
    color: '#FFC107',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  burgerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10,
  },
  burgerGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255, 193, 7, 0.18)',
  },
  burgerImage: {
    width: width * 0.82,
    height: width * 0.82,
  },
  textContainer: {
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: -10,
  },
  headline: {
    fontSize: 34,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 14,
  },
  headlineAccent: {
    color: '#FFC107',
  },
  subText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 23,
    paddingHorizontal: 10,
  },
  bottomCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 24,
  },
  getStartedButton: {
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonGradient: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
  },
  footerLink: {
    color: '#FFC107',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
