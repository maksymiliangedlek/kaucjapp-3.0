import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import ActionConfirmationLayout from "@/src/components/standalone-screens/confirmation/confirmation-layout";
import ErrorState from "@/src/components/states/error-state";
import ConfirmationWithReview from "@/src/components/standalone-screens/confirmation/confirmation-with-review";

interface BookingConfirmationScreenProps {
  dismissTo: "/profile/bookings" | "/home";
}

export default function BookingConfirmationScreen({
  dismissTo,
}: BookingConfirmationScreenProps) {
  const { type, userId, offerId } = useLocalSearchParams<{
    type: "success" | "cancel";
    userId?: string;
    offerId?: string;
  }>();

  if (type === "success") {
    if (
      !userId ||
      !Number.isFinite(Number(userId)) ||
      !offerId ||
      !Number.isFinite(Number(offerId))
    ) {
      return (
        <ErrorState
          title="Wystąpił błąd"
          message="Nie udało się załadować danych."
          onRetry={() => router.back()}
        />
      );
    }
    return (
      <ConfirmationWithReview
        offerId={Number(offerId)}
        userId={Number(userId)}
        onSuccess={() => router.dismissTo(dismissTo)}
      />
    );
  }

  return (
    <ActionConfirmationLayout
      title={"Anulowano!"}
      description={"Twoja rezerwacja została pomyślnie anulowana."}
      buttonText={"Rozumiem!"}
      onButtonPress={() => router.dismissTo(dismissTo)}
    />
  );
}
