import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import DrugListScreen from '../screens/DrugListScreen';
import DrugDetailsScreen from '../screens/DrugDetailsScreen';
import OrderScreen from '../screens/OrderScreen';
import HeaderOrderButton from '../components/HeaderOrderButton';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="DrugList"
          component={DrugListScreen}
          options={{
            title: 'Аптека',
            headerRight: () => <HeaderOrderButton />,
          }}
        />
        <Stack.Screen
          name="DrugDetails"
          component={DrugDetailsScreen}
          options={{
            title: 'Лекарство',
            headerRight: () => <HeaderOrderButton />,
          }}
        />
        <Stack.Screen
          name="Order"
          component={OrderScreen}
          options={{ title: 'Корзина' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}