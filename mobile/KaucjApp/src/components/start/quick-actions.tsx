import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Box, MapPin, Package } from "lucide-react-native";
import { AppRole } from "@/src/types/user";
import { colors, rounded, shadows, spacing } from "@/src/theme";

type ActionId = "list" | "find" | "machines";

interface QuickActionsProps {
  appRole: AppRole | null | undefined;
}

export default function QuickActions({ appRole }: QuickActionsProps) {
  const router = useRouter();

  const order = useMemo<ActionId[]>(() => {
    // OFFERER / BOTH: Wystaw first; COLLECTOR: Znajdź first. Kaucjomaty always last.
    if (appRole === "COLLECTOR") return ["find", "list", "machines"];
    return ["list", "find", "machines"];
  }, [appRole]);

  const actions: Record<
    ActionId,
    { title: string; subtitle: string; Icon: typeof Package; onPress: () => void }
  > = {
    list: {
      title: "Wystaw opakowania",
      subtitle: "Nowa oferta",
      Icon: Package,
      onPress: () => {
        Haptics.selectionAsync();
        router.push("/(app)/(tabs)/create");
      },
    },
    find: {
      title: "Znajdź opakowania",
      subtitle: "Mapa ofert",
      Icon: MapPin,
      onPress: () => {
        Haptics.selectionAsync();
        router.push("/(app)/(tabs)/home");
      },
    },
    machines: {
      title: "Kaucjomaty",
      subtitle: "Mapa punktów",
      Icon: Box,
      onPress: () => {
        Haptics.selectionAsync();
        router.push({
          pathname: "/(app)/(tabs)/home",
          params: { filter: "machines" },
        });
      },
    },
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Co chcesz zrobić?</Text>
      <View style={styles.row}>
        {order.map((id) => {
          const action = actions[id];
          return (
            <Pressable
              key={id}
              style={styles.card}
              onPress={action.onPress}
              accessibilityRole="button"
              accessibilityLabel={action.title}
            >
              <View style={styles.iconTile}>
                <action.Icon size={22} color={colors.primary.dark} />
              </View>
              <Text style={styles.title}>{action.title}</Text>
              <Text style={styles.subtitle}>{action.subtitle}</Text>
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
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  card: {
    flexGrow: 1,
    flexBasis: "45%",
    minWidth: "45%",
    backgroundColor: colors.background.card,
    borderRadius: rounded.xl,
    borderWidth: 1,
    borderColor: colors.status.border,
    padding: spacing.md,
    gap: spacing.xs,
    minHeight: 110,
    ...shadows.light,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: rounded.lg,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
});
