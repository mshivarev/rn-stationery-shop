import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useOrderLines, useOrderStore } from '../stores/orderStore';
import OrderItem from '../components/OrderItem';
import OrderSummary from '../components/OrderSummary';
import EmptyState from '../components/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Order'>;

export default function OrderScreen() {
  const navigation = useNavigation<Nav>();
  const lines = useOrderLines();
  const clear = useOrderStore((s) => s.clear);

  if (lines.length === 0) {
    return (
      <EmptyState
        title="Заказ пуст"
        subtitle="Добавьте лекарства из каталога"
      />
    );
  }

  const handleBuy = () => {
    // Читаем актуальное состояние из стора вне React — фишка Zustand
    const total = useOrderStore.getState().lines;
    const count = Object.values(total).reduce((s, l) => s + l.quantity, 0);

    Alert.alert(
      'Заказ оформлен! 💊',
      `Вы заказали ${count} уп. лекарств.`,
      [
        {
          text: 'OK',
          onPress: () => {
            clear();
            // Закрытие приложения — только Android.
            // На iOS это ограничено политикой Apple.
            try {
              const RNExitApp = require('react-native-exit-app').default;
              RNExitApp.exitApp();
            } catch {
              // библиотека не установлена — просто возвращаемся назад
              navigation.popToTop();
            }
          },
        },
      ],
      { cancelable: false },
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={lines}
        keyExtractor={(l) => l.drug.id}
        renderItem={({ item }) => <OrderItem line={item} />}
        contentContainerStyle={styles.list}
      />
      <View style={styles.footer}>
        <OrderSummary />
        <Pressable style={styles.buyBtn} onPress={handleBuy}>
          <Text style={styles.buyBtnText}>Оформить заказ</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8' },
  list: { paddingVertical: 6 },
  footer: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  buyBtn: {
    backgroundColor: '#43a047',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});