#!/bin/sh
set -e

if [ -n "${DATABASE_URL}" ]; then
  ./node_modules/.bin/prisma db push
fi

exec node dist/main.js
