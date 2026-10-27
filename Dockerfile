FROM node:24.22.1-slim AS builder
WORKDIR /app
COPY . /app
RUN --mount=type=cache,target=/root/.npm npm ci
RUN --mount=type=cache,target=/root/.npm npm run build
RUN --mount=type=cache,target=/root/.npm-production npm ci --ignore-scripts --omit=dev


FROM node:24.22.1-slim AS release
WORKDIR /app
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json
ENV NODE_ENV=production
RUN npm ci --ignore-scripts --omit=dev
ENTRYPOINT ["node", "/app/dist/bin/cli.cjs"]
