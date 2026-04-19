import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  ScrollView,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  collection, 
  updateDoc,
  doc, 
  where,
  query,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { db, auth } from '../constants/firebase';
import Toast from 'react-native-root-toast';
import { 
  AntDesign, 
} from '@expo/vector-icons';

const EditProfileScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [home_address, sethome_address] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
  
        // Use where query to find the document with the matching uid
        const userQuery = query(collection(db, 'users'), where('uid', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(userQuery);
  
        if (querySnapshot.empty) {
          // Handle the case where no matching document is found
          setIsLoading(false);
          console.error('User document not found.');
          return;
        }
  
        // Assuming there is only one document for each user, use docs[0]
        const userDoc = querySnapshot.docs[0].data();
  
        // Set the state with the user data
        setFullName(userDoc.fullName);
        setPhoneNumber(userDoc.phoneNumber || '');
        sethome_address(userDoc.home_address || '');
  
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);
  
  const updateProfile = async () => {
    try {
      setIsLoading(true);

      // Get the document ID based on the user's UID
      const userQuery = query(collection(db, 'users'), where('uid', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userDocId = userDoc.id;

        // Update the document with the new values
        await updateDoc(doc(db, 'users', userDocId), {
          fullName: fullName,
          phoneNumber: phoneNumber,
          home_address: home_address,
        });

        console.log('Profile updated');
        Toast.show('Profile updated', { duration: Toast.durations.SHORT });
        setIsLoading(false);
        navigation.navigate('Home');

      } else {
        console.error('User document not found.');
        Toast.show('User document not found', { duration: Toast.durations.SHORT });
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error updating profile:', error);
      Toast.show('Failed to update profile', { duration: Toast.durations.SHORT });
    }
  };
  
  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <View className="flex-1 bg-white" style={{backgroundColor: 'black'}}>
        <SafeAreaView className="flex">
          <View className="flex-row justify-start">
            <TouchableOpacity 
              onPress={()=> navigation.goBack()}                 
            >
              <AntDesign name="back" size={40} stroke={50} color="white" />          
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center">                        
            <Image
              source={require('../assets/images/avatar.png')}
              style={{width: 100, height: 100, borderRadius: 70, }}
            />
          </View>
        </SafeAreaView>

        <View 
          className="flex-1 bg-white px-8 pt-8"
          style={{borderTopLeftRadius: 50, marginTop: 10, borderTopRightRadius: 50}}
        >
          <View className="form space-y-2" >
                              
            <TextInput
              className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
              placeholder='Enter Your Fullname'
              value={fullName}
              onChangeText={value => setFullName(value)}
            />
      
            <TextInput
              className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
              value={phoneNumber}
              onChangeText={value=> setPhoneNumber(value)}
              placeholder='Enter Your Phone Number'
            />

            <TextInput
              className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
              value={home_address}
              onChangeText={value=> sethome_address(value)}
              placeholder='Enter Your Delivery Home address'
            />

            <TouchableOpacity
              className="py-3 rounded-xl"
              style={{ backgroundColor: '#0B0BFF' }}
              onPress={updateProfile}
            >
              {isLoading ? (
                <ActivityIndicator color="yellow" />
              ) : (
                <Text 
                  style={{ 
                    textAlign: 'center',
                    color: 'yellow', 
                    fontSize: 15, 
                    fontWeight: 'bold'
                  }}
                > 
                  Update
                </Text>
              )}
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  goBack: {
    marginLeft: 10,
    marginBottom: 10,
    bordercolor: 'grey',
    borderWidth: 1.5,
  },
});

export default EditProfileScreen;