import React from "react";
import { StyleSheet, View } from "react-native";
import { HeaderBackButton } from "@react-navigation/elements";
import { ChevronLeft } from "lucide-react-native";
import { colors } from "@/src/theme";

/** Same liquid-glass chevron as StackHeaderBack, with a custom onPress. */
export default function StackHeaderBackButton({
  onPress,
}: {
  onPress: () => void;
}) {
  return (
    <HeaderBackButton
      tintColor={colors.text.primary}
      displayMode="minimal"
      onPress={onPress}
      backImage={({ tintColor }) => (
        <View style={styles.iconWrap}>
          <ChevronLeft
            size={28}
            color={tintColor ?? colors.text.primary}
            strokeWidth={2.25}
            style={styles.chevron}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  chevron: {
    marginLeft: -1,
  },
});
