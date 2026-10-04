import { ApiError } from "@/src/api/api-error";
import {
  createClientMessageId,
  useGetOffer,
  useOfferMessages,
  useSendOfferMessage,
} from "@/src/api/hooks/use-offer";
import { useUserById } from "@/src/api/hooks/use-user";
import { useAuth } from "@/src/auth/use-auth";
import EmptyState from "@/src/components/states/empty-state";
import ErrorState from "@/src/components/states/error-state";
import LoadingState from "@/src/components/states/loading-state";
import { formatDate } from "@/src/lib";
import { colors, rounded, spacing } from "@/src/theme";
import { OfferMessage, OfferStatus } from "@/src/types";
import { useHeaderHeight } from "@react-navigation/elements";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Send } from "lucide-react-native";
import React, { useLayoutEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WRITABLE_STATUSES: OfferStatus[] = [
  "RESERVED",
  "PENDING_CONFIRMATION",
  "COMPLAINT",
];

interface OfferChatScreenProps {
  offerId: number;
}

export default function OfferChatScreen({ offerId }: OfferChatScreenProps) {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [draft, setDraft] = useState("");

  const offerQuery = useGetOffer(offerId);
  const offer = offerQuery.data;
  const counterpartyId =
    user && offer
      ? user.userId === offer.creatorId
        ? offer.collectorId
        : offer.creatorId
      : null;
  const counterpartyQuery = useUserById(counterpartyId ?? 0);
  const sendMessage = useSendOfferMessage(offerId, user?.userId ?? 0);
  const messagesQuery = useOfferMessages(
    offerId,
    isFocused && !sendMessage.isPending,
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: counterpartyQuery.data?.firstName || "Czat",
    });
  }, [counterpartyQuery.data?.firstName, navigation]);

  const messages = useMemo(
    () => mergeMessages(messagesQuery.data ?? []),
    [messagesQuery.data],
  );
  const listData = useMemo(() => [...messages].reverse(), [messages]);

  if (!Number.isFinite(offerId) || offerId <= 0) {
    return (
      <ErrorState
        title="Nie udało się otworzyć czatu"
        message="Brak identyfikatora oferty."
        onRetry={() => offerQuery.refetch()}
      />
    );
  }

  if (offerQuery.isLoading) {
    return <LoadingState title="Ładowanie czatu" />;
  }

  if (offerQuery.isError || !offer) {
    return (
      <ErrorState
        title="Nie udało się otworzyć czatu"
        message={offerQuery.error?.message || "Spróbuj ponownie."}
        onRetry={() => offerQuery.refetch()}
      />
    );
  }

  const canSend = WRITABLE_STATUSES.includes(offer.status);
  const trimmedDraft = draft.trim();

  const handleSend = () => {
    if (!canSend || !trimmedDraft || sendMessage.isPending) return;
    const clientMessageId = createClientMessageId();
    sendMessage.mutate(
      { body: trimmedDraft, clientMessageId },
      {
        onSuccess: () => setDraft(""),
        onError: (error) => {
          const message =
            error instanceof ApiError && error.errorCode === "OFFER_008"
              ? "Nie można już wysłać wiadomości w tej ofercie."
              : error instanceof ApiError
                ? error.userMessage
                : "Spróbuj ponownie.";
          if (error instanceof ApiError && error.errorCode === "OFFER_008") {
            offerQuery.refetch();
          }
          Alert.alert("Nie udało się wysłać", message);
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <View style={styles.thread}>
      {messagesQuery.isLoading ? (
        <LoadingState title="Ładowanie wiadomości" />
      ) : messagesQuery.isError && !messagesQuery.data ? (
        <ErrorState
          title="Nie udało się załadować wiadomości"
          message={messagesQuery.error?.message || "Spróbuj ponownie."}
          onRetry={() => messagesQuery.refetch()}
        />
      ) : messages.length === 0 ? (
        <EmptyState title="Napisz pierwszą wiadomość" />
      ) : (
        <FlatList
          inverted
          data={listData}
          keyExtractor={(item) =>
            item.clientMessageId ?? String(item.messageId)
          }
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              mine={item.senderId === user?.userId}
            />
          )}
        />
      )}
      </View>

      {canSend ? (
        <View
          style={[
            styles.composer,
            { paddingBottom: Math.max(insets.bottom, spacing.sm) },
          ]}
        >
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Napisz wiadomość"
            placeholderTextColor={colors.text.muted}
            multiline
            maxLength={1000}
            editable={!sendMessage.isPending}
          />
          <Pressable
            onPress={handleSend}
            disabled={!trimmedDraft || sendMessage.isPending}
            style={({ pressed }) => [
              styles.sendButton,
              (!trimmedDraft || sendMessage.isPending) && styles.sendDisabled,
              pressed && trimmedDraft && styles.sendPressed,
            ]}
          >
            <Send size={18} color={colors.text.white} />
          </Pressable>
        </View>
      ) : (
        <Text
          style={[
            styles.closedHint,
            { paddingBottom: Math.max(insets.bottom, spacing.md) },
          ]}
        >
          Czat jest zamknięty. Historia wiadomości zostaje.
        </Text>
      )}
    </KeyboardAvoidingView>
  );
}

function mergeMessages(messages: OfferMessage[]): OfferMessage[] {
  const byKey = new Map<string, OfferMessage>();
  for (const message of messages) {
    const key = message.clientMessageId ?? `id:${message.messageId}`;
    const current = byKey.get(key);
    if (!current || (current.messageId < 0 && message.messageId > 0)) {
      byKey.set(key, message);
    }
  }
  return [...byKey.values()].sort((left, right) => {
    const leftPending = left.messageId < 0;
    const rightPending = right.messageId < 0;
    if (leftPending !== rightPending) return leftPending ? 1 : -1;
    return left.messageId - right.messageId;
  });
}

function MessageBubble({
  message,
  mine,
}: {
  message: OfferMessage;
  mine: boolean;
}) {
  return (
    <View style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.body, mine && styles.bodyMine]}>{message.body}</Text>
        <Text style={[styles.time, mine && styles.timeMine]}>
          {formatDate(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  thread: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  bubbleRow: {
    flexDirection: "row",
  },
  bubbleRowMine: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: rounded.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 4,
  },
  bubbleMine: {
    backgroundColor: colors.primary.base,
  },
  bubbleTheirs: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.status.border,
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.text.primary,
  },
  bodyMine: {
    color: colors.text.white,
  },
  time: {
    fontSize: 11,
    color: colors.text.muted,
  },
  timeMine: {
    color: colors.primary.light,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.status.border,
    backgroundColor: colors.background.card,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderRadius: rounded.lg,
    backgroundColor: colors.background.main,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text.primary,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: rounded.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary.base,
  },
  sendPressed: {
    backgroundColor: colors.primary.dark,
  },
  sendDisabled: {
    backgroundColor: colors.background.disabled,
  },
  closedHint: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    textAlign: "center",
    fontSize: 13,
    color: colors.text.secondary,
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.status.border,
  },
});
