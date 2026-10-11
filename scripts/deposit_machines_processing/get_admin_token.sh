#!/usr/bin/env bash
# Login as admin and print the access (JWT) token to stdout.
# Usage: ./get_admin_token.sh <identifier> <password>
# Optional: KAUCJAPP_API_URL (default https://kaucjapp.duckdns.org)

set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <identifier> <password>" >&2
  echo "Optional env: KAUCJAPP_API_URL (default https://kaucjapp.duckdns.org)" >&2
  exit 1
fi

IDENTIFIER="$1"
PASSWORD="$2"
API_URL="${KAUCJAPP_API_URL:-https://kaucjapp.duckdns.org}"
API_URL="${API_URL%/}"

decode_token() {
  python3 -c '
import json, sys
raw = sys.stdin.read().strip()
if not raw:
    sys.exit("empty token response")
if raw.startswith("\""):
    raw = json.loads(raw)
print(raw)
'
}

json_body=$(python3 -c 'import json,sys; print(json.dumps({"identifier": sys.argv[1], "password": sys.argv[2]}))' "$IDENTIFIER" "$PASSWORD")

login_http=$(mktemp)
access_http=$(mktemp)
trap 'rm -f "$login_http" "$access_http"' EXIT

login_status=$(curl -sS -w "%{http_code}" -o "$login_http" \
  -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "$json_body")

if [[ "$login_status" != "200" ]]; then
  echo "Login failed (HTTP $login_status): $(cat "$login_http")" >&2
  exit 1
fi

refresh_token=$(decode_token < "$login_http")

access_status=$(curl -sS -w "%{http_code}" -o "$access_http" \
  -X POST "$API_URL/api/auth/refresh" \
  -H "Content-Type: text/plain" \
  --data-binary "$refresh_token")

if [[ "$access_status" != "200" ]]; then
  echo "Refresh failed (HTTP $access_status): $(cat "$access_http")" >&2
  exit 1
fi

decode_token < "$access_http"
