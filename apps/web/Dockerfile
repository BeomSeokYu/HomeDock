FROM node:20-slim AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
COPY apps/web/package.json ./apps/web/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY package.json ./package.json
RUN node -e "const fs=require('fs');const webPath='apps/web/package.json';const web=JSON.parse(fs.readFileSync(webPath,'utf8'));const sections=['dependencies','devDependencies','peerDependencies','optionalDependencies'];for(const section of sections){if(web[section]&&typeof web[section]['@homedock/types']==='string'&&web[section]['@homedock/types'].startsWith('workspace:')){web[section]['@homedock/types']='file:../packages/types';}}fs.writeFileSync(webPath,JSON.stringify(web,null,2));"
RUN npm install --prefix apps/web --include-workspace-root=false
COPY . .
RUN npm run --prefix apps/web build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["node", "/app/node_modules/next/dist/bin/next", "start", "-p", "3000", "--hostname", "0.0.0.0"]
