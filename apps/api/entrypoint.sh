#!/bin/sh
set -e

if [ -n "${DATABASE_URL}" ]; then
  if [ -d "./prisma/migrations" ] && [ "$(ls -A ./prisma/migrations 2>/dev/null)" ]; then
    ./apps/api/node_modules/.bin/prisma migrate deploy --schema=./prisma/schema.prisma
  else
    ./apps/api/node_modules/.bin/prisma db push --schema=./prisma/schema.prisma
  fi
fi

exec node dist/main.js
