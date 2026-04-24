import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, 
  TextInput, Alert, StatusBar, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  collection, updateDoc, doc, where, query, getDocs,
} from 'firebase/firestore';
import { db, auth } from '../constants/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import Toast from 'react-native-root-toast';

/* ─────────────────────────────────────────────
   Row Components
───────────────────────────────────────────── */

/** Editable row — label on left, text input on right */
const EditRow = ({ label, value, onChangeText, placeholder, keyboardType }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <TextInput
      style={styles.rowValueInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || ''}
      placeholderTextColor="#C0C0C0"
      keyboardType={keyboardType || 'default'}
    />
  </View>
);

/** Read-only row — label on left, bold value on right */
const InfoRow = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

/** Action row — label on left, green chevron on right */
const ActionRow = ({ label, onPress }) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.greenChevron}>{'>'}</Text>
  </TouchableOpacity>
);

/* ─────────────────────────────────────────────
   Main Screen
───────────────────────────────────────────── */
const EditProfileScreen = () => {
  const navigation = useNavigation();

  const [fullName, setFullName]       = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [email, setEmail]             = useState('');
  const [isFetching, setIsFetching]   = useState(true);
  const [isSaving, setIsSaving]       = useState(false);

  // Address Modal States
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [tempAddress, setTempAddress] = useState('');

  /* ── Fetch ── */
  useEffect(() => {
    (async () => {
      try {
        const q = query(
          collection(db, 'users'),
          where('uid', '==', auth.currentUser.uid)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const d = snap.docs[0].data();
          setFullName(d.fullName || '');
          setPhoneNumber(d.phoneNumber || '');
          setHomeAddress(d.home_address || '');
          setEmail(auth.currentUser?.email || d.email || '');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsFetching(false);
      }
    })();
  }, []);

  /* ── Save ── */
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const q = query(
        collection(db, 'users'),
        where('uid', '==', auth.currentUser.uid)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docId = snap.docs[0].id;
        await updateDoc(doc(db, 'users', docId), {
          fullName,
          phoneNumber,
          home_address: homeAddress,
        });
        Toast.show('Profile updated', { duration: Toast.durations.SHORT });
        navigation.goBack();
      }
    } catch (e) {
      console.error(e);
      Toast.show('Failed to update profile', { duration: Toast.durations.SHORT });
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Update Password ── */
  const handleUpdatePassword = () => {
    Alert.alert(
      'Update Password',
      'A password-reset link will be sent to your registered email address.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Link', 
          onPress: async () => {
            try {
              await sendPasswordResetEmail(auth, email);
              Toast.show('Password reset email sent!', { duration: Toast.durations.LONG });
            } catch (error) {
              console.error(error);
              Alert.alert('Error', error.message);
            }
          } 
        },
      ]
    );
  };

  if (isFetching) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Details</Text>
        {/* Save button top-right */}
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={isSaving}>
          {isSaving
            ? <ActivityIndicator size="small" color="#001F33" />
            : <Text style={styles.saveBtnText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ════════ PROFILE ════════ */}
        <Text style={styles.sectionHeader}>Profile</Text>
        <View style={styles.card}>
          <EditRow
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="+234..."
            keyboardType="phone-pad"
          />
          <View style={styles.separator} />
          <EditRow
            label="Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Full name"
          />
          <View style={styles.separator} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email Address</Text>
            <View style={styles.rowRightGroup}>
              <Text style={styles.rowValue} numberOfLines={1}>{email}</Text>
            </View>
          </View>
          <View style={styles.separator} />
          <ActionRow label="Update Password" onPress={handleUpdatePassword} />
        </View>

        {/* ════════ ADDRESS ════════ */}
        <Text style={styles.sectionHeader}>Address</Text>
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.row} 
            onPress={() => {
              setTempAddress(homeAddress);
              setIsAddressModalVisible(true);
            }}
          >
            <Text style={styles.rowLabel}>Home Address</Text>
            <Text style={styles.rowValue} numberOfLines={2}>
              {homeAddress || 'Enter delivery address'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ════════ ADDRESS MODAL ════════ */}
        <Modal
          visible={isAddressModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsAddressModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Update Address</Text>
                <TouchableOpacity onPress={() => setIsAddressModalVisible(false)}>
                  <Text style={styles.closeModalText}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.modalInput}
                value={tempAddress}
                onChangeText={setTempAddress}
                placeholder="Type your full address here..."
                multiline={true}
                numberOfLines={4}
                autoFocus={true}
              />

              <TouchableOpacity 
                style={styles.modalUpdateButton}
                onPress={() => {
                  setHomeAddress(tempAddress);
                  setIsAddressModalVisible(false);
                }}
              >
                <Text style={styles.modalUpdateButtonText}>Confirm Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
};

/* ─────────────────────────────────────────────
   Styles
───────────────────────────────────────────── */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 36,
  },
  backArrow: {
    fontSize: 22,
    color: '#1A1A1A',
    fontWeight: '400',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  saveBtn: {
    width: 44,
    alignItems: 'flex-end',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#001F33',
  },
  /* Scroll */
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 50,
  },

  /* Section header */
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 10,
  },

  /* Card */
  card: {
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#E5E7EB',
  },

  /* Row */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 54,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6B7280',
    flex: 0,
    minWidth: 120,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'right',
    flexShrink: 1,
  },
  rowRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'flex-end',
  },
  rowValueInput: {
    flex: 1,
    textAlign: 'right',
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    padding: 0,
  },
  greenChevron: {
    fontSize: 18,
    fontWeight: '700',
    color: '',
    marginLeft: 4,
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  closeModalText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#1A1A1A',
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalUpdateButton: {
    backgroundColor: '#001F33',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalUpdateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default EditProfileScreen;