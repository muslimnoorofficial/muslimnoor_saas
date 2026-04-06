import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';

// Import screens
import DonationScreen from './src/screens/DonationScreen';

// Define navigation types
export type RootStackParamList = {
  MosqueSelection: undefined;
  Donation: { mosqueSlug: string };
  // Add more screens as needed
  // MosqueList: undefined;
  // PrayerTimes: { mosqueSlug: string };
  // Announcements: { mosqueSlug: string };
};

const Stack = createStackNavigator<RootStackParamList>();

// Temporary mock screen for mosque selection
const MosqueSelectionScreen = ({ navigation }: any) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8f9fa' }}>
      <Text style={{ fontSize: 28, marginBottom: 10, fontWeight: 'bold', color: '#2c3e50' }}>
        🕌 Muslim Noor
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 30, textAlign: 'center', color: '#7f8c8d' }}>
        Connect with your local mosque
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: '#27ae60',
          padding: 15,
          borderRadius: 8,
          width: '80%',
          alignItems: 'center',
          marginBottom: 15,
        }}
        onPress={() => navigation.navigate('Donation', { mosqueSlug: 'masjid-manhattan' })}
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
          Masjid Manhattan
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: '#3498db',
          padding: 15,
          borderRadius: 8,
          width: '80%',
          alignItems: 'center',
        }}
        onPress={() => navigation.navigate('Donation', { mosqueSlug: 'islamic-center-brooklyn' })}
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
          Islamic Center Brooklyn
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function App() {
  return (
    <StripeProvider
      publishableKey="pk_test_51R6czTR6hvWQXl3xbugEPBdOUHJ08NvOQKG1OgDbm1e6al8GS8xJ85vVYgVU0gLGjPhyuANWvKoqJTEKBa1CrwY800J02NaFRd"
      // For production, use your actual Stripe publishable key
      // publishableKey="pk_live_..."
    >
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="MosqueSelection"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#2c3e50',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="MosqueSelection"
            component={MosqueSelectionScreen}
            options={{ title: 'Muslim Noor' }}
          />
          <Stack.Screen
            name="Donation"
            component={DonationScreen}
            options={{ title: 'Make a Donation' }}
          />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </StripeProvider>
  );
}
