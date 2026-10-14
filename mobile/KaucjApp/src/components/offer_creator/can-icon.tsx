import React from "react";
import Svg, { Path, Rect } from "react-native-svg";

/** Simple aluminum-can glyph (Lucide has no can icon). */
export default function CanIcon({
  size = 24,
  color = "#000",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 4.5h8"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M9 4.5c0 1.2.7 2 3 2s3-.8 3-2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Rect
        x={7}
        y={6.5}
        width={10}
        height={13.5}
        rx={2}
        stroke={color}
        strokeWidth={2}
      />
      <Path
        d="M9 10.5h6M9 14h6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
