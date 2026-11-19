import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';
import AuthScreen from '../screens/AuthScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={AuthScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Регистрация' }} />
        <Stack.Screen
          name="VerifyEmail"
          component={VerifyEmailScreen}
          options={{ title: 'Код из письма' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
