import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Drug } from '../types/drug';
import { useOrderStore } from '../stores/orderStore';

interface Props {
  drug: Drug;
  onPress: () => void;
}

export default function DrugListItem({ drug, onPress }: Props) {
  const add = useOrderStore((s) => s.add);

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

      <Pressable
        style={styles.addBtn}
        onPress={(e) => {
          e.stopPropagation();
          add(drug);
        }}
      >
        <Text style={styles.addBtnText}>+</Text>
      </Pressable>
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
});
