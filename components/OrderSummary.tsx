import { StyleSheet, Text, View } from 'react-native';
import { selectOrderCount, useOrderStore } from '../stores/orderStore';

export default function OrderSummary() {
  const count = useOrderStore(selectOrderCount);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.totalLabel}>Всего упаковок</Text>
        <Text style={styles.totalValue}>{count}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#1e88e5' },
});
