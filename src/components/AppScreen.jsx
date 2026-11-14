import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import theme from '../styles/theme';

export default function AppScreen({ children, style }) {
  return <SafeAreaView style={[styles.screen, style]} edges={['top', 'right', 'bottom', 'left']}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
