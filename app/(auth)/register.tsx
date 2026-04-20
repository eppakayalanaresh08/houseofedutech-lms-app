import { Link, router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Screen } from '@/src/components/ui/screen';
import { useAuthStore } from '@/src/stores/auth-store';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const authenticate = useAuthStore((state) => state.authenticate);
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);

  function scrollFormIntoView(offset: number) {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: offset, animated: true });
    }, 250);
  }

  async function handleRegister() {
    const success = await authenticate('register', { username, email, password });

    if (success) {
      router.replace('/(auth)/login');
    }
  }

  return (
    <Screen scroll scrollRef={scrollRef}>
      <View className="py-8">
        <View className="items-center px-4 pb-7 pt-3">
          <View className="h-[88px] w-[88px] items-center justify-center rounded-[28px] bg-paper shadow-card">
            <Image
              source={require('@/assets/images/icon.png')}
              style={{ height: 60, width: 60, borderRadius: 16 }}
              contentFit="contain"
            />
          </View>
          <Text className="mt-5 text-[11px] font-semibold uppercase tracking-[3px] text-brand">
            HouseofEdTech
          </Text>
          <Text className="mt-3 text-center text-[30px] font-semibold leading-9 text-ink">
            Create account
          </Text>
          <Text className="mt-3 max-w-[300px] text-center text-base leading-7 text-muted">
            Create your account to get started.
          </Text>
        </View>

        <View className="gap-5 rounded-[32px] border border-line bg-paper p-6 shadow-card">
          <View className="gap-2">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-accent">
              Register
            </Text>
          </View>
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
            onFocus={() => scrollFormIntoView(200)}
          />
          <Input
            label="Password"
            placeholder="Create password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => scrollFormIntoView(280)}
          />
          {error ? <Text className="text-sm text-danger">{error}</Text> : null}
          <Button
            label={status === 'loading' ? 'Creating account...' : 'Create Account'}
            onPress={handleRegister}
            disabled={status === 'loading'}
          />
          <Text className="pt-1 text-center text-sm text-muted">
            Already registered? <Link href="/(auth)/login" className="text-brand">Sign in</Link>
          </Text>
        </View>
      </View>
    </Screen>
  );
}
