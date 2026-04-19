import { Pressable, Text } from 'react-native';

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}) {
  const className =
    variant === 'primary'
      ? 'bg-brand'
      : variant === 'secondary'
        ? 'bg-accentSoft border border-line'
        : 'bg-transparent';

  const textClassName =
    variant === 'primary' ? 'text-paper' : variant === 'secondary' ? 'text-ink' : 'text-brand';

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={`items-center rounded-2xl px-4 py-4 ${className} ${disabled ? 'opacity-50' : ''}`}>
      <Text className={`text-base font-semibold ${textClassName}`}>{label}</Text>
    </Pressable>
  );
}
