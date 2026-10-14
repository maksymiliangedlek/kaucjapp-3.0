import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Bell,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Package,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  InboxNotification,
  useMarkNotificationRead,
  useNotificationInbox,
} from "@/src/api/hooks/use-notifications";
import { timeAgoInPolish } from "@/src/lib";
import { colors, rounded, spacing } from "@/src/theme";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, isLoading, isError, refetch, isFetching } =
    useNotificationInbox();
  const markRead = useMarkNotificationRead();

  const openItem = (item: InboxNotification) => {
    Haptics.selectionAsync();
    if (!item.readAt) {
      markRead.mutate(item.id);
    }
    const { type, offerId, role } = item.data ?? {};
    const resolvedType = type ?? item.type;
    if (resolvedType === "USER_REVIEW") {
      router.push("/profile");
      return;
    }
    if (!offerId) return;
    const isCreator = role === "CREATOR";
    if (resolvedType === "OFFER_MESSAGE") {
      router.push({
        pathname: isCreator
          ? "/start/offers/chat"
          : "/start/bookings/chat",
        params: { offerId },
      });
      return;
    }
    router.push({
      pathname: isCreator
        ? "/start/offers/[id]"
        : "/start/bookings/[id]",
      params: { id: offerId },
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top + 56 }]}>
        <ActivityIndicator color={colors.primary.base} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.center, { paddingTop: insets.top + 56 }]}>
        <Text style={styles.emptyTitle}>Nie udało się wczytać</Text>
        <Pressable onPress={() => refetch()} style={styles.retry}>
          <Text style={styles.retryText}>Spróbuj ponownie</Text>
        </Pressable>
      </View>
    );
  }

  const items = data ?? [];

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        paddingTop: insets.top + 56,
        paddingHorizontal: spacing.md,
        paddingBottom: insets.bottom + spacing.lg,
        gap: spacing.sm,
        flexGrow: 1,
      }}
      refreshing={isFetching && !isLoading}
      onRefresh={() => refetch()}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Bell size={32} color={colors.text.muted} />
          <Text style={styles.emptyTitle}>Brak powiadomień</Text>
          <Text style={styles.emptyBody}>
            Gdy coś się wydarzy przy Twoich ofertach, zobaczysz to tutaj.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <NotificationRow
          item={item}
          onPress={() => openItem(item)}
        />
      )}
    />
  );
}

function NotificationRow({
  item,
  onPress,
}: {
  item: InboxNotification;
  onPress: () => void;
}) {
  const unread = !item.readAt;
  const Icon = iconForType(item.type);
  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}. ${item.body}. ${timeAgoInPolish(item.createdAt)}${unread ? ". Nieprzeczytane" : ""}`}
    >
      <View style={styles.iconTile}>
        <Icon size={20} color={colors.primary.dark} />
      </View>
      <View style={styles.content}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowBody} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={styles.time}>{timeAgoInPolish(item.createdAt)}</Text>
      </View>
      {unread ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

function iconForType(type: string) {
  switch (type) {
    case "OFFER_MESSAGE":
      return MessageCircle;
    case "OFFER_CONFIRMED":
    case "OFFER_COMPLETED":
      return CheckCircle2;
    case "OFFER_RESERVED":
      return Package;
    default:
      return MapPin;
  }
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.background.main,
  },
  empty: {
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
  },
  emptyBody: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
  },
  retry: {
    minHeight: 44,
    justifyContent: "center",
  },
  retryText: {
    color: colors.primary.base,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.background.card,
    borderRadius: rounded.xl,
    borderWidth: 1,
    borderColor: colors.status.border,
    padding: spacing.md,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
  },
  rowBody: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  time: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary.base,
    marginTop: 6,
  },
});
