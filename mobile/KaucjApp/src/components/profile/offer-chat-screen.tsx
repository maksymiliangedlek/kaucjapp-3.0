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
import { colors, rounded, spacing } from "@/src/theme";
import { OfferMessage, OfferStatus } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Reply, Send, X } from "lucide-react-native";
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WRITABLE_STATUSES: OfferStatus[] = [
  "RESERVED",
  "PENDING_CONFIRMATION",
  "COMPLAINT",
];
// Native tab bar height above the home indicator. iOS 26+ renders a taller,
// floating bar than earlier iOS versions.
const TAB_BAR_CONTENT_HEIGHT =
  Platform.OS === "ios"
    ? parseInt(String(Platform.Version), 10) >= 26
      ? 72
      : 49
    : 80;
const REPLY_THRESHOLD = 56;
const REPLY_SPRING = { damping: 30, stiffness: 420, overshootClamping: true };

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
  const [replyTo, setReplyTo] = useState<OfferMessage | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const offerQuery = useGetOffer(offerId);
  const offer = offerQuery.data;
  const counterpartyId =
    user && offer
      ? user.userId === offer.creatorId
        ? offer.collectorId
        : offer.creatorId
      : null;
  const counterpartyQuery = useUserById(counterpartyId ?? 0);
  const counterparty = counterpartyQuery.data;
  const sendMessage = useSendOfferMessage(offerId, user?.userId ?? 0);
  const messagesQuery = useOfferMessages(
    offerId,
    isFocused && !sendMessage.isPending,
  );

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const peerImageUrl = counterparty?.profilePictureUrl;
  const peerName = counterparty?.firstName || "Czat";
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerShadowVisible: false,
      headerTitle: () => (
        <ChatPeerTitle imageUrl={peerImageUrl} name={peerName} />
      ),
    });
  }, [navigation, peerImageUrl, peerName]);

  const messages = useMemo(
    () => mergeMessages(messagesQuery.data ?? []),
    [messagesQuery.data],
  );
  const listData = useMemo(() => [...messages].reverse(), [messages]);

  const bottomPad = keyboardVisible
    ? spacing.sm
    : insets.bottom + TAB_BAR_CONTENT_HEIGHT;

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
    const pendingReply = replyTo;
    sendMessage.mutate(
      {
        body: trimmedDraft,
        clientMessageId,
        replyToMessageId:
          pendingReply && pendingReply.messageId > 0
            ? pendingReply.messageId
            : undefined,
        replyTo: pendingReply
          ? {
              messageId: pendingReply.messageId,
              senderId: pendingReply.senderId,
              body: pendingReply.body,
            }
          : null,
      },
      {
        onSuccess: () => {
          setDraft("");
          setReplyTo(null);
        },
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
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: headerHeight + spacing.sm },
            ]}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item, index }) => {
              const older = listData[index + 1];
              const showDay = !older || !isSameDay(older.createdAt, item.createdAt);
              return (
                <View style={styles.messageCell}>
                  <MessageBubble
                    message={item}
                    mine={item.senderId === user?.userId}
                    enabled={canSend}
                    onReply={() => setReplyTo(item)}
                  />
                  {/* Inverted list: the last child renders above the bubble. */}
                  {showDay ? (
                    <Text style={styles.dayLabel}>
                      {formatDayLabel(item.createdAt)}
                    </Text>
                  ) : null}
                </View>
              );
            }}
          />
        )}
        <View
          pointerEvents="none"
          style={[styles.headerFade, { height: headerHeight + spacing.lg }]}
        >
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="headerFade" x1="0" y1="0" x2="0" y2="1">
                <Stop
                  offset="0"
                  stopColor={colors.background.main}
                  stopOpacity="1"
                />
                <Stop
                  offset="0.55"
                  stopColor={colors.background.main}
                  stopOpacity="0.85"
                />
                <Stop
                  offset="1"
                  stopColor={colors.background.main}
                  stopOpacity="0"
                />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#headerFade)" />
          </Svg>
        </View>
      </View>

      {canSend ? (
        <View style={[styles.composerBlock, { paddingBottom: bottomPad }]}>
          {replyTo ? (
            <View style={styles.replyPreview}>
              <View style={styles.replyPreviewAccent} />
              <View style={styles.replyPreviewBody}>
                <Text style={styles.replyPreviewLabel}>Odpowiedź</Text>
                <Text style={styles.replyPreviewText} numberOfLines={2}>
                  {replyTo.body}
                </Text>
              </View>
              <Pressable
                onPress={() => setReplyTo(null)}
                hitSlop={8}
                style={styles.replyPreviewClose}
              >
                <X size={16} color={colors.text.secondary} />
              </Pressable>
            </View>
          ) : null}
          <View style={styles.composerRow}>
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
        </View>
      ) : (
        <Text style={[styles.closedHint, { paddingBottom: bottomPad }]}>
          Czat jest zamknięty. Historia wiadomości zostaje.
        </Text>
      )}
    </KeyboardAvoidingView>
  );
}

