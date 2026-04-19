import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native';

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  onFocus,
  ...textInputProps
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
} & TextInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isSecureField = Boolean(secureTextEntry);

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-muted">{label}</Text>
      <View className="relative">
        <TextInput
          value={value}
          placeholder={placeholder}
          onChangeText={onChangeText}
          onFocus={onFocus}
          secureTextEntry={isSecureField && !isPasswordVisible}
          placeholderTextColor="#8C8F94"
          className="rounded-2xl border border-line bg-paper px-4 py-4 pr-14 text-base text-ink"
          {...textInputProps}
        />
        {isSecureField ? (
          <Pressable
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
            onPress={() => setIsPasswordVisible((current) => !current)}
            className="absolute inset-y-0 right-0 items-center justify-center px-4"
          >
            <Feather
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={18}
              color="#325779"
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
