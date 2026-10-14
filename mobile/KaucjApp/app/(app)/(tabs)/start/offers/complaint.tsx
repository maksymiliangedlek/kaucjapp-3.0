import ComplaintScreen from "@/src/components/standalone-screens/complaint/complaint-screen";
import { useLocalSearchParams } from "expo-router";

export default function StartOfferComplaint() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <ComplaintScreen offerId={id} complainiant="CREATOR" />;
}
