import OfferChatScreen from "@/src/components/profile/offer-chat-screen";
import { useLocalSearchParams } from "expo-router";

export default function BookingChat() {
  const { offerId } = useLocalSearchParams<{ offerId: string }>();
  return <OfferChatScreen offerId={Number(offerId)} />;
}
