import { StyleSheet, View } from 'react-native';
import LogoutButton from './LogoutButton';
import HeaderOrderButton from './HeaderOrderButton';

export default function HeaderActions() {
  return (
    <View style={styles.row}>
      <LogoutButton />
      <HeaderOrderButton />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
