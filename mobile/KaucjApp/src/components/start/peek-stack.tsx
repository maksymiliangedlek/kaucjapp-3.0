import React, { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { colors, spacing } from "@/src/theme";

/** Stack (1 full + blurred peek) when item count is greater than this. */
export const PEEK_THRESHOLD = 1;

interface PeekStackProps {
  title: string;
  count: number;
  /** Up to 2 preview nodes when stacked; all nodes when not stacked. */
  children: ReactNode;
  onOpenList: () => void;
  accessibilityLabel: string;
}

/**
 * When count > 1: shows 1 full card + a blurred peek of the 2nd; tap opens list.
 * When count ≤ 1: plain list (no peek chrome).
 */
export default function PeekStack({
  title,
  count,
  children,
  onOpenList,
  accessibilityLabel,
}: PeekStackProps) {
  const stacked = count > PEEK_THRESHOLD;
  const nodes = React.Children.toArray(children);

  if (!stacked) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.list}>{nodes}</View>
      </View>
    );
  }

  const visible = nodes.slice(0, 2);

  const open = () => {
    Haptics.selectionAsync();
    onOpenList();
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={open}
        style={styles.headerRow}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.countHint}>{count}</Text>
          <ChevronRight size={18} color={colors.text.muted} />
        </View>
      </Pressable>

      <Pressable
        onPress={open}
        style={styles.stackPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <View style={styles.stackClip}>
          <View style={styles.list}>
            {visible[0]}
            <View style={styles.peekSlot} pointerEvents="none">
              {visible[1]}
            </View>
          </View>
          <BlurView intensity={5} tint="light" style={styles.blurBand} />
          <View style={styles.fadeTop} pointerEvents="none" />
          <View style={styles.fadeMid} pointerEvents="none" />
          <View style={styles.fadeBottom} pointerEvents="none" />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    gap: spacing.sm,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  countHint: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.muted,
  },
  list: {
    gap: spacing.sm,
  },
  stackPress: {
    borderRadius: 20,
  },
  stackClip: {
    overflow: "hidden",
    position: "relative",
    // Clip so only a strip of the 2nd card peeks (preview cards, no CTAs)
    maxHeight: 200,
  },
  peekSlot: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }, { translateY: -8 }],
  },
  blurBand: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 56,
  },
  fadeTop: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 40,
    height: 28,
    backgroundColor: "rgba(246,247,244,0.12)",
  },
  fadeMid: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 16,
    height: 28,
    backgroundColor: "rgba(246,247,244,0.28)",
  },
  fadeBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 20,
    backgroundColor: "rgba(246,247,244,0.72)",
  },
});
