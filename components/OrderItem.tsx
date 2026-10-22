import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { OrderLine } from '../types/drug';
import { useOrderStore } from '../stores/orderStore';
import { useState } from 'react';

export default function OrderItem({ line }: { line: OrderLine }) {
  const [qty, setQty] = useState<number>(line.quantity);
  const remove = useOrderStore((s) => s.remove);

  return (
    <View style={styles.row}>
      <Image source={require('../assets/no-image.png')} style={styles.image} resizeMode="contain" />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {line.drug.name} {line.drug.dosage}
        </Text>
        <Text style={styles.form}>
          {line.drug.form} · {qty} шт.
        </Text>

        <View style={styles.controls}>
          <Pressable style={styles.qtyBtn} onPress={() => setQty(qty - 1)}>
            <Text style={styles.qtyText}>−</Text>
          </Pressable>
          <Text style={styles.qty}>{qty}</Text>
          <Pressable style={styles.qtyBtn} onPress={() => setQty(qty + 1)}>
            <Text style={styles.qtyText}>+</Text>
          </Pressable>
          <Pressable onPress={() => remove(line.drug.id)} style={styles.remove}>
            <Text style={styles.removeText}>Удалить</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  image: { width: 72, height: 72, borderRadius: 8, backgroundColor: '#f2f2f2' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  form: { fontSize: 13, color: '#1e88e5', fontWeight: '600', marginBottom: 8 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#eef3fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: { fontSize: 18, fontWeight: '700', color: '#1e88e5' },
  qty: { fontSize: 16, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  remove: { marginLeft: 'auto' },
  removeText: { color: '#e53935', fontSize: 13 },
});
