import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Bell } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { colors, spacing } from "@/src/theme";
import { AppRole } from "@/src/types/user";
import CircleChromeButton from "@/src/components/ui/circle-chrome-button";

interface StartHeaderProps {
  firstName: string;
  appRole: AppRole | null | undefined;
  unreadCount?: number;
}

function subtitleFor(appRole: AppRole | null | undefined): string {
  if (appRole === "OFFERER") return "Wystawiasz opakowania";
  if (appRole === "COLLECTOR") return "Odbierasz opakowania";
  return "Wystawiasz i odbierasz";
}

export default function StartHeader({
  firstName,
  appRole,
  unreadCount = 0,
}: StartHeaderProps) {
  const router = useRouter();
  const showBadge = unreadCount > 0;

  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text
          style={styles.greeting}
          accessibilityRole="header"
        >{`Siema, ${firstName || "tam"}`}</Text>
        <Text style={styles.subtitle}>{subtitleFor(appRole)}</Text>
      </View>

      <View style={styles.bellWrap}>
        <CircleChromeButton
          accessibilityLabel={
            showBadge
              ? `Powiadomienia, ${unreadCount} nieprzeczytane`
              : "Powiadomienia"
          }
          onPress={() => {
            Haptics.selectionAsync();
            router.push("/(app)/(tabs)/start/notifications");
          }}
        >
          <Bell size={22} color={colors.text.primary} />
        </CircleChromeButton>
        {showBadge ? (
          <View style={styles.badge} pointerEvents="none">
            <Text style={styles.badgeText}>
              {unreadCount > 9 ? "9+" : String(unreadCount)}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
  },
  bellWrap: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary.base,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    zIndex: 1,
  },
  badgeText: {
    color: colors.text.white,
    fontSize: 10,
    fontWeight: "800",
  },
});
