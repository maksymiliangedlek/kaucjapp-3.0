import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { CirclePlus, Recycle, Search } from "lucide-react-native";
import { AppRole } from "@/src/types/user";
import { colors, rounded, spacing } from "@/src/theme";

type ActionId = "list" | "find" | "machines";

interface QuickActionsProps {
  appRole: AppRole | null | undefined;
}

type ActionDef = {
  title: string;
  subtitle: string;
  Icon: typeof CirclePlus;
  onPress: () => void;
};

export default function QuickActions({ appRole }: QuickActionsProps) {
  const router = useRouter();

  const { primaryId, secondaryIds } = useMemo(() => {
    // Primary = role’s main job; the other two sit as compact peers below.
    if (appRole === "COLLECTOR") {
      return {
        primaryId: "find" as const,
        secondaryIds: ["list", "machines"] as ActionId[],
      };
    }
    return {
      primaryId: "list" as const,
      secondaryIds: ["find", "machines"] as ActionId[],
    };
  }, [appRole]);

  const actions: Record<ActionId, ActionDef> = {
    list: {
      title: "Wystaw opakowania",
      subtitle: "Nowa oferta",
      Icon: CirclePlus,
      onPress: () => {
        Haptics.selectionAsync();
        router.push("/(app)/(tabs)/create");
      },
    },
    find: {
      title: "Znajdź opakowania",
      subtitle: "Mapa ofert",
      Icon: Search,
      onPress: () => {
        Haptics.selectionAsync();
        router.push({
          pathname: "/(app)/(tabs)/home",
          params: { filter: "offers" },
        });
      },
    },
    machines: {
      title: "Kaucjomaty",
      subtitle: "Mapa punktów",
      Icon: Recycle,
      onPress: () => {
        Haptics.selectionAsync();
        router.push({
          pathname: "/(app)/(tabs)/home",
          params: { filter: "machines" },
        });
      },
    },
  };

  // Shorter labels on the compact secondary tiles.
  const secondaryLabel: Record<ActionId, string> = {
    list: "Wystaw",
    find: "Znajdź",
    machines: "Kaucjomaty",
  };

  const primary = actions[primaryId];

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Co chcesz zrobić?</Text>

      <Pressable
        style={({ pressed }) => [
          styles.primary,
          pressed && styles.primaryPressed,
        ]}
        onPress={primary.onPress}
        accessibilityRole="button"
        accessibilityLabel={primary.title}
      >
        <View style={styles.primaryIcon}>
          <primary.Icon size={22} color={colors.text.white} />
        </View>
        <View style={styles.primaryText}>
          <Text style={styles.primaryTitle}>{primary.title}</Text>
          <Text style={styles.primarySubtitle}>{primary.subtitle}</Text>
        </View>
      </Pressable>

      <View style={styles.secondaryRow}>
        {secondaryIds.map((id) => {
          const action = actions[id];
          return (
            <Pressable
              key={id}
              style={({ pressed }) => [
                styles.secondary,
                pressed && styles.secondaryPressed,
              ]}
              onPress={action.onPress}
              accessibilityRole="button"
              accessibilityLabel={action.title}
            >
              <View style={styles.secondaryIcon}>
                <action.Icon size={18} color={colors.primary.dark} />
              </View>
              <View style={styles.secondaryText}>
                <Text style={styles.secondaryTitle} numberOfLines={1}>
                  {secondaryLabel[id]}
                </Text>
                <Text style={styles.secondarySubtitle} numberOfLines={1}>
                  {action.subtitle}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
  },
  primary: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 56,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: rounded.xl,
    backgroundColor: colors.primary.base,
  },
  primaryPressed: {
    backgroundColor: colors.primary.dark,
  },
  primaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    flex: 1,
    gap: 1,
  },
  primaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.white,
  },
  primarySubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.82)",
  },
  secondaryRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  secondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 52,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: rounded.xl,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.status.border,
  },
  secondaryPressed: {
    backgroundColor: colors.primary.light,
  },
  secondaryIcon: {
    width: 32,
    height: 32,
    borderRadius: rounded.md,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    flex: 1,
    gap: 1,
  },
  secondaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },
  secondarySubtitle: {
    fontSize: 11,
    color: colors.text.secondary,
  },
});
