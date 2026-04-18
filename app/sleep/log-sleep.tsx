import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { saveSleepLog } from '../../lib/sleepService';
import { Colors } from '../../constants/colors';

const PURPLE = '#9B6FD4';

export default function LogSleepScreen() {
  const router = useRouter();
  const [bedHour, setBedHour] = useState('22');
  const [bedMinute, setBedMinute] = useState('30');
  const [wakeHour, setWakeHour] = useState('6');
  const [wakeMinute, setWakeMinute] = useState('30');
  const [quality, setQuality] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const bh = parseInt(bedHour);
    const bm = parseInt(bedMinute);
    const wh = parseInt(wakeHour);
    const wm = parseInt(wakeMinute);

    if (isNaN(bh) || isNaN(bm) || isNaN(wh) || isNaN(wm)) {
      Alert.alert('Invalid time', 'Please enter valid hours and minutes.');
      return;
    }
    if (bh < 0 || bh > 23 || wh < 0 || wh > 23 || bm < 0 || bm > 59 || wm < 0 || wm > 59) {
      Alert.alert('Invalid time', 'Hours must be 0–23 and minutes 0–59.');
      return;
    }
    if (!quality) {
      Alert.alert('Missing info', 'Please rate your sleep quality.');
      return;
    }

    setSaving(true);
    try {
      await saveSleepLog(bh, bm, wh, wm, quality);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Bedtime */}
        <Text style={styles.label}>Bedtime</Text>
        <View style={styles.timeRow}>
          <TimeInput value={bedHour} onChange={setBedHour} placeholder="22" />
          <Text style={styles.timeSep}>:</Text>
          <TimeInput value={bedMinute} onChange={setBedMinute} placeholder="30" />
        </View>

        {/* Wake time */}
        <Text style={[styles.label, { marginTop: 24 }]}>Wake time</Text>
        <View style={styles.timeRow}>
          <TimeInput value={wakeHour} onChange={setWakeHour} placeholder="6" />
          <Text style={styles.timeSep}>:</Text>
          <TimeInput value={wakeMinute} onChange={setWakeMinute} placeholder="30" />
        </View>

        {/* Quality */}
        <Text style={[styles.label, { marginTop: 24 }]}>Sleep quality</Text>
        <View style={styles.qualityRow}>
          {[1, 2, 3, 4, 5].map((q) => (
            <TouchableOpacity
              key={q}
              style={[styles.qualityBtn, quality === q && { backgroundColor: PURPLE, borderColor: PURPLE }]}
              onPress={() => setQuality(q)}
              activeOpacity={0.7}
            >
              <Text style={[styles.qualityText, quality === q && styles.qualityTextActive]}>
                {q}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.qualityLabels}>
          <Text style={styles.qualityHint}>Poor</Text>
          <Text style={styles.qualityHint}>Excellent</Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors.chipActiveText} />
          ) : (
            <Text style={styles.saveText}>Save Sleep</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function TimeInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <TextInput
      style={styles.timeInput}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={Colors.textSecondary}
      keyboardType="number-pad"
      maxLength={2}
      textAlign="center"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
    fontSize: 32,
    fontWeight: '600',
    width: 80,
    height: 72,
  },
  timeSep: {
    color: Colors.textPrimary,
    fontSize: 32,
    fontWeight: '300',
  },
  qualityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  qualityBtn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qualityText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '500',
  },
  qualityTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  qualityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  qualityHint: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: Colors.chipActiveBg,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveText: {
    color: Colors.chipActiveText,
    fontSize: 16,
    fontWeight: '600',
  },
});
