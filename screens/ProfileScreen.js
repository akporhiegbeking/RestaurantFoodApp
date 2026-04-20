import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  ActivityIndicator, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../constants/firebase';
import { getDocs, query, collection, where } from 'firebase/firestore';
import { 
  Bars3Icon, ChevronLeftIcon, UserCircleIcon, ShoppingBagIcon,
  ArrowLeftOnRectangleIcon, ChevronRightIcon, HeartIcon
} from 'react-native-heroicons/outline';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);

  const getUserData = async () => {
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
      if (!user) {
        console.error('User data is null');
        return;
      }
      setUserData({ ...user });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, [auth.currentUser]);

  const handleLogout = async () => {
    await signOut(auth);
    await AsyncStorage.clear();
    navigation.replace('LoginScreen');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#FFD700', '#F59E0B', '#FFFFFF', '#001F33']}
        locations={[0, 0.1, 0.3, 0.7]}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />
      
      <SafeAreaView style={{ flex: 1 }}>
        {/* Top Header / Back Button */}
        <Animatable.View 
          animation="fadeInLeft"
          duration={600}
          style={{ paddingHorizontal: 20, paddingTop: 10 }}
        >
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={{ 
              backgroundColor: 'white', 
              padding: 10, 
              borderRadius: 20, 
              width: 50,
              elevation: 5,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 10
            }}
          >
            <ChevronLeftIcon size={24} color="black" />
          </TouchableOpacity>
        </Animatable.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Profile Section */}
          <Animatable.View 
            animation="fadeInDown" 
            duration={800}
            style={{ alignItems: 'center', marginTop: 20 }}
          >
            <View style={{ 
              backgroundColor: 'white', 
              padding: 4, 
              borderRadius: 60,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 10
            }}>
              <Image 
                source={userData.imageUrl ? { uri: userData.imageUrl } : require('../assets/images/avatar.png')} 
                style={{ height: 110, width: 110, borderRadius: 55 }}
              />
            </View>
            <View style={{ alignItems: 'center', marginTop: 15 }}>
              <Animatable.Text 
                animation="fadeIn" 
                delay={400}
                style={{ fontSize: 28, fontWeight: 'bold', color: '#1A1A1A' }}
              >
                {userData.fullName || 'Guest User'}
              </Animatable.Text>
              <Animatable.Text 
                animation="fadeIn" 
                delay={500}
                style={{ fontSize: 16, color: '#666', marginTop: 4 }}
              >
                {userData.email || 'guest@example.com'}
              </Animatable.Text>
            </View>
          </Animatable.View>

          {/* Quick Actions / Stats row can be added here if needed */}

          {/* Menu Options Group */}
          <Animatable.View 
            animation="fadeInUp" 
            delay={300}
            style={{ 
              marginHorizontal: 20, 
              marginTop: 40, 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              borderRadius: 30,
              padding: 10,
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 20,
              elevation: 5
            }}
          >
            {[
              { name: 'Orders', icon: <ShoppingBagIcon size={24} color="#F59E0B" />, screen: 'OrdersList' },
              { name: 'Saved Items', icon: <HeartIcon size={24} color="#F59E0B" />, screen: 'SavedItems' },
              { name: 'Edit Profile', icon: <UserCircleIcon size={24} color="#F59E0B" />, screen: 'EditProfile' }
            ].map((item, index, array) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: 20,
                  borderBottomWidth: index === array.length - 1 ? 0 : 1,
                  borderBottomColor: '#F3F4F6'
                }}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ 
                    backgroundColor: '#FFFBEB', 
                    padding: 8, 
                    borderRadius: 12, 
                    marginRight: 15 
                  }}>
                    {item.icon}
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}>
                    {item.name}
                  </Text>
                </View>
                <ChevronRightIcon size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </Animatable.View>

          {/* Support Section could be added here */}

          {/* Logout Section */}
          <Animatable.View 
            animation="fadeInUp" 
            delay={500}
            style={{ marginHorizontal: 20, marginTop: 40 }}
          >
            <TouchableOpacity 
              onPress={handleLogout}
              activeOpacity={0.8}
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#EF4444', 
                paddingVertical: 18, 
                borderRadius: 25,
                shadowColor: '#EF4444',
                shadowOpacity: 0.3,
                shadowRadius: 15,
                elevation: 10
              }}
            >
              <ArrowLeftOnRectangleIcon size={22} color="white" />
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 }}>
                Logout
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
});

export default ProfileScreen;
