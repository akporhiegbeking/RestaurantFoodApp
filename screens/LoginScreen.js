// import { View, ActivityIndicator, Text, TouchableOpacity, Image, TextInput } from 'react-native'
// import React, { useState } from 'react'
// import { SafeAreaView } from 'react-native-safe-area-context'
// import {ArrowLeftIcon} from 'react-native-heroicons/solid'
// import { themeColors } from '../theme'
// import { useNavigation } from '@react-navigation/native'
// import { signInWithEmailAndPassword } from 'firebase/auth'
// import { auth } from '../constants/firebase'
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function LoginScreen() {
//   const navigation = useNavigation();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async ()=>{
//     if(email && password){
//       try {
//         setIsLoading(true);
//         setError('');
//         await signInWithEmailAndPassword(auth, email, password);
//         await AsyncStorage.setItem('isLoggedIn', 'true'); // Store login state
//         setTimeout(() => {
//           setIsLoading(false);
//           navigation.navigate('Home');  
//         }, 1000);

//       } catch (err) {
//         setIsLoading(false);
//         setError(err.message);
//         console.log('got an error', err.message);
//         alert('Invalid Login credentials');
//       }
//     }
//   }
  
//   return (
//     <View className="flex-1 bg-white" style={{backgroundColor: themeColors.bg}}>
//       <SafeAreaView  className="flex ">
//         <View className="flex-row justify-start">
//           <TouchableOpacity onPress={()=> navigation.goBack()} 
//           className="bg-yellow-400 p-2 rounded-tr-2xl rounded-bl-2xl ml-4">
//             <ArrowLeftIcon size="20" color="black" />
//           </TouchableOpacity>
//         </View>

//         <View className="flex-row justify-center">
//           <Image source={require('../assets/images/welcome.png')} style={{width: 165, height: 110}} />
//         </View>         
//       </SafeAreaView>

//       <View 
//         style={{borderTopLeftRadius: 50, borderTopRightRadius: 50}} 
//         className="flex-1 bg-white px-8 pt-8"
//       >
//         <View className="form space-y-2">
//           {/* Email input */}
//           <TextInput 
//             className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
//             placeholder="Enter your email address"
//             value={email}
//             onChangeText={value=> setEmail(value)}
//             autoCapitalize='none'
//             autoCorrect={false}
//           />

//           {/* Password input */}
//           <TextInput 
//             className="p-4 bg-gray-100 text-gray-700 rounded-2xl"
//             secureTextEntry
//             placeholder="Enter your password"
//             value={password}
//             onChangeText={value=> setPassword(value)}
//             autoCapitalize='none'
//             autoCorrect={false}
//           />

//           <TouchableOpacity className="flex items-end" onPress={()=> navigation.navigate('ForgotPassword')}>
//             <Text className="text-gray-700 mb-5">Forgot Password?</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             className="py-3 bg-yellow-400 rounded-xl"
//             onPress={handleSubmit}
//           >
//             {isLoading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={{ textAlign: 'center', color: 'white', fontSize: 20, fontWeight: 'bold' }}> Login </Text>
//             )}
//           </TouchableOpacity>

//         </View>

//         <View className="flex-row justify-center mt-7">
//           <Text className="text-gray-500 font-semibold">
//             Don't have an account?
//           </Text>

//           <TouchableOpacity onPress={()=> navigation.navigate('SignUp')}>
//             <Text className="font-semibold text-yellow-500"> Sign Up</Text>
//           </TouchableOpacity>
//         </View>
          
//       </View>
//     </View>
    
//   )
// }



import { 
  View, ActivityIndicator, Text, TouchableOpacity, Image, TextInput 
} from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeftIcon } from 'react-native-heroicons/solid'
import { themeColors } from '../theme'
import { useNavigation } from '@react-navigation/native'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../constants/firebase'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const checkUserLoginState = async () => {
    try {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      console.log('User login state:', isLoggedIn);
      navigation.navigate(isLoggedIn === 'true' ? 'Home' : 'Login');
    } catch (error) {
      console.error("Error checking login state: ", error);
    }
  };

  const handleSubmit = async () => {
    if (email && password) {
      try {
        setIsLoading(true);
        setError('');
        await signInWithEmailAndPassword(auth, email, password);
        await AsyncStorage.setItem('isLoggedIn', 'true'); // Store login state
        setTimeout(() => {
          setIsLoading(false);
          checkUserLoginState(); // Check user login state before navigating
        }, 1000);

      } catch (err) {
        setIsLoading(false);
        setError(err.message);
        console.log('got an error', err.message);
        alert('Invalid Login credentials');
      }
    }
  }

  return (
    <View className="flex-1 bg-white" style={{ backgroundColor: themeColors.bg }}>
      <SafeAreaView className="flex ">
        <View className="flex-row justify-start">
          <TouchableOpacity onPress={() => navigation.goBack()}
            className="bg-yellow-400 p-2 rounded-tr-2xl rounded-bl-2xl ml-4 shadow-lg">
            <ArrowLeftIcon size="20" color="black" />
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center">
          <Image source={require('../assets/images/welcome.png')} style={{ width: 165, height: 110 }} />
        </View>

        <View className="flex-row justify-center mb-4">
          <Text className="text-white font-bold text-2xl">Welcome Back</Text>
        </View>
      </SafeAreaView>

      <View
        style={{ borderTopLeftRadius: 50, borderTopRightRadius: 50 }}
        className="flex-1 bg-white px-8 pt-8"
      >
        <View className="form space-y-2">
          {/* Email input */}
          <TextInput
            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3 border border-gray-300"
            placeholder="Enter your email address"
            value={email}
            onChangeText={value => setEmail(value)}
            autoCapitalize='none'
            autoCorrect={false}
          />

          {/* Password input */}
          <TextInput
            className="p-4 bg-gray-100 text-gray-700 rounded-2xl border border-gray-300"
            secureTextEntry
            placeholder="Enter your password"
            value={password}
            onChangeText={value => setPassword(value)}
            autoCapitalize='none'
            autoCorrect={false}
          />

          <TouchableOpacity className="flex items-end" onPress={() => navigation.navigate('ForgotPassword')}>
            <Text className="text-gray-700 mb-5">Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-3 bg-yellow-400 rounded-xl shadow-lg"
            onPress={handleSubmit}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ textAlign: 'center', color: 'white', fontSize: 20, fontWeight: 'bold' }}> Login </Text>
            )}
          </TouchableOpacity>

        </View>

        <View className="flex-row justify-center mt-7">
          <Text className="text-gray-500 font-semibold">
            Don't have an account?
          </Text>

          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text className="font-semibold text-yellow-500"> Sign Up</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>

  )
}
