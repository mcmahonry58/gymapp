import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { usePosts } from '../../hooks/usePosts';
import { Post } from '../../types/post';
import { Colors } from '../../constants/colors';

const BLUE = '#4A90D9';

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function PostsScreen() {
  const router = useRouter();
  const { posts, loading, error, refetch } = usePosts();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  const ListHeader = (
    <View style={styles.header}>
      <Text style={styles.heading}>Posts</Text>
      <TouchableOpacity
        style={styles.shareButton}
        onPress={() => router.push('/posts/create-post')}
        activeOpacity={0.7}
      >
        <Text style={styles.shareButtonText}>Share something</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={loading && !refreshing ? [] : posts}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator color={Colors.textSecondary} style={{ marginTop: 40 }} />
        ) : error ? (
          <View>
            <Text style={styles.emptyText}>Failed to load posts.</Text>
            <TouchableOpacity onPress={refetch}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.emptyText}>No posts yet. Be the first to share!</Text>
        )
      }
      renderItem={({ item }) => <PostCard post={item} />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.textSecondary}
        />
      }
    />
  );
}

function PostCard({ post }: { post: Post }) {
  const name = post.users?.display_name ?? 'Athlete';
  return (
    <View style={styles.card}>
      <View style={styles.cardMeta}>
        <Text style={styles.authorName}>{name}</Text>
        <Text style={styles.timestamp}>{relativeTime(post.created_at)}</Text>
      </View>
      <Text style={styles.postContent}>{post.content}</Text>
      {post.workout_log_id && (
        <View style={styles.workoutBadge}>
          <View style={[styles.dot, { backgroundColor: BLUE }]} />
          <Text style={styles.workoutBadgeText}>Workout logged</Text>
        </View>
      )}
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
  header: {
    marginBottom: 20,
    gap: 14,
  },
  heading: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  shareButton: {
    backgroundColor: Colors.chipActiveBg,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  shareButtonText: {
    color: Colors.chipActiveText,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  retryText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorName: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  timestamp: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  postContent: {
    color: Colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  workoutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  workoutBadgeText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});