function ChatPeerTitle({
  imageUrl,
  name,
}: {
  imageUrl?: string | null;
  name: string;
}) {
  return (
    <View style={styles.peerTitle}>
      <View style={styles.peerAvatar}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.peerAvatarImage} />
        ) : (
          <View style={styles.peerAvatarPlaceholder}>
            <Ionicons name="person" size={16} color={colors.primary.base} />
          </View>
        )}
      </View>
      <Text style={styles.peerName} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

function isSameDay(left: string, right: string) {
  return new Date(left).toDateString() === new Date(right).toDateString();
}

function formatDayLabel(value: string) {
  const date = new Date(value);
  const now = new Date();
  if (isSameDay(value, now.toISOString())) return "Dziś";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(value, yesterday.toISOString())) return "Wczoraj";
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    ...(date.getFullYear() !== now.getFullYear() && { year: "numeric" }),
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mergeMessages(messages: OfferMessage[]): OfferMessage[] {
  const byKey = new Map<string, OfferMessage>();
  for (const message of messages) {
    const key = message.clientMessageId ?? `id:${message.messageId}`;
    const current = byKey.get(key);
    if (!current || (current.messageId < 0 && message.messageId > 0)) {
      byKey.set(key, {
        ...message,
        replyTo: message.replyTo ?? null,
      });
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
  enabled,
  onReply,
}: {
  message: OfferMessage;
  mine: boolean;
  enabled: boolean;
  onReply: () => void;
}) {
  const translateX = useSharedValue(0);
  const direction = mine ? -1 : 1;

  const pan = Gesture.Pan()
    .enabled(enabled)
    .activeOffsetX(mine ? [-12, 999] : [-999, 12])
    .failOffsetY([-10, 10])
    .onUpdate((event) => {
      const projected = event.translationX * direction;
      const resisted =
        projected > 0
          ? Math.min(projected, REPLY_THRESHOLD * 1.35)
          : projected * 0.2;
      translateX.value = resisted * direction;
    })
    .onEnd(() => {
      const distance = Math.abs(translateX.value);
      if (distance >= REPLY_THRESHOLD) {
        runOnJS(onReply)();
      }
      translateX.value = withSpring(0, REPLY_SPRING);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  const hintStyle = useAnimatedStyle(() => ({
    opacity: Math.min(Math.abs(translateX.value) / REPLY_THRESHOLD, 1),
  }));

  return (
    <View style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
      <Animated.View
        style={[
          styles.replyHint,
          mine ? styles.replyHintRight : styles.replyHintLeft,
          hintStyle,
        ]}
        pointerEvents="none"
      >
        <Reply
          size={16}
          color={mine ? colors.primary.base : colors.accent.base}
        />
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.bubbleWrap, animatedStyle]}>
          <View
            style={[
              styles.bubble,
              mine ? styles.bubbleMine : styles.bubbleTheirs,
            ]}
          >
            {message.replyTo ? (
              <View
                style={[
                  styles.inlineReply,
                  mine ? styles.inlineReplyMine : styles.inlineReplyTheirs,
                ]}
              >
                <Reply
                  size={12}
                  color={mine ? colors.primary.light : colors.accent.base}
                />
                <Text
                  style={[
                    styles.inlineReplyText,
                    mine && styles.inlineReplyTextMine,
                  ]}
                  numberOfLines={2}
                >
                  {message.replyTo.body}
                </Text>
              </View>
            ) : null}
            <Text style={[styles.body, mine && styles.bodyMine]}>
              {message.body}
            </Text>
          </View>
          <Text style={[styles.time, mine && styles.timeMine]}>
            {formatTime(message.createdAt)}
          </Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  peerTitle: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  peerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.primary.base + "55",
    backgroundColor: colors.primary.light,
  },
  peerAvatarImage: {
    width: "100%",
    height: "100%",
  },
  peerAvatarPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  peerName: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.primary,
  },
  thread: {
    flex: 1,
  },
  headerFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  bubbleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bubbleRowMine: {
    justifyContent: "flex-end",
  },
  replyHint: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  replyHintLeft: {
    left: 0,
  },
  replyHintRight: {
    right: 0,
  },
  bubbleWrap: {
    maxWidth: "88%",
    gap: 2,
  },
  messageCell: {
    gap: spacing.sm,
  },
  dayLabel: {
    alignSelf: "center",
    fontSize: 12,
    fontWeight: "500",
    color: colors.text.muted,
    marginVertical: spacing.xs,
  },
  bubble: {
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
  inlineReply: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    borderRadius: rounded.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginBottom: 2,
  },
  inlineReplyMine: {
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  inlineReplyTheirs: {
    backgroundColor: colors.accent.light,
  },
  inlineReplyText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: colors.text.secondary,
  },
  inlineReplyTextMine: {
    color: colors.primary.light,
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
    paddingHorizontal: spacing.xs,
  },
  timeMine: {
    alignSelf: "flex-end",
  },
  composerBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.status.border,
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  replyPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.background.main,
    borderRadius: rounded.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  replyPreviewAccent: {
    width: 3,
    alignSelf: "stretch",
    borderRadius: 2,
    backgroundColor: colors.primary.base,
  },
  replyPreviewBody: {
    flex: 1,
    gap: 2,
  },
  replyPreviewLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary.base,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  replyPreviewText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  replyPreviewClose: {
    padding: 4,
  },
  composerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
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
