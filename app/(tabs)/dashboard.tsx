import { Image, StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

// Dark theme colors (same as TabLayout)
const Colors = {
  background: '#1A1A1A', // Dark gray-black background
  tint: '#00D1B2',       // Teal accent for active elements
  tabIconDefault: '#8E8E93', // Light gray for inactive icons
  text: '#FFFFFF',       // White text
  card: '#2C2C2E',       // Slightly lighter gray for cards
};

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [owedToMe, setOwedToMe] = useState(0);
  const [iOwe, setIOwe] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  // Fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, 'transactions'), where('userId', '==', user?.uid));
      const snapshot = await getDocs(q);
      let owed = 0, owe = 0, transactions: any[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'pending') {
          if (data.direction === 'lent') owed += data.amount || 0;
          if (data.direction === 'borrowed') owe += data.amount || 0;
        }
        transactions.push({ id: doc.id, ...data });
      });

      setOwedToMe(owed);
      setIOwe(owe);
      setRecentTransactions(transactions.slice(0, 3)); // Show last 3 transactions
    };

    fetchData();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: Colors.background, dark: Colors.background }} // Always dark
      headerImage={
        <Image
          source={require('@/assets/images/arona.jpg')} // Replace with your header image
          style={styles.headerImg}
        />
      }
    >
      {/* Title */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ color: Colors.text }}>
          Borrow Buddy
        </ThemedText>
      </ThemedView>

      {/* Summary Cards */}
      <ThemedView style={styles.summaryContainer}>
        <Card style={[styles.card, { backgroundColor: Colors.card }]}>
          <ThemedText style={styles.cardTitle}>Owed to Me</ThemedText>
          <ThemedText style={styles.cardValue}>${owedToMe.toFixed(2)}</ThemedText>
        </Card>
        <Card style={[styles.card, { backgroundColor: Colors.card }]}>
          <ThemedText style={styles.cardTitle}>I Owe</ThemedText>
          <ThemedText style={styles.cardValue}>${iOwe.toFixed(2)}</ThemedText>
        </Card>
      </ThemedView>

      {/* Recent Transactions */}
      <ThemedView style={styles.recentContainer}>
        <Card style={[styles.card, { backgroundColor: Colors.card }]}>
          <ThemedText style={styles.cardTitle}>Recent Transactions</ThemedText>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((txn) => (
              <View key={txn.id} style={styles.transactionItem}>
                <Text style={styles.transactionText}>
                  {txn.direction === 'lent' ? 'Lent to' : 'Borrowed from'} {txn.friendName}
                </Text>
                <Text style={styles.transactionAmount}>
                  {txn.type === 'money' ? `$${txn.amount}` : txn.itemName}
                </Text>
              </View>
            ))
          ) : (
            <ThemedText style={styles.noDataText}>No recent transactions</ThemedText>
          )}
        </Card>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImg: {
    height: '100%',
    width: 'auto',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: Colors.background,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 16,
    backgroundColor: Colors.background,
  },
  recentContainer: {
    padding: 16,
    backgroundColor: Colors.background,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardValue: {
    color: Colors.tint,
    fontSize: 24,
    fontWeight: 'bold',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.tabIconDefault,
  },
  transactionText: {
    color: Colors.text,
    fontSize: 14,
  },
  transactionAmount: {
    color: Colors.tint,
    fontSize: 14,
    fontWeight: '600',
  },
  noDataText: {
    color: Colors.tabIconDefault,
    fontSize: 14,
    textAlign: 'center',
  },
});