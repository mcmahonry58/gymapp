import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Error', error.message);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Button title="Log Out" onPress={signOut} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 24 },
  title: { fontSize: 24, fontWeight: 'bold' },
});
