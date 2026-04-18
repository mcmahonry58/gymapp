import { useState, useMemo } from 'react';
import {
  View, Text, TextInput, FlatList, ScrollView,
  TouchableOpacity, ActivityIndicator, StyleSheet, Modal, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMovements } from '../../hooks/useMovements';
import { usePrograms } from '../../hooks/usePrograms';
import { useEnrollment } from '../../hooks/useEnrollment';
import { Colors } from '../../constants/colors';
import { Movement } from '../../types/movement';
import { Program } from '../../types/program';

const TEAL = '#2DB6CA';

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: '#4CAF82',
  intermediate: '#E08C3A',
  advanced: '#E05555',
};

export default function DiscoverScreen() {
  const router = useRouter();
  const { movements, loading: movementsLoading, error: movementsError, refetch: refetchMovements } = useMovements();
  const { programs, loading: programsLoading } = usePrograms();
  const { enrollment } = useEnrollment();
  const [activeTab, setActiveTab] = useState<'programs' | 'movements'>('programs');
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

  function clearFilters() {
    setSelectedMuscle(null);
    setSelectedEquipment(null);
  }

  return (
    <View style={styles.container}>
      {/* Tab switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'programs' && styles.tabButtonActive]}
          onPress={() => setActiveTab('programs')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabButtonText, activeTab === 'programs' && styles.tabButtonTextActive]}>
            Programs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'movements' && styles.tabButtonActive]}
          onPress={() => setActiveTab('movements')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabButtonText, activeTab === 'movements' && styles.tabButtonTextActive]}>
            Movements
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'programs' ? (
        programsLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.textPrimary} />
          </View>
        ) : (
          <FlatList
            data={programs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProgramCard
                item={item}
                enrolled={enrollment?.program_id === item.id && enrollment.status === 'active'}
                onPress={() => router.push(`/program/${item.id}`)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyText}>No programs available</Text>
              </View>
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={programs.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
          />
        )
      ) : (
        <>
          {/* Search + Filter row */}
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

          {movementsLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={Colors.textPrimary} />
            </View>
          ) : movementsError ? (
            <View style={styles.centered}>
              <Text style={styles.errorText}>Failed to load movements</Text>
              <TouchableOpacity onPress={refetchMovements} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <MovementRow item={item} onPress={() => router.push(`/movement/${item.id}`)} />
              )}
              ListEmptyComponent={
                <View style={styles.centered}>
                  <Text style={styles.emptyText}>No movements found</Text>
                </View>
              }
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={filtered.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
            />
          )}

          {/* Filter modal */}
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
                  <TouchableOpacity onPress={clearFilters}>
                    <Text style={styles.clearText}>Clear all</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.sectionLabel}>Muscle Group</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContent}>
                <Chip label="All" active={!selectedMuscle} onPress={() => setSelectedMuscle(null)} />
                {muscleGroups.map((g) => (
                  <Chip
                    key={g}
                    label={capitalize(g)}
                    active={selectedMuscle === g}
                    onPress={() => setSelectedMuscle(selectedMuscle === g ? null : g)}
                  />
                ))}
              </ScrollView>

              <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Equipment</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContent}>
                <Chip label="All" active={!selectedEquipment} onPress={() => setSelectedEquipment(null)} />
                {equipmentList.map((e) => (
                  <Chip
                    key={e}
                    label={capitalize(e)}
                    active={selectedEquipment === e}
                    onPress={() => setSelectedEquipment(selectedEquipment === e ? null : e)}
                  />
                ))}
              </ScrollView>

              <TouchableOpacity style={styles.doneButton} onPress={() => setFilterVisible(false)}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}

function ProgramCard({ item, enrolled, onPress }: { item: Program; enrolled: boolean; onPress: () => void }) {
  const diffColor = DIFFICULTY_COLOR[item.difficulty] ?? '#888';
  return (
    <TouchableOpacity style={styles.programCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.programCardTop}>
        <Text style={styles.programName}>{item.name}</Text>
        {enrolled && (
          <View style={styles.enrolledBadge}>
            <Text style={styles.enrolledText}>Enrolled</Text>
          </View>
        )}
      </View>
      <View style={styles.programMeta}>
        <View style={[styles.difficultyBadge, { backgroundColor: diffColor + '22', borderColor: diffColor + '55' }]}>
          <Text style={[styles.difficultyText, { color: diffColor }]}>{capitalize(item.difficulty)}</Text>
        </View>
        <Text style={styles.weeksText}>{item.weeks_count} weeks</Text>
      </View>
    </TouchableOpacity>
  );
}

function MovementRow({ item, onPress }: { item: Movement; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.rowName}>{item.name}</Text>
      <Text style={styles.rowMuscles}>{item.muscle_groups.map(capitalize).join(' · ')}</Text>
    </TouchableOpacity>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
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
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabButtonActive: { backgroundColor: TEAL, borderColor: TEAL },
  tabButtonText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500' },
  tabButtonTextActive: { color: '#fff' },
  programCard: { paddingHorizontal: 20, paddingVertical: 16, gap: 8 },
  programCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  programName: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600', flex: 1 },
  enrolledBadge: {
    backgroundColor: TEAL + '22', borderWidth: 1, borderColor: TEAL + '55',
    borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2,
  },
  enrolledText: { color: TEAL, fontSize: 11, fontWeight: '600' },
  programMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  difficultyBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, borderWidth: 1 },
  difficultyText: { fontSize: 11, fontWeight: '600' },
  weeksText: { color: Colors.textSecondary, fontSize: 13 },
  topRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 4, paddingBottom: 10, gap: 10,
  },
  searchInput: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border, color: Colors.textPrimary,
    fontSize: 15, paddingHorizontal: 14, paddingVertical: 10,
  },
  filterButton: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  filterButtonActive: { backgroundColor: Colors.chipActiveBg, borderColor: Colors.chipActiveBg },
  filterButtonText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '500' },
  filterButtonTextActive: { color: Colors.chipActiveText },
  row: { paddingHorizontal: 20, paddingVertical: 14, gap: 3 },
  rowName: { color: Colors.textPrimary, fontSize: 16, fontWeight: '500' },
  rowMuscles: { color: Colors.textSecondary, fontSize: 13 },
  separator: { height: 1, backgroundColor: Colors.separator, marginLeft: 20 },
  errorText: { color: Colors.textSecondary, fontSize: 15, marginBottom: 12 },
  retryButton: { paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: Colors.textPrimary, fontSize: 15, fontWeight: '500' },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40,
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
