import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStartAttention } from "@/src/hooks/use-start-attention";
import { colors, spacing } from "@/src/theme";
import AttentionCard from "./attention-card";
import SectionError from "../section-error";

export default function AttentionListScreen() {
  const insets = useSafeAreaInsets();
  const { items, isLoading, isError, refetch } = useStartAttention();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading && items.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary.base} />
      </View>
    );
  }

  if (isError && items.length === 0) {
    return (
      <View style={styles.centered}>
        <SectionError
          message="Nie udało się wczytać pilnych zadań."
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary.base}
        />
      }
    >
      {items.length === 0 ? (
        <Text style={styles.empty}>Brak zadań wymagających uwagi.</Text>
      ) : (
        <View style={styles.list}>
          {items.map(({ offer, perspective }) => (
            <AttentionCard
              key={`${perspective}-${offer.offerId}`}
              offer={offer}
              perspective={perspective}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  empty: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
