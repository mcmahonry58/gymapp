import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { saveWellnessCheckin } from '../../lib/wellnessService';
import { Colors } from '../../constants/colors';

const ORANGE = '#E08C3A';

const MOOD_LABELS = ['Very Low', 'Low', 'Okay', 'Good', 'Great'];
const ENERGY_LABELS = ['Exhausted', 'Tired', 'Okay', 'Energised', 'Excellent'];

export default function WellnessCheckinScreen() {
  const router = useRouter();
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!mood || !energy) {
      Alert.alert('Missing info', 'Please rate both mood and energy.');
      return;
    }
    setSaving(true);
    try {
      await saveWellnessCheckin(mood, energy);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <RatingSection
        title="Mood"
        labels={MOOD_LABELS}
        value={mood}
        onSelect={setMood}
        activeColor={ORANGE}
      />

      <RatingSection
        title="Energy"
        labels={ENERGY_LABELS}
        value={energy}
        onSelect={setEnergy}
        activeColor={ORANGE}
        style={{ marginTop: 32 }}
      />

      <TouchableOpacity
        style={[styles.saveButton, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={Colors.chipActiveText} />
        ) : (
          <Text style={styles.saveText}>Save Check-in</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

function RatingSection({
  title,
  labels,
  value,
  onSelect,
  activeColor,
  style,
}: {
  title: string;
  labels: string[];
  value: number | null;
  onSelect: (v: number) => void;
  activeColor: string;
  style?: object;
}) {
  return (
    <View style={style}>
      <Text style={styles.label}>{title}</Text>
      {value && (
        <Text style={styles.selectedLabel}>{labels[value - 1]}</Text>
      )}
      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity
            key={n}
            style={[
              styles.ratingBtn,
              value === n && { backgroundColor: activeColor, borderColor: activeColor },
            ]}
            onPress={() => onSelect(n)}
            activeOpacity={0.7}
          >
            <Text style={[styles.ratingText, value === n && styles.ratingTextActive]}>
              {n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.ratingHints}>
        <Text style={styles.hint}>Low</Text>
        <Text style={styles.hint}>High</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  selectedLabel: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ratingBtn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '500',
  },
  ratingTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  ratingHints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  hint: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: Colors.chipActiveBg,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 40,
  },
  saveText: {
    color: Colors.chipActiveText,
    fontSize: 16,
    fontWeight: '600',
  },
});
