#!/usr/bin/env bash
# Start Metro against the local backend (overrides production .env).
# Port 8086 avoids Docker on 8081. Use Expo Go / simulator and reload after start.
set -euo pipefail

cd "$(dirname "$0")/.."

IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
if [[ -z "${IP}" ]]; then
  echo "Could not detect LAN IP (en0/en1). Connect to Wi‑Fi and retry." >&2
  exit 1
fi

API_URL="${EXPO_PUBLIC_API_URL:-http://${IP}:8080/api}"
PORT="${EXPO_PORT:-8086}"

# .env.local beats .env in Expo — otherwise production URL from .env wins.
cat > .env.local <<EOF
EXPO_PUBLIC_API_URL=${API_URL}
EOF

export EXPO_PUBLIC_API_URL="${API_URL}"

echo "API  → ${EXPO_PUBLIC_API_URL}"
echo "Metro→ http://${IP}:${PORT}  (wrote .env.local)"
echo "In the simulator: press r to reload after this starts."
echo

exec npx expo start --clear --port "${PORT}" --lan
