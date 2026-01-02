#!/bin/sh
set -e

if [ -n "${DATABASE_URL}" ]; then
  ./apps/api/node_modules/.bin/prisma db push --schema=./prisma/schema.prisma
fi

exec node dist/main.js
