import { Link, router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Screen } from '@/src/components/ui/screen';
import { SectionHeading } from '@/src/components/ui/section-heading';
import { useAuthStore } from '@/src/stores/auth-store';

export default function RegisterScreen() {
  const [username, setUsername] = useState('averystudent');
  const [email, setEmail] = useState('learner@houseofedtech.dev');
  const [password, setPassword] = useState('Password123');
  const scrollRef = useRef<ScrollView>(null);
  const authenticate = useAuthStore((state) => state.authenticate);
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);

  function scrollFormIntoView(offset = 220) {
    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: offset, animated: true });
      }, 120);
    });
  }

  async function handleRegister() {
    const success = await authenticate('register', { username, email, password });

    if (success) {
      router.replace('/(auth)/login');
    }
  }

  return (
    <Screen scroll scrollRef={scrollRef}>
      <View className="gap-6 py-10">
        <SectionHeading
          eyebrow="New account"
          title="Create your learner profile"
          subtitle="Set up your HouseofEdTech account to access courses, progress, and your learning dashboard."
        />
        <View className="gap-5 rounded-[28px] border border-line bg-paper p-5">
          <Input
            label="Username"
            placeholder="Choose a username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => scrollFormIntoView(120)}
          />
          <Input
            label="Email"
            placeholder="Enter email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            onFocus={() => scrollFormIntoView(190)}
          />
          <Input
            label="Password"
            placeholder="Create password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => scrollFormIntoView(260)}
          />
          {error ? <Text className="text-sm text-danger">{error}</Text> : null}
          <Button
            label={status === 'loading' ? 'Creating account...' : 'Create Account'}
            onPress={handleRegister}
            disabled={status === 'loading'}
          />
          <Text className="text-center text-sm text-muted">
            Already registered? <Link href="/(auth)/login" className="text-brand">Sign in</Link>
          </Text>
        </View>
      </View>
    </Screen>
  );
}
