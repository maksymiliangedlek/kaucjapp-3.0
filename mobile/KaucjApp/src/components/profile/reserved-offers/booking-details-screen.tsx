import React from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";

import { useGetOffer } from "@/src/api/hooks/use-offer";
import EmptyState from "@/src/components/states/empty-state";
import ErrorState from "@/src/components/states/error-state";
import LoadingState from "@/src/components/states/loading-state";
import { colors, spacing } from "@/src/theme";

import BookingDetailsContent from "./booking-details-content";

interface BookingDetailsScreenProps {
  offerId: number;
}

export default function BookingDetailsScreen({
  offerId,
}: BookingDetailsScreenProps) {
  const {
    data: offer,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useGetOffer(offerId);

  if (isLoading) {
    return <LoadingState title="Ładowanie rezerwacji" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Nie udało się załadować rezerwacji"
        message={error?.message || "Spróbuj ponownie."}
        onRetry={refetch}
      />
    );
  }

  if (!offer) {
    return (
      <EmptyState
        title="Ta rezerwacja jest już niedostępna."
        onRefresh={refetch}
      />
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary.base}
          colors={[colors.primary.base]}
          progressBackgroundColor={colors.background.main}
          progressViewOffset={10}
        />
      }
    >
      <BookingDetailsContent offer={offer} basePath="/profile/bookings" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
});
