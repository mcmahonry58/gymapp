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
import { saveMeal } from '../../lib/nutritionService';
import { Colors } from '../../constants/colors';

const MEAL_PRESETS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function AddMealScreen() {
  const router = useRouter();
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!mealName.trim()) {
      Alert.alert('Missing info', 'Please enter a meal name.');
      return;
    }
    setSaving(true);
    try {
      await saveMeal({
        meal_name: mealName.trim(),
        calories: parseInt(calories) || null,
        protein_g: parseFloat(protein) || null,
        carbs_g: parseFloat(carbs) || null,
        fat_g: parseFloat(fat) || null,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save meal. Please try again.');
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
        {/* Meal name presets */}
        <Text style={styles.label}>Meal</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presets}
        >
          {MEAL_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[styles.preset, mealName === preset && styles.presetActive]}
              onPress={() => setMealName(preset)}
              activeOpacity={0.7}
            >
              <Text style={[styles.presetText, mealName === preset && styles.presetTextActive]}>
                {preset}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TextInput
          style={styles.input}
          value={mealName}
          onChangeText={setMealName}
          placeholder="Or type a custom name..."
          placeholderTextColor={Colors.textSecondary}
        />

        {/* Macro inputs */}
        <Text style={[styles.label, { marginTop: 24 }]}>Nutrition</Text>

        <MacroInput label="Calories" unit="kcal" value={calories} onChange={setCalories} />
        <MacroInput label="Protein" unit="g" value={protein} onChange={setProtein} decimal />
        <MacroInput label="Carbs" unit="g" value={carbs} onChange={setCarbs} decimal />
        <MacroInput label="Fat" unit="g" value={fat} onChange={setFat} decimal />

        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors.chipActiveText} />
          ) : (
            <Text style={styles.saveText}>Save Meal</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function MacroInput({
  label,
  unit,
  value,
  onChange,
  decimal,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  decimal?: boolean;
}) {
  return (
    <View style={styles.macroRow}>
      <Text style={styles.macroLabel}>{label}</Text>
      <View style={styles.macroInputWrap}>
        <TextInput
          style={styles.macroInput}
          value={value}
          onChangeText={onChange}
          keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
          placeholder="—"
          placeholderTextColor={Colors.textSecondary}
          maxLength={7}
        />
        <Text style={styles.macroUnit}>{unit}</Text>
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
  presets: {
    gap: 8,
    marginBottom: 10,
  },
  preset: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetActive: {
    backgroundColor: Colors.chipActiveBg,
    borderColor: Colors.chipActiveBg,
  },
  presetText: {
    color: Colors.textPrimary,
    fontSize: 14,
  },
  presetTextActive: {
    color: Colors.chipActiveText,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  macroLabel: {
    color: Colors.textPrimary,
    fontSize: 15,
  },
  macroInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  macroInput: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: 'right',
    minWidth: 80,
  },
  macroUnit: {
    color: Colors.textSecondary,
    fontSize: 14,
    width: 30,
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
