import { useLocalSearchParams } from "expo-router";

export function useEditing() {
  const { editing } = useLocalSearchParams<{ editing?: string }>();
  return editing === "1";
}
