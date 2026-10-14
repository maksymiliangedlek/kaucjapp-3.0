import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing } from "@/src/theme";
import { AttentionItem } from "@/src/hooks/use-start-attention";
import PeekStack, { PEEK_THRESHOLD } from "../peek-stack";
import AttentionCard from "./attention-card";
import SectionError from "../section-error";
import SectionSkeleton from "../section-skeleton";

interface AttentionSectionProps {
  items: AttentionItem[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  counterpartNames?: Record<number, string>;
}

export default function AttentionSection({
  items,
  isLoading,
  isError,
  onRetry,
  counterpartNames = {},
}: AttentionSectionProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Wymaga Twojej uwagi</Text>
        <SectionSkeleton rows={2} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Wymaga Twojej uwagi</Text>
        <SectionError
          message="Nie udało się wczytać pilnych zadań."
          onRetry={onRetry}
        />
      </View>
    );
  }

  if (items.length === 0) return null;

  const stacked = items.length > PEEK_THRESHOLD;
  const shown = stacked ? items.slice(0, 3) : items;

  return (
    <PeekStack
      title="Wymaga Twojej uwagi"
      count={items.length}
      onOpenList={() => router.push("/(app)/(tabs)/start/attention")}
      accessibilityLabel={`Wymaga Twojej uwagi, ${items.length} zadań`}
    >
      {shown.map(({ offer, perspective }) => (
        <AttentionCard
          key={`${perspective}-${offer.offerId}`}
          offer={offer}
          perspective={perspective}
          counterpartName={
            offer.collectorId
              ? counterpartNames[offer.collectorId]
              : undefined
          }
          preview={stacked}
        />
      ))}
    </PeekStack>
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
  },
});
