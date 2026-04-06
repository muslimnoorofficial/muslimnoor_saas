import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { apiClient, CreateDonationIntentDto } from '../api/client';
import { useStripe } from '@stripe/stripe-react-native';

interface DonationScreenProps {
  mosqueSlug: string;
  onDonationComplete: (donationId: string) => void;
}

const DonationScreen: React.FC<DonationScreenProps> = ({
  mosqueSlug,
  onDonationComplete,
}) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [amount, setAmount] = useState<string>('');
  const [donationType, setDonationType] = useState<'one_time' | 'monthly'>('one_time');
  const [purpose, setPurpose] = useState<string>('general');
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [donorPhone, setDonorPhone] = useState<string>('');
  const [donorMessage, setDonorMessage] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const purposes = [
    { label: 'General Donation', value: 'general' },
    { label: 'Zakat', value: 'zakat' },
    { label: 'Sadaqah', value: 'sadaqah' },
    { label: 'Ramadan', value: 'ramadan' },
    { label: 'Building Fund', value: 'building_fund' },
  ];

  const presetAmounts = [10, 25, 50, 100, 250, 500];

  const handlePresetAmount = (presetAmount: number) => {
    setAmount(presetAmount.toString());
  };

  const handleSubmit = async () => {
    if (!amount || !donorName || !donorEmail) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount < 1) {
      Alert.alert('Error', 'Please enter a valid amount (minimum $1.00)');
      return;
    }

    setIsLoading(true);

    try {
      const donationData: CreateDonationIntentDto = {
        amount: Math.round(donationAmount * 100), // Convert to cents
        donation_type: donationType,
        purpose: purpose as any,
        donor_name: donorName,
        donor_email: donorEmail,
        donor_phone: donorPhone || undefined,
        donor_message: donorMessage || undefined,
        is_anonymous: isAnonymous,
      };

      const result = await apiClient.createDonationIntent(mosqueSlug, donationData);

      if (result.success && result.data.client_secret) {
        // Initialize Stripe Payment Sheet
        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: result.data.client_secret,
          merchantDisplayName: 'Muslim Noor',
        });

        if (initError) {
          Alert.alert('Error', initError.message);
          return;
        }

        // Present payment sheet
        const { error: paymentError } = await presentPaymentSheet();

        if (paymentError) {
          Alert.alert('Payment Failed', paymentError.message);
        } else {
          Alert.alert('Success', 'Thank you for your donation!');
          onDonationComplete(result.data.donation_id);
        }
      } else {
        Alert.alert('Error', result.error?.message || 'Failed to create donation');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('Donation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Make a Donation</Text>

      {/* Amount Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amount ($)</Text>
        <View style={styles.presetContainer}>
          {presetAmounts.map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetButton,
                amount === preset.toString() && styles.presetButtonActive,
              ]}
              onPress={() => handlePresetAmount(preset)}
            >
              <Text
                style={[
                  styles.presetButtonText,
                  amount === preset.toString() && styles.presetButtonTextActive,
                ]}
              >
                ${preset}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter custom amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
      </View>

      {/* Donation Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Donation Type</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.buttonGroupItem,
              donationType === 'one_time' && styles.buttonGroupItemActive,
            ]}
            onPress={() => setDonationType('one_time')}
          >
            <Text
              style={[
                styles.buttonGroupText,
                donationType === 'one_time' && styles.buttonGroupTextActive,
              ]}
            >
              One Time
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.buttonGroupItem,
              donationType === 'monthly' && styles.buttonGroupItemActive,
            ]}
            onPress={() => setDonationType('monthly')}
          >
            <Text
              style={[
                styles.buttonGroupText,
                donationType === 'monthly' && styles.buttonGroupTextActive,
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Purpose */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Purpose</Text>
        {purposes.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.radioButton,
              purpose === item.value && styles.radioButtonActive,
            ]}
            onPress={() => setPurpose(item.value)}
          >
            <Text
              style={[
                styles.radioButtonText,
                purpose === item.value && styles.radioButtonTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Donor Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Full Name *"
          value={donorName}
          onChangeText={setDonorName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email *"
          value={donorEmail}
          onChangeText={setDonorEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Phone (optional)"
          value={donorPhone}
          onChangeText={setDonorPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={[styles.input, styles.messageInput]}
          placeholder="Message (optional)"
          value={donorMessage}
          onChangeText={setDonorMessage}
          multiline
          numberOfLines={3}
        />
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setIsAnonymous(!isAnonymous)}
        >
          <View style={[styles.checkboxBox, isAnonymous && styles.checkboxBoxChecked]}>
            {isAnonymous && <Text style={styles.checkboxCheck}>✓</Text>}
          </View>
          <Text style={styles.checkboxText}>Make this donation anonymous</Text>
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? 'Processing...' : `Donate $${amount || '0'}`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#2c3e50',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#34495e',
  },
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  presetButton: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  presetButtonActive: {
    backgroundColor: '#3498db',
  },
  presetButtonText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  presetButtonTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  messageInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    flexDirection: 'row',
  },
  buttonGroupItem: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  buttonGroupItemActive: {
    backgroundColor: '#3498db',
  },
  buttonGroupText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  buttonGroupTextActive: {
    color: '#fff',
  },
  radioButton: {
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  radioButtonActive: {
    backgroundColor: '#3498db',
  },
  radioButtonText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  radioButtonTextActive: {
    color: '#fff',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  checkboxCheck: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 16,
    color: '#34495e',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DonationScreen;</content>
<parameter name="filePath">/Users/tareque/Destination_distinction/Muslim_Noor/MuslimNoor_Saas/apps/MuslimNoorMobile/src/screens/DonationScreen.tsx