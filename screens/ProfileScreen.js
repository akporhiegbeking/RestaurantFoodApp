import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../constants/firebase';
import { MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import { getDocs, query, collection, where } from 'firebase/firestore';
import { ChevronLeftIcon } from 'react-native-heroicons/solid';

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
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const handleMenuPress = (itemName) => {
    const trimmedItemName = itemName.trim();
    console.log(`Menu item clicked: ${trimmedItemName}`);
    if (trimmedItemName === 'Orders') {
      console.log('Navigating to OrdersListScreen');
      navigation.navigate('OrdersList');
    } else if (trimmedItemName === 'Edit Profile') {
      console.log('Navigating to EditProfile');
      navigation.navigate('EditProfile');
    } else if (trimmedItemName === 'Saved Items') {
      console.log('Navigating to SavedItems');
      navigation.navigate('SavedItems');
    } else {
      console.log('Item name does not match any navigation case');
    }
  };

  // const handleMenuPress = (itemName) => {
  //   const trimmedItemName = itemName.trim();
  //   console.log(`Menu item clicked: ${trimmedItemName}`);
  //   if (trimmedItemName === 'Edit Profile') {
  //     console.log('Navigating to EditProfile');
  //     console.log('Navigation object:', navigation);
  //     navigation.navigate('EditProfile');
  //   }  else {
  //     console.log('Item name does not match');
  //   }
  // };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-white rounded-2xl p-3 shadow">
          <ChevronLeftIcon size="23" stroke={50} color="black" />
        </TouchableOpacity>

        <Image
          className="h-12 w-12 rounded-2xl"
          source={require('../assets/images/avatar.png')}
          style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
        />
        <Text style={styles.welcomeText}>Welcome, {userData.fullName || ''}</Text>
        <Text style={styles.emailText}>{userData.email || ''}</Text>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item.name)}
          >
            {item.icon}
            <Text style={styles.menuItemText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const menuItems = [
  { name: 'Orders', icon: <MaterialIcons name="list-alt" size={24} color="black" /> },
  { name: 'Saved Items', icon: <Ionicons name="heart-outline" size={24} color="black" /> },
  { name: 'Edit Profile', icon: <AntDesign name="user" size={24} color="black" /> },
];

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 50,
  },
  header: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emailText: {
    fontSize: 16,
    color: 'gray',
  },
  menu: {
    borderTopWidth: 1,
    borderColor: '#f0f0f0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'red',
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;
