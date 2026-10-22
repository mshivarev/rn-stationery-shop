import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Drug } from '../types/drug';
import { selectQuantity, useOrderStore } from '../stores/orderStore';

interface Props {
  drug: Drug;
  onPress: () => void;
}

export default function DrugListItem({ drug, onPress }: Props) {
  const add = useOrderStore((s) => s.add);
  const increment = useOrderStore((s) => s.increment);
  const decrement = useOrderStore((s) => s.decrement);
  const qty = useOrderStore(selectQuantity(drug.id));
  const canAdd = qty < drug.stock;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={require('../assets/no-image.png')} style={styles.image} resizeMode="contain" />
      <View style={styles.info}>
        <Text style={styles.category}>{drug.category}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {drug.name} {drug.dosage}
        </Text>
        <Text style={styles.form}>
          {drug.form} · {drug.manufacturer}
        </Text>
        {drug.prescription_required && <Text style={styles.rx}>По рецепту</Text>}
      </View>

      {qty === 0 ? (
        <Pressable
          style={[styles.addBtn, !canAdd && styles.disabled]}
          onPress={(e) => {
            e.stopPropagation();
            add(drug);
          }}
        >
          <Text style={styles.addBtnText}>+</Text>
        </Pressable>
      ) : (
        <View style={styles.controls}>
          <Pressable
            style={styles.qtyBtn}
            onPress={(e) => {
              e.stopPropagation();
              decrement(drug.id);
            }}
          >
            <Text style={styles.qtyText}>−</Text>
          </Pressable>
          <Text style={styles.qty}>{qty}</Text>
          <Pressable
            style={[styles.qtyBtn, !canAdd && styles.disabled]}
            onPress={(e) => {
              e.stopPropagation();
              increment(drug.id);
            }}
          >
            <Text style={styles.qtyText}>+</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#f2f2f2' },
  info: { flex: 1, marginLeft: 12 },
  category: { fontSize: 11, color: '#888' },
  name: { fontSize: 15, fontWeight: '600', marginVertical: 2 },
  form: { fontSize: 13, color: '#666' },
  rx: { fontSize: 12, color: '#e53935', fontWeight: '600', marginTop: 2 },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e88e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 22, lineHeight: 24, fontWeight: '700' },
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
  disabled: { opacity: 0.35 },
});
