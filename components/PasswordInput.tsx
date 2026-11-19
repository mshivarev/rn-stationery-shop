import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = Omit<TextInputProps, 'secureTextEntry'>;

export default function PasswordInput({ style, ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrap}>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        autoComplete="password"
        placeholderTextColor="#999"
        {...props}
        style={[styles.input, style]}
        secureTextEntry={!visible}
      />
      <Pressable
        onPress={() => setVisible((v) => !v)}
        style={styles.toggle}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Скрыть пароль' : 'Показать пароль'}
      >
        <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color="#666" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  input: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: '#222' },
  toggle: { paddingHorizontal: 12 },
});
