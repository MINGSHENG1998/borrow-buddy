import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { db } from "../../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

// Dark theme colors (consistent with previous pages)
const Colors = {
  background: "#1A1A1A",
  tint: "#00D1B2",
  tabIconDefault: "#8E8E93",
  text: "#FFFFFF",
  card: "#2C2C2E",
} as const;

// Transaction type definition
type Transaction = {
  id: string;
  type: "money" | "item";
  amount: number | null;
  itemName: string | null;
  friendName: string;
  direction: "borrowed" | "lent";
  date: string;
  status: "pending" | "settled";
  notes: string | null;
};

export default function TransactionsScreen() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<"all" | "owedToMe" | "iOwe" | "settled">(
    "all"
  );

  // Fetch transactions from Firebase
  useEffect(() => {
    const fetchTransactions = async () => {
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", user?.uid)
      );
      const snapshot = await getDocs(q);
      const fetchedTransactions: Transaction[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];
      setTransactions(fetchedTransactions);
    };

    fetchTransactions();
  }, []);

  // Filter transactions based on selected filter
  const filteredTransactions = transactions.filter((txn) => {
    if (filter === "all") return true;
    if (filter === "owedToMe")
      return txn.direction === "lent" && txn.status === "pending";
    if (filter === "iOwe")
      return txn.direction === "borrowed" && txn.status === "pending";
    if (filter === "settled") return txn.status === "settled";
    return false;
  });

  // Mark transaction as settled
  const handleSettle = async (id: string) => {
    try {
      const txnRef = doc(db, "transactions", id);
      await updateDoc(txnRef, { status: "settled" });
      setTransactions((prev) =>
        prev.map((txn) =>
          txn.id === id ? { ...txn, status: "settled" as const } : txn
        )
      );
      Alert.alert("Success", "Transaction marked as settled.");
    } catch (error) {
      console.error("Error settling transaction:", error);
      Alert.alert("Error", "Failed to settle transaction.");
    }
  };

  // Delete transaction
  const handleDelete = async (id: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const txnRef = doc(db, "transactions", id);
              await deleteDoc(txnRef);
              setTransactions((prev) => prev.filter((txn) => txn.id !== id));
              Alert.alert("Success", "Transaction deleted.");
            } catch (error) {
              console.error("Error deleting transaction:", error);
              Alert.alert("Error", "Failed to delete transaction.");
            }
          },
        },
      ]
    );
  };

  // Render each transaction item
  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionDetails}>
        <ThemedText style={styles.transactionText}>
          {item.direction === "lent" ? "Lent to" : "Borrowed from"}{" "}
          {item.friendName}
        </ThemedText>
        <ThemedText style={styles.transactionAmount}>
          {item.type === "money" ? `$${item.amount}` : item.itemName}
        </ThemedText>
        <ThemedText style={styles.transactionDate}>
          {new Date(item.date).toLocaleDateString()}
        </ThemedText>
        {item.notes && (
          <ThemedText style={styles.transactionNotes}>
            Notes: {item.notes}
          </ThemedText>
        )}
      </View>
      <View style={styles.actionButtons}>
        {item.status === "pending" && (
          <TouchableOpacity
            style={styles.settleButton}
            onPress={() => handleSettle(item.id)}
          >
            <Text style={styles.buttonText}>Settle</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Transactions
      </ThemedText>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(["all", "owedToMe", "iOwe", "settled"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              filter === f && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f === "all"
                ? "All"
                : f === "owedToMe"
                ? "Owed to Me"
                : f === "iOwe"
                ? "I Owe"
                : "Settled"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>
            No transactions found.
          </ThemedText>
        }
        contentContainerStyle={styles.listContent}
      />
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
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    padding: 10,
    backgroundColor: Colors.card,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: Colors.tint,
  },
  filterText: {
    color: Colors.text,
    fontSize: 14,
  },
  filterTextActive: {
    color: Colors.background,
    fontWeight: "600",
  },
  transactionCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  transactionAmount: {
    color: Colors.tint,
    fontSize: 14,
    marginTop: 4,
  },
  transactionDate: {
    color: Colors.tabIconDefault,
    fontSize: 12,
    marginTop: 4,
  },
  transactionNotes: {
    color: Colors.tabIconDefault,
    fontSize: 12,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  settleButton: {
    backgroundColor: Colors.tint,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: "#FF3B30", // Red for delete
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: "600",
  },
  emptyText: {
    color: Colors.tabIconDefault,
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
});
