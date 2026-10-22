import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { selectOrderCount, useOrderStore } from '../stores/orderStore';

export default function HeaderOrderButton() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const count = useOrderStore(selectOrderCount);

  return (
    <Pressable onPress={() => navigation.navigate('Order')} style={styles.wrap}>
      <Text style={styles.icon}>🛒</Text>
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 8 },
  icon: { fontSize: 22 },
  badge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#e53935',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});