import { Link, router } from "expo-router";
import { useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Screen } from "@/src/components/ui/screen";
import { useAuthStore } from "@/src/stores/auth-store";

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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
    const normalized = identifier.trim();
    const success = await authenticate("login", {
      email: normalized.includes("@") ? normalized : "",
      username: normalized.includes("@") ? undefined : normalized,
      password,
    });

    if (success) {
      router.replace("/(app)/(tabs)");
    }
  }

  return (
    <Screen scroll scrollRef={scrollRef}>
      <View className="py-8">
        <View className="items-center px-4 pb-7 pt-3">
          <View className="h-[88px] w-[88px] items-center justify-center rounded-[28px] bg-paper shadow-card">
            <Image
              source={require("@/assets/images/icon.png")}
              style={{ height: 60, width: 60, borderRadius: 16 }}
              contentFit="contain"
            />
          </View>
          <Text className="mt-5 text-[11px] font-semibold uppercase tracking-[3px] text-brand">
            HouseofEdTech
          </Text>
          <Text className="mt-3 text-center text-[28px] font-semibold tracking-[-0.6px] leading-[32px] text-ink">
            Welcome Back
          </Text>
          <Text className="mt-3 max-w-[290px] text-center text-base leading-7 text-muted">
            Continue your learning journey.
          </Text>
        </View>

        <View className="gap-5 rounded-[32px] border border-line bg-paper p-6 shadow-card">
          <View className="gap-2">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-accent">
              Sign In
            </Text>
          </View>
          <Input
            label="Username or Email"
            placeholder="Enter username or email"
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            autoCorrect={false}
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
          <Text className="pt-1 text-center text-sm text-muted">
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
