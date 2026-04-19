import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

const OrderSuccessScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>

      <LottieView
        source={require('../assets/animation/Animation - 1719050518304.json')}
        autoPlay
        loop={false}
        style={styles.lottieAnimation}
      />

      <Text 
        style={styles.successText}
      >
        Order placed successfully!
      </Text>
      
      <TouchableOpacity 
        onPress={() => navigation.navigate('Home')} 
        style={styles.homeButton}
      >
        <Text style={styles.homeButtonText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  homeButton: {
    backgroundColor: '#ff6347',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OrderSuccessScreen;
