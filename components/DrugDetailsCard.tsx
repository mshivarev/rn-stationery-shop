import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Drug } from '../types/drug';

export default function DrugDetailsCard({ drug }: { drug: Drug }) {
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Image source={require('../assets/no-image.png')} style={styles.image} resizeMode="contain" />
      <Text style={styles.category}>{drug.category}</Text>
      <Text style={styles.name}>{drug.name}</Text>
      <Text style={styles.latin}>{drug.latin_name}</Text>
      <Text style={styles.line}>Действующее вещество: {drug.active_substance}</Text>
      <Text style={styles.line}>Форма выпуска: {drug.form}</Text>
      <Text style={styles.line}>Дозировка: {drug.dosage}</Text>
      <Text style={styles.line}>Производитель: {drug.manufacturer}</Text>
      <Text style={drug.prescription_required ? styles.rx : styles.otc}>
        {drug.prescription_required ? 'Отпускается по рецепту' : 'Без рецепта'}
      </Text>
      <Text style={styles.stock}>В наличии: {drug.stock} шт.</Text>
      <Text style={styles.desc}>{drug.description}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 40 },
  image: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    backgroundColor: '#f2f2f2',
    marginBottom: 16,
  },
  category: { fontSize: 12, color: '#888', textTransform: 'uppercase' },
  name: { fontSize: 22, fontWeight: '700', marginTop: 6 },
  latin: { fontSize: 14, color: '#999', fontStyle: 'italic', marginBottom: 12 },
  line: { fontSize: 14, color: '#333', marginBottom: 4 },
  rx: { fontSize: 14, color: '#e53935', fontWeight: '600', marginTop: 8 },
  otc: { fontSize: 14, color: '#1e88e5', fontWeight: '600', marginTop: 8 },
  stock: { fontSize: 13, color: '#4caf50', marginTop: 4, marginBottom: 16 },
  desc: { fontSize: 15, lineHeight: 22, color: '#333' },
});
