import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Image, StatusBar, ImageBackground, Linking, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../constants/firebase';
import { getDocs, query, collection, where } from 'firebase/firestore';
import {
  ChevronRightIcon, HeartIcon, ShoppingBagIcon,
  UserIcon, ShoppingCartIcon, Cog6ToothIcon,
  ShieldCheckIcon, EyeIcon, ArrowLeftOnRectangleIcon,
  ChevronLeftIcon
} from 'react-native-heroicons/outline';
import {
  ShoppingCartIcon as ShoppingCartIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid
} from 'react-native-heroicons/solid';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const [showBalance, setShowBalance] = useState(true);

  const fetchTotalTransactions = async () => {
    if (!auth.currentUser) return;
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('user.uid', '==', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(ordersQuery);
      let total = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Since we are summing up total price, ensure it's a number
        const price = parseFloat(data.totalPrice) || 0;
        total += price;
      });
      setTotalSpent(total);
    } catch (error) {
      console.error('Error fetching total transactions:', error);
    }
  };

  const getUserData = async () => {
    if (!auth.currentUser) return;
    const userQuery = query(
      collection(db, 'users'),
      where('uid', '==', auth.currentUser.uid)
    );
    try {
      const userSnapshot = await getDocs(userQuery);
      if (userSnapshot.size === 0) {
        console.error('User not found');
        return;
      }
      const userDoc = userSnapshot.docs[0];
      const user = userDoc.data();
      setUserData({ ...user });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
    fetchTotalTransactions();
  }, [auth.currentUser]);

  const handleHelpCenter = () => {
    const supportEmail = 'plutoidtechnologieslimited@gmail.com';
    const subject = encodeURIComponent('Help Center - I need help');
    const userEmail = auth.currentUser?.email || userData.email || '';
    const body = encodeURIComponent(`From: ${userEmail}\n\nDescribe your issue below:\n`);
    const mailtoUrl = `mailto:${supportEmail}?subject=${subject}&body=${body}`;

    Linking.canOpenURL(mailtoUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(mailtoUrl);
        } else {
          Alert.alert('No Mail App Found', 'Please send an email to plutoidtechnologieslimited@gmail.com');
        }
      })
      .catch(() => {
        Alert.alert('Error', 'Unable to open mail app. Please try again.');
      });
  };

  const handleLogout = async () => {
    await signOut(auth);
    await AsyncStorage.clear();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/images/background.png')}
      style={styles.container}
      blurRadius={20}
    >
      {/* Top Background Gradient */}
      <View style={styles.headerBackground}>
        <LinearGradient
          colors={['rgba(255, 251, 235, 0.7)', 'rgba(255, 255, 255, 0.5)']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ChevronLeftIcon size={28} color="#1A1A1A" />
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <Image
                  source={userData.imageUrl ? { uri: userData.imageUrl } : require('../assets/images/avatar.png')}
                  style={styles.avatar}
                />
                <View style={styles.statusDot} />
              </View>
              <View style={styles.nameContainer}>
                <Text style={styles.greetingText}>Hi, {userData.fullName?.split(' ')[0] || 'Guest'}</Text>               
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile', { userData })}
            style={styles.settingsButton}
          >
            <Cog6ToothIcon size={28} color="#1A1A1A" />            
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Balance Card */}
          <Animatable.View animation="fadeInUp" duration={600} style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Total Orders Transactions</Text>
              <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
                <EyeIcon size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceAmount}>
              {showBalance ? `₦${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₦ • • • • •'}
            </Text>
          </Animatable.View>

          {/* Menu Sections */}
          <Animatable.View animation="fadeInUp" delay={200} duration={600} style={styles.menuCard}>
            <MenuItem
              label="Edit My Profile"
              icon={<UserIcon size={22} color="#F59E0B" />}
              onPress={() => navigation.navigate('EditProfile', { userData })}
            />
            <MenuItem
              label="My Orders"
              icon={<ShoppingBagIcon size={22} color="#F59E0B" />}
              onPress={() => navigation.navigate('OrdersList')}
            />
            <MenuItem
              label="My Saved Items"
              icon={<HeartIcon size={22} color="#F59E0B" />}
              onPress={() => navigation.navigate('SavedItems')}
            />
            <MenuItem
              label="My Cart"
              icon={<ShoppingCartIcon size={22} color="#F59E0B" />}
              onPress={() => navigation.navigate('Cart')}
              isLast
            />
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={300} duration={600} style={[styles.menuCard, { marginTop: 20 }]}>
            <MenuItem
              label="Help Center"
              icon={<ShieldCheckIcon size={22} color="#F59E0B" />}
              onPress={handleHelpCenter}
            />
            <MenuItem
              label="Logout"
              icon={<ArrowLeftOnRectangleIcon size={22} color="#EF4444" />}
              onPress={handleLogout}
              isLast
              textColor="#EF4444"
            />
          </Animatable.View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const MenuItem = ({ label, icon, onPress, isLast, textColor = '#1F2937' }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    style={[styles.menuItem, isLast && { borderBottomWidth: 0 }]}
    onPress={onPress}
  >
    <View style={styles.menuItemLeft}>
      <View style={styles.menuIconWrapper}>
        {icon}
      </View>
      <Text style={[styles.menuItemText, { color: textColor }]}>{label}</Text>
    </View>
    <ChevronRightIcon size={18} color="#9CA3AF" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    height: 55,
    width: 55,
    borderRadius: 27.5,
    borderWidth: 2,
    borderColor: 'white',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: 'white',
  },
  nameContainer: {
    marginLeft: 12,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  settingsButton: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  balanceCard: {
    marginTop: 10,
    marginBottom: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  balanceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#001F33',
    letterSpacing: -1,
  },
  promotionBanner: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  menuCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconWrapper: {
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 12,
    marginRight: 15,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfileScreen;