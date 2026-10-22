import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchDrugById } from '../api/mockDrugsAPI';
import { Drug } from '../types/drug';
import { RootStackParamList } from "../types/navigation";
import DrugDetailsCard from '../components/DrugDetailsCard';
import EmptyState from '../components/EmptyState';
import { useOrderStore } from '../stores/orderStore';

type RouteT = RouteProp<RootStackParamList, 'DrugDetails'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'DrugDetails'>;

export default function DrugDetailsScreen() {
  const { params } = useRoute<RouteT>();
  const navigation = useNavigation<Nav>();
  const add = useOrderStore((s) => s.add);

  const [drug, setDrug] = useState<Drug | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const d = await fetchDrugById(params.drugId);
      if (alive) {
        setDrug(d ?? null);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [params.drugId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e88e5" />
      </View>
    );
  }

  if (!drug) {
    return <EmptyState title="Лекарство не найдено" />;
  }

  return (
    <View style={styles.container}>
      <DrugDetailsCard drug={drug} />
      <View style={styles.footer}>
        <Pressable
          style={styles.buyBtn}
          onPress={() => {
            add(drug);
            navigation.navigate('Order');
          }}
        >
          <Text style={styles.buyBtnText}>Добавить в заказ</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  buyBtn: {
    backgroundColor: '#1e88e5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});