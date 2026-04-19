import {
    View, Text, ActivityIndicator, TouchableOpacity, Image, TextInput,
    ScrollView, Alert,
} from 'react-native';
import React, { useState } from 'react';
import { themeColors } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../constants/firebase';
import Toast from 'react-native-root-toast';

export default function SignUpScreen() {
    const navigation = useNavigation();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setphoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async () => {
        if (fullName && email && phoneNumber && password) {
            if (!validateEmail(email)) {
                Alert.alert('Invalid Email', 'Please enter a valid email address');
                return;
            }

            try {
                setIsLoading(true);
                setError('');

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
                    await addDoc(collection(db, 'users'), {
                        uid: user.uid,
                        fullName: fullName,
                        email: email,
                        phoneNumber: phoneNumber,
                        home_address: '',
                    });
                    setIsLoading(false);
                    navigation.navigate('Home');
                } else {
                    setError('User not found after signup.');
                    console.log('User not found after signup.');
                }
            } catch (error) {
                setIsLoading(false);
                setError(error.message);
                console.error('Error caught:', error);
            }
        } else {
            Alert.alert('Incomplete Form', 'Please fill in all fields');
        }
    };

    return (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View className="flex-1 bg-white" style={{ backgroundColor: themeColors.bg }}>
                <SafeAreaView className="flex">
                    <View className="flex-row justify-start">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="bg-yellow-400 p-2 rounded-tr-2xl rounded-bl-2xl ml-4 shadow-lg"
                        >
                            <ArrowLeftIcon size="20" color="black" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-center">
                        <Image source={require('../assets/images/signup.png')} style={{ width: 165, height: 110 }} />
                    </View>

                    <View className="flex-row justify-center mb-4">
                        <Text className="text-white font-bold text-2xl">Create Account</Text>
                    </View>
                </SafeAreaView>

                <View
                    className="flex-1 bg-white px-8 pt-8"
                    style={{
                        borderTopLeftRadius: 50,
                        borderTopRightRadius: 50,
                    }}
                >
                    <View className="form space-y-2">
                        <TextInput
                            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3 border border-gray-300"
                            placeholder="Enter Your Fullname"
                            value={fullName}
                            onChangeText={(value) => setFullName(value)}
                        />

                        <TextInput
                            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3 border border-gray-300"
                            value={email}
                            onChangeText={(value) => setEmail(value)}
                            placeholder="Enter Your Email"
                        />

                        <TextInput
                            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3 border border-gray-300"
                            value={phoneNumber}
                            onChangeText={(value) => setphoneNumber(value)}
                            placeholder="Enter Your Phone number"
                        />

                        <TextInput
                            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-7 border border-gray-300"
                            secureTextEntry
                            value={password}
                            onChangeText={(value) => setPassword(value)}
                            placeholder="Enter Your Password"
                        />

                        <TouchableOpacity className="py-3 bg-yellow-400 rounded-xl shadow-lg" onPress={handleSubmit}>
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={{ textAlign: 'center', color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                                    Sign Up
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={{ paddingBottom: 20 }} className="flex-row justify-center mt-7">
                        <Text className="text-gray-500 font-semibold">Already have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text className="font-semibold text-yellow-500"> Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}
