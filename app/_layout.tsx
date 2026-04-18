import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { registerForPushNotifications } from '../lib/notificationService';
import * as Sentry from '@sentry/react-native';

Sentry.init({ dsn: 'https://615af54da2965ef4c8350e53b143b14e@o4511238542917632.ingest.us.sentry.io/4511238545670144' });

export default Sentry.wrap(function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
      if (session) registerForPushNotifications();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/');
    }
  }, [session, initialized, segments, router]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen
        name="movement/[id]"
        options={{
          title: '',
          headerStyle: { backgroundColor: '#0F0F0F' },
          headerTintColor: '#F2F2F2',
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="workout/active"
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen
        name="workout/add-exercise"
        options={{
          title: 'Add Exercise',
          headerStyle: { backgroundColor: '#0F0F0F' },
          headerTintColor: '#F2F2F2',
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="nutrition/add-meal"
        options={{
          title: 'Log Meal',
          headerStyle: { backgroundColor: '#0F0F0F' },
          headerTintColor: '#F2F2F2',
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="sleep/log-sleep"
        options={{
          title: 'Log Sleep',
          headerStyle: { backgroundColor: '#0F0F0F' },
          headerTintColor: '#F2F2F2',
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="wellness/checkin"
        options={{
          title: 'Wellness Check-in',
          headerStyle: { backgroundColor: '#0F0F0F' },
          headerTintColor: '#F2F2F2',
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="posts/create-post"
        options={{
          title: 'New Post',
          headerStyle: { backgroundColor: '#0F0F0F' },
          headerTintColor: '#F2F2F2',
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="program/[id]"
        options={{
          title: '',
          headerStyle: { backgroundColor: '#0F0F0F' },
          headerTintColor: '#F2F2F2',
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="program/session"
        options={{
          title: 'Session',
          headerStyle: { backgroundColor: '#0F0F0F' },
          headerTintColor: '#F2F2F2',
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
});
