import { Alert, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth/AuthContext';

export default function LogoutButton() {
  const { signOut } = useAuth();

  const handlePress = () => {
    Alert.alert('Выйти из аккаунта?', undefined, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Выйти', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={styles.wrap}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Выйти из аккаунта"
    >
      <Ionicons name="log-out-outline" size={22} color="#e53935" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 8 },
});
