#!/bin/bash
# Load test script - hits the / endpoint every second
# Usage: ./load-test.sh [URL]
# Default URL: http://localhost:3000

URL="${1:-http://localhost:1121}"
COUNT=0

echo "Starting load test against ${URL}"
echo "Press Ctrl+C to stop"
echo "---"

while true; do
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${URL}/")
  COUNT=$((COUNT + 1))
  echo "[$(date '+%H:%M:%S')] Request #${COUNT} → HTTP ${RESPONSE}"
  sleep 1
done
