FROM node:22-alpine
RUN corepack enable
WORKDIR /repo
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/contracts ./packages/contracts
COPY apps/api ./apps/api
RUN pnpm install --frozen-lockfile --filter @conhecimento/api...
WORKDIR /repo/apps/api
ENV PORT=3001
EXPOSE 3001
CMD ["pnpm", "exec", "tsx", "src/main.ts"]
