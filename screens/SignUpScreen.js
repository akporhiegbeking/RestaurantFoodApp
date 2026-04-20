import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, Image, TextInput, 
  StyleSheet, Dimensions, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  UserIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, 
  ChevronLeftIcon 
} from 'react-native-heroicons/outline';
import { FontAwesome } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../constants/firebase';
import Toast from 'react-native-root-toast';
import * as Device from 'expo-device';

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

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const validateEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
  };

  const handleSubmit = async () => {
    if (fullName && email && password) {
      if (!validateEmail(email)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address');
        return;
      }
      if (!agreeToTerms) {
        Alert.alert('Agreement Required', 'Please agree to the Terms and Conditions');
        return;
      }

      try {
        setIsLoading(true);
        
        // Check if email already exists
        const emailQuery = query(collection(db, 'users'), where('email', '==', email));
        const emailQuerySnapshot = await getDocs(emailQuery);

        if (!emailQuerySnapshot.empty) {
            setIsLoading(false);
            Toast.show('Email already exists', { duration: Toast.durations.SHORT });
            return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (user) {
            // Get user count for image rotation
            const userQuery = query(collection(db, 'users'));
            const snapshot = await getDocs(userQuery);
            const userCount = snapshot.size;

            const bskyUrl = "https://cdn.bsky.app/img/avatar/plain/did:plc:tn7tnmk654ejtpeoamr5orz6/bafkreiauu7kymx2sxctfzmfy53ge3wu5mfk56amnz7mensw5ypf7c2btba";
            const dicebearUrl = `https://api.dicebear.com/6.x/pixel-art/png?seed=${encodeURIComponent(fullName)}`;
            const imageUrl = userCount % 2 === 0 ? bskyUrl : dicebearUrl;

            // Get Location via ipinfo (fallback suggested)
            let locationStr = 'Unknown Location';
            try {
                const locResponse = await fetch('https://ipinfo.io?token=90883ca1824185');
                const locData = await locResponse.json();
                if (locData.city) {
                    locationStr = `${locData.city}, ${locData.region || ''}, ${locData.country || ''}`;
                }
            } catch (e) {
                console.warn('Location fetch failed:', e);
            }

            // Get Device Info
            const deviceInfo = {
                brand: Device.brand,
                modelName: Device.modelName,
                osName: Device.osName,
                osVersion: Device.osVersion,
                deviceName: Device.deviceName,
            };

            await addDoc(collection(db, 'users'), {
                uid: user.uid,
                fullName: fullName,
                email: email,
                imageUrl: imageUrl,
                phoneNumber: '', 
                home_address: locationStr, // Populated from API
                deviceInfo: deviceInfo, // New field
                createdAt: new Date().toISOString()
            });
            setIsLoading(false);
            navigation.navigate('Home');
        }
      } catch (err) {
        setIsLoading(false);
        Alert.alert('Error', err.message);
      }
    } else {
      Alert.alert('Incomplete Form', 'Please fill in all fields');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8B6F00', '#000000']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <GridBackground />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} showsVerticalScrollIndicator={false}>
            {/* Header section */}
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <ChevronLeftIcon size={24} color="white" />
              </TouchableOpacity>
              
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../assets/images/signup.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.title}>Create Account</Text>             
            </View>

            {/* Form section */}
            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <UserIcon size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="David Johnson"
                    placeholderTextColor="#999"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <EnvelopeIcon size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="davidjonson@gmail.com"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Enter Password</Text>
                <View style={styles.inputContainer}>
                  <LockClosedIcon size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="xxxxxxxxxx"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeIcon size={20} color="#666" />
                    ) : (
                      <EyeSlashIcon size={20} color="#666" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.row}>
                <TouchableOpacity 
                    style={styles.checkboxRow}
                    onPress={() => setAgreeToTerms(!agreeToTerms)}
                >
                  <View style={[styles.checkbox, agreeToTerms && styles.checkboxActive]} />
                  <Text style={styles.checkboxText}>
                    I agree to the <Text style={styles.linkText}>Terms & Conditions</Text> and <Text style={styles.linkText}>Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="black" />
                ) : (
                  <Text style={styles.submitButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.footerLink}>Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    borderRadius: 12,
  },
  logoContainer: {
    marginTop: 5,
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 40,
  },
  inputWrapper: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 55,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 5,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 20,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: '#FFC107',
    borderColor: '#FFC107',
  },
  checkboxText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  linkText: {
    fontWeight: 'bold',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#FFC107',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  footerLink: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

