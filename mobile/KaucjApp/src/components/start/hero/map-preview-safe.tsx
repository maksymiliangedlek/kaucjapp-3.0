import React, { Component, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { MapPin } from "lucide-react-native";
import MiniMap from "@/src/components/profile/reserved-offers/mini-map";
import { colors, rounded } from "@/src/theme";

interface Props {
  latitude: number;
  longitude: number;
  height?: number;
}

interface State {
  failed: boolean;
}

/** MiniMap with ErrorBoundary — static pins if MapView crashes (TestFlight). */
export default class MapPreviewSafe extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch() {
    this.setState({ failed: true });
  }

  render(): ReactNode {
    const { latitude, longitude, height = 120 } = this.props;
    if (this.state.failed) {
      return (
        <View style={[styles.fallback, { height }]}>
          <MapPin size={22} color={colors.primary.base} fill={colors.primary.light} />
          <MapPin
            size={18}
            color={colors.primary.dark}
            style={{ position: "absolute", top: 28, left: "58%" }}
          />
          <MapPin
            size={16}
            color={colors.accent.base}
            style={{ position: "absolute", top: 56, left: "32%" }}
          />
        </View>
      );
    }

    return (
      <MiniMap
        latitude={latitude}
        longitude={longitude}
        height={height}
        interactive={false}
        pointerEvents="none"
        style={styles.map}
      />
    );
  }
}

const styles = StyleSheet.create({
  map: {
    borderRadius: rounded.lg,
    borderWidth: 0,
  },
  fallback: {
    width: "100%",
    borderRadius: rounded.lg,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
