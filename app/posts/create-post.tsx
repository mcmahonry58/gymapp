import { useState, useEffect } from 'react';
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
import { supabase } from '../../lib/supabase';
import { createPost } from '../../lib/postsService';
import { Colors } from '../../constants/colors';

const BLUE = '#4A90D9';
const MAX_LENGTH = 1000;

export default function CreatePostScreen() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [todayWorkoutId, setTodayWorkoutId] = useState<string | null>(null);
  const [attachWorkout, setAttachWorkout] = useState(false);

  useEffect(() => {
    async function fetchTodayWorkout() {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from('workout_logs')
        .select('id')
        .gte('created_at', todayStart.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setTodayWorkoutId(data.id);
    }
    fetchTodayWorkout();
  }, []);

  async function handlePost() {
    const trimmed = content.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await createPost(trimmed, attachWorkout && todayWorkoutId ? todayWorkoutId : undefined);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to post. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const canPost = content.trim().length > 0 && !saving;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TextInput
          style={styles.input}
          placeholder="What did you crush today?"
          placeholderTextColor={Colors.textSecondary}
          value={content}
          onChangeText={(t) => setContent(t.slice(0, MAX_LENGTH))}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          autoFocus
        />
        <Text style={styles.counter}>{content.length}/{MAX_LENGTH}</Text>

        {todayWorkoutId && (
          <TouchableOpacity
            style={styles.attachRow}
            onPress={() => setAttachWorkout((v) => !v)}
            activeOpacity={0.7}
          >
            <View style={[styles.dot, { backgroundColor: BLUE }]} />
            <View style={styles.attachText}>
              <Text style={styles.attachTitle}>Attach today's workout</Text>
              <Text style={styles.attachSubtitle}>Add your session to this post</Text>
            </View>
            <View style={[styles.toggle, attachWorkout && styles.toggleOn]}>
              <View style={[styles.toggleThumb, attachWorkout && styles.toggleThumbOn]} />
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.postButton, !canPost && styles.postButtonDisabled]}
          onPress={handlePost}
          disabled={!canPost}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color={Colors.chipActiveText} />
          ) : (
            <Text style={styles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
    fontSize: 16,
    padding: 16,
    minHeight: 160,
    lineHeight: 24,
  },
  counter: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'right',
    marginTop: -8,
  },
  attachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  attachText: {
    flex: 1,
    gap: 2,
  },
  attachTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  attachSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    padding: 3,
  },
  toggleOn: {
    backgroundColor: BLUE,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.textSecondary,
    alignSelf: 'flex-start',
  },
  toggleThumbOn: {
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
  },
  postButton: {
    backgroundColor: Colors.chipActiveBg,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  postButtonDisabled: {
    opacity: 0.4,
  },
  postButtonText: {
    color: Colors.chipActiveText,
    fontSize: 16,
    fontWeight: '600',
  },
});
