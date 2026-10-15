import {
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors, spacing } from "@/src/theme";

type Props = {
  children: React.ReactNode;
  contentStyle?: ViewStyle;
};

export function AuthFormWrapper({ children, contentStyle }: Props) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Animated.View
            entering={FadeInDown.duration(600).springify()}
            style={[styles.content, contentStyle]}
          >
            {children}
          </Animated.View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
