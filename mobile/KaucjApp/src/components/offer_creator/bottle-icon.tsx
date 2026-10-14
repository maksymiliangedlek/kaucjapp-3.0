import React from "react";
import Svg, { Path, Rect } from "react-native-svg";

/**
 * Plastic PET bottle matching the app logo silhouette:
 * screw cap, collar, slim neck, slightly wider ribbed body, petaloid base.
 */
export default function BottleIcon({
  size = 24,
  color = "#000",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Screw cap */}
      <Rect
        x={10}
        y={1.75}
        width={5}
        height={2.25}
        rx={0.55}
        stroke={color}
        strokeWidth={1.75}
      />
      {/* Tamper collar under cap */}
      <Path
        d="M9.75 4h4.5"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
      />
      {/*
        Outline:
        neck (x≈10–14) → soft shoulders → body slightly wider (x≈8.5–15.5)
        → petaloid feet at the bottom
      */}
      <Path
        d="M10.25 4v2.4c0 .7.25 1.15.7 1.55L9.2 9.6v7.6
           c0 .45.15.8.4 1.05l-.85 1.55c-.2.35.05.7.45.7h6.6
           c.4 0 .65-.35.45-.7l-.85-1.55c.25-.25.4-.6.4-1.05V9.6
           l-1.75-1.65c.45-.4.7-.85.7-1.55V4"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Center petal notch */}
      <Path
        d="M11.2 20.55c.25-.45.75-.7 1.3-.7s1.05.25 1.3.7"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Side ribs */}
      <Path
        d="M9.6 11.4h4.8M9.6 13.4h4.8M9.6 15.4h4.8"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}
