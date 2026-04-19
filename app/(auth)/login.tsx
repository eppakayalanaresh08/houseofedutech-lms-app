import { Link, router } from "expo-router";
import { useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Screen } from "@/src/components/ui/screen";
import { SectionHeading } from "@/src/components/ui/section-heading";
import { useAuthStore } from "@/src/stores/auth-store";

export default function LoginScreen() {
  const [email, setEmail] = useState("avery@houseofedtech.dev");
  const [password, setPassword] = useState("Password123");
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

  async function handleLogin() {
    const success = await authenticate("login", { email, password });

    if (success) {
      router.replace("/(app)/(tabs)");
    }
  }

  return (
    <Screen scroll scrollRef={scrollRef}>
      <View className="gap-8 py-10">
        <View className="rounded-[32px] bg-brand px-6 py-8">
          <Text className="text-xs uppercase tracking-[2px] text-accentSoft">
            HouseofEdTech
          </Text>
          <Text className="mt-4 text-3xl font-semibold tracking-tight text-paper">
            Your learning space
          </Text>
          <Text className="mt-3 text-base leading-7 text-[#E8EDF5]">
            Access your courses, track progress, and stay connected with the
            HouseOfEdtech learning experience.
          </Text>
        </View>

        <View className="gap-5 rounded-[28px] border border-line bg-paper p-5">
          <SectionHeading
            eyebrow="Welcome back"
            title="Sign in to your account"
            subtitle="Continue your learning journey with a secure and seamless sign-in experience."
          />
          <Input
            label="Email"
            placeholder="Enter email"
            value={email}
            onChangeText={setEmail}
            onFocus={() => scrollFormIntoView(160)}
          />
          <Input
            label="Password"
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => scrollFormIntoView(240)}
          />
          {error ? <Text className="text-sm text-danger">{error}</Text> : null}
          <Button
            label={status === "loading" ? "Signing in..." : "Sign In"}
            onPress={handleLogin}
            disabled={status === "loading"}
          />
          <Text className="text-center text-sm text-muted">
            New here?{" "}
            <Link href="/(auth)/register" className="text-brand">
              Create an account
            </Link>
          </Text>
        </View>
      </View>
    </Screen>
  );
}
