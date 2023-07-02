FROM node:18.16.0-bullseye-slim

ARG NEXT_PUBLIC_APP_DOMAIN
ARG NEXT_PUBLIC_SENTRY_DSN

ENV NEXT_PUBLIC_APP_DOMAIN $NEXT_PUBLIC_APP_DOMAIN
ENV NEXT_PUBLIC_SENTRY_DSN $NEXT_PUBLIC_SENTRY_DSN

ENV HUSKY=0

RUN corepack enable && corepack prepare pnpm@8.6.5 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml /app/

RUN pnpm install --frozen-lockfile

COPY . /app/

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
