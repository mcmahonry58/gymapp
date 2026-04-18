import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/colors';
import { Movement } from '../../types/movement';

export default function MovementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [movement, setMovement] = useState<Movement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMovement() {
      const { data, error: err } = await supabase
        .from('movements')
        .select('*')
        .eq('id', id)
        .single();
      if (err) {
        setError(err.message);
      } else {
        setMovement(data);
      }
      setLoading(false);
    }
    if (id) fetchMovement();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.textPrimary} />
      </View>
    );
  }

  if (error || !movement) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load movement</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.name}>{movement.name}</Text>

        {movement.description ? (
          <Text style={styles.description}>{movement.description}</Text>
        ) : null}

        <Section title="Muscle Groups">
          <View style={styles.tagRow}>
            {movement.muscle_groups.map((g) => (
              <View key={g} style={styles.tag}>
                <Text style={styles.tagText}>{capitalize(g)}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Equipment">
          <View style={styles.tagRow}>
            {movement.equipment.map((e) => (
              <View key={e} style={styles.tag}>
                <Text style={styles.tagText}>{capitalize(e)}</Text>
              </View>
            ))}
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg,
  },
  content: {
    padding: 24,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 10,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    color: Colors.textPrimary,
    fontSize: 14,
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
});
