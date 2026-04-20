import { Platform, Text, View } from "react-native";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View className="gap-1">
      {eyebrow ? (
        <Text className="text-xs uppercase tracking-[2px] text-accent">
          {eyebrow}
        </Text>
      ) : null}
      <Text
        className="text-3xl text-ink"
        style={{
          fontFamily: Platform.select({
            ios: "Georgia",
            android: "serif",
            default: "serif",
          }),
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-sm leading-6 text-muted">{subtitle}</Text>
      ) : null}
    </View>
  );
}
