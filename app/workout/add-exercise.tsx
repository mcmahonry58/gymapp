import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMovements } from '../../hooks/useMovements';
import { useWorkoutStore } from '../../store/workoutStore';
import { Colors } from '../../constants/colors';
import { Movement } from '../../types/movement';

export default function AddExerciseScreen() {
  const router = useRouter();
  const { movements, loading, error, refetch } = useMovements();
  const addExercise = useWorkoutStore((s) => s.addExercise);

  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);

  const muscleGroups = useMemo(() => {
    const all = movements.flatMap((m) => m.muscle_groups);
    return Array.from(new Set(all)).sort();
  }, [movements]);

  const equipmentList = useMemo(() => {
    const all = movements.flatMap((m) => m.equipment);
    return Array.from(new Set(all)).sort();
  }, [movements]);

  const filtered = useMemo(
    () =>
      movements.filter((m) => {
        const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
        const matchesMuscle = !selectedMuscle || m.muscle_groups.includes(selectedMuscle);
        const matchesEquipment = !selectedEquipment || m.equipment.includes(selectedEquipment);
        return matchesSearch && matchesMuscle && matchesEquipment;
      }),
    [movements, search, selectedMuscle, selectedEquipment]
  );

  const activeFilterCount = (selectedMuscle ? 1 : 0) + (selectedEquipment ? 1 : 0);

  function handleSelect(movement: Movement) {
    addExercise(movement);
    router.back();
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.textPrimary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load movements</Text>
        <TouchableOpacity onPress={refetch}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search movements..."
          placeholderTextColor={Colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
        />
        <TouchableOpacity
          style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
          onPress={() => setFilterVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterButtonText, activeFilterCount > 0 && styles.filterButtonTextActive]}>
            {activeFilterCount > 0 ? `Filter (${activeFilterCount})` : 'Filter'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => handleSelect(item)} activeOpacity={0.7}>
            <Text style={styles.rowName}>{item.name}</Text>
            <Text style={styles.rowMuscles}>{item.muscle_groups.map(capitalize).join(' · ')}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No movements found</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={filtered.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
      />

      <Modal
        visible={filterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setFilterVisible(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Filter</Text>
            {activeFilterCount > 0 && (
              <TouchableOpacity onPress={() => { setSelectedMuscle(null); setSelectedEquipment(null); }}>
                <Text style={styles.clearText}>Clear all</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.sectionLabel}>Muscle Group</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContent}>
            <Chip label="All" active={!selectedMuscle} onPress={() => setSelectedMuscle(null)} />
            {muscleGroups.map((g) => (
              <Chip key={g} label={capitalize(g)} active={selectedMuscle === g}
                onPress={() => setSelectedMuscle(selectedMuscle === g ? null : g)} />
            ))}
          </ScrollView>

          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Equipment</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContent}>
            <Chip label="All" active={!selectedEquipment} onPress={() => setSelectedEquipment(null)} />
            {equipmentList.map((e) => (
              <Chip key={e} label={capitalize(e)} active={selectedEquipment === e}
                onPress={() => setSelectedEquipment(selectedEquipment === e ? null : e)} />
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.doneButton} onPress={() => setFilterVisible(false)}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: { backgroundColor: Colors.chipActiveBg, borderColor: Colors.chipActiveBg },
  filterButtonText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '500' },
  filterButtonTextActive: { color: Colors.chipActiveText },
  row: { paddingHorizontal: 20, paddingVertical: 14, gap: 3 },
  rowName: { color: Colors.textPrimary, fontSize: 16, fontWeight: '500' },
  rowMuscles: { color: Colors.textSecondary, fontSize: 13 },
  separator: { height: 1, backgroundColor: Colors.separator, marginLeft: 20 },
  errorText: { color: Colors.textSecondary, fontSize: 15, marginBottom: 12 },
  retryText: { color: Colors.textPrimary, fontSize: 15, fontWeight: '500' },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { color: Colors.textPrimary, fontSize: 17, fontWeight: '600' },
  clearText: { color: Colors.textSecondary, fontSize: 14 },
  sectionLabel: {
    color: Colors.textSecondary, fontSize: 12, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10,
  },
  chipContent: { gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.chipActiveBg, borderColor: Colors.chipActiveBg },
  chipText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '400' },
  chipTextActive: { color: Colors.chipActiveText },
  doneButton: {
    marginTop: 28, backgroundColor: Colors.chipActiveBg,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  doneButtonText: { color: Colors.chipActiveText, fontSize: 15, fontWeight: '600' },
});
