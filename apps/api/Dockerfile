FROM node:20-slim AS builder
WORKDIR /app
RUN apt-get update -y \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*
ENV DATABASE_URL=file:/data/homedock.db
COPY . .
RUN node -e "const fs=require('fs');const apiPath='apps/api/package.json';const api=JSON.parse(fs.readFileSync(apiPath,'utf8'));const sections=['dependencies','devDependencies','peerDependencies','optionalDependencies'];for(const section of sections){if(api[section]&&typeof api[section]['@homedock/types']==='string'&&api[section]['@homedock/types'].startsWith('workspace:')){api[section]['@homedock/types']='file:../packages/types';}}fs.writeFileSync(apiPath,JSON.stringify(api,null,2));"
RUN rm -rf apps/api/node_modules node_modules
RUN npm install --prefix apps/api --include-workspace-root=false
RUN npm run --prefix apps/api build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update -y \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/entrypoint.sh ./entrypoint.sh
EXPOSE 4000
CMD ["./entrypoint.sh"]
