import * as Haptics from "expo-haptics";
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, spacing } from "@/src/theme";

const LABEL = "Udostępnij numer osobie odbierającej";
const HELPER = "Zobaczy go dopiero po Twojej rezerwacji.";

type Props = {
  value: boolean;
  onValueChange: (next: boolean) => void;
  style?: StyleProp<ViewStyle>;
};

export function SharePhoneToggle({ value, onValueChange, style }: Props) {
  const toggle = () => {
    Haptics.selectionAsync();
    onValueChange(!value);
  };

  return (
    <Pressable
      onPress={toggle}
      style={[styles.card, style]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={LABEL}
      accessibilityHint={HELPER}
    >
      <View style={styles.copy}>
        <Text style={styles.label}>{LABEL}</Text>
        <Text style={styles.helper}>{HELPER}</Text>
      </View>
      <View pointerEvents="none">
        <Switch
          value={value}
          trackColor={{
            false: colors.status.border,
            true: colors.primary.base,
          }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={colors.status.border}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 44,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.background.card,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.status.border,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
  helper: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.text.secondary,
  },
});
