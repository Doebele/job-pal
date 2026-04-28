#!/usr/bin/env bash
set -e

echo "Running migrations..."
npx drizzle-kit migrate --config drizzle.config.ts

echo "Starting server..."
exec node dist/index.js
