FROM node:20-slim AS builder
WORKDIR /app
ENV DATABASE_URL=file:/data/homedock.db
COPY apps/api/package.json ./apps/api/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY package.json ./package.json
RUN node -e "const fs=require('fs');const apiPath='apps/api/package.json';const api=JSON.parse(fs.readFileSync(apiPath,'utf8'));const sections=['dependencies','devDependencies','peerDependencies','optionalDependencies'];for(const section of sections){if(api[section]&&typeof api[section]['@homedock/types']==='string'&&api[section]['@homedock/types'].startsWith('workspace:')){api[section]['@homedock/types']='file:../packages/types';}}fs.writeFileSync(apiPath,JSON.stringify(api,null,2));"
RUN npm install --prefix apps/api --include-workspace-root=false
COPY . .
RUN npm run --prefix apps/api build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/entrypoint.sh ./entrypoint.sh
EXPOSE 4000
CMD ["./entrypoint.sh"]
