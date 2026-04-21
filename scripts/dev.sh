#!/bin/bash
set -Eeuo pipefail

PORT=5000
API_PORT=3001
COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
DEPLOY_RUN_PORT=5000

cd "${COZE_WORKSPACE_PATH}"

kill_port_if_listening() {
    local pids
    pids=$(ss -H -lntp 2>/dev/null | awk -v port="$1" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | paste -sd' ' - || true)
    if [[ -z "${pids}" ]]; then
      echo "Port $1 is free."
      return
    fi
    echo "Port $1 in use by PIDs: ${pids} (SIGKILL)"
    echo "${pids}" | xargs -I {} kill -9 {} 2>/dev/null || true
    sleep 1
}

echo "Clearing ports before start."
kill_port_if_listening "${DEPLOY_RUN_PORT}"
kill_port_if_listening "${API_PORT}"

echo "Starting API server on port ${API_PORT}..."
PORT=${API_PORT} pnpm tsx watch server/server.ts &

echo "Starting Vite dev server on port ${DEPLOY_RUN_PORT}..."
pnpm vite --port ${DEPLOY_RUN_PORT} --host
