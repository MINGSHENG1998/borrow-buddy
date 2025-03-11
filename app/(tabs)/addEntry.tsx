import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { db } from "../../firebaseConfig";
import { collection, addDoc } from 'firebase/firestore';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';

// Dark theme colors (consistent with TabLayout)
const Colors = {
  background: '#1A1A1A',
  tint: '#00D1B2',
  tabIconDefault: '#8E8E93',
  text: '#FFFFFF',
  card: '#2C2C2E',
} as const;

export default function AddEntryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  // Form state
  const [type, setType] = useState<'money' | 'item'>('money');
  const [amount, setAmount] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [friendName, setFriendName] = useState<string>('');
  const [direction, setDirection] = useState<'borrowed' | 'lent'>('borrowed');
  const [notes, setNotes] = useState<string>('');

  // Submit handler
  const handleSubmit = async () => {
    if (!friendName || (type === 'money' && !amount) || (type === 'item' && !itemName)) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      const transactionData = {
        userId: user?.uid,
        type,
        amount: type === 'money' ? parseFloat(amount) : null,
        itemName: type === 'item' ? itemName : null,
        friendName,
        direction,
        date: new Date().toISOString(),
        status: 'pending',
        notes: notes || null,
      };

      await addDoc(collection(db, 'transactions'), transactionData);
      Alert.alert('Success', 'Transaction saved!');
      router.back(); // Navigate back to previous screen (e.g., Dashboard)
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('Error', 'Failed to save transaction.');
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Add New Entry
      </ThemedText>

      {/* Type Picker */}
      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>Type</ThemedText>
        <Picker
          selectedValue={type}
          onValueChange={(value: 'money' | 'item') => setType(value)}
          style={styles.picker}
          dropdownIconColor={Colors.text}
        >
          <Picker.Item label="Money" value="money" />
          <Picker.Item label="Item" value="item" />
        </Picker>
      </View>

      {/* Amount or Item Name */}
      {type === 'money' ? (
        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Amount ($)</ThemedText>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="e.g., 20.00"
            placeholderTextColor={Colors.tabIconDefault}
          />
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Item Name</ThemedText>
          <TextInput
            style={styles.input}
            value={itemName}
            onChangeText={setItemName}
            placeholder="e.g., Book"
            placeholderTextColor={Colors.tabIconDefault}
          />
        </View>
      )}

      {/* Friend's Name */}
      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>Friend's Name</ThemedText>
        <TextInput
          style={styles.input}
          value={friendName}
          onChangeText={setFriendName}
          placeholder="e.g., Alice"
          placeholderTextColor={Colors.tabIconDefault}
        />
      </View>

      {/* Direction Toggle */}
      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>Direction</ThemedText>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              direction === 'borrowed' && styles.toggleButtonActive,
            ]}
            onPress={() => setDirection('borrowed')}
          >
            <Text
              style={[
                styles.toggleText,
                direction === 'borrowed' && styles.toggleTextActive,
              ]}
            >
              I Borrowed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              direction === 'lent' && styles.toggleButtonActive,
            ]}
            onPress={() => setDirection('lent')}
          >
            <Text
              style={[
                styles.toggleText,
                direction === 'lent' && styles.toggleTextActive,
              ]}
            >
              I Lent
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notes */}
      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>Notes (Optional)</ThemedText>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g., Pay back by next week"
          placeholderTextColor={Colors.tabIconDefault}
          multiline
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <ThemedText style={styles.submitButtonText}>Save Entry</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  title: {
    color: Colors.text,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  picker: {
    backgroundColor: Colors.card,
    color: Colors.text,
    borderRadius: 8,
    padding: 10,
  },
  input: {
    backgroundColor: Colors.card,
    color: Colors.text,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    backgroundColor: Colors.card,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  toggleButtonActive: {
    backgroundColor: Colors.tint,
  },
  toggleText: {
    color: Colors.text,
    fontSize: 14,
  },
  toggleTextActive: {
    color: Colors.background, // Dark text on teal background
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: Colors.tint,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});