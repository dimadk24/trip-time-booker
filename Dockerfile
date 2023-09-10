FROM node:18.16.0-bullseye-slim

# crontab on docker: https://gist.github.com/x-yuri/f17b2cefc6e673e979850d79b265f345
RUN apt-get update && apt-get install -y cron
# Create the log file to be able to run tail
RUN touch /var/log/cron.log

RUN corepack enable && corepack prepare pnpm@8.6.5 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml /app/

ENV HUSKY=0

RUN pnpm install --frozen-lockfile

COPY cron/config /app/cron/

RUN crontab /app/cron/config

COPY . /app/

ARG NEXT_PUBLIC_APP_DOMAIN
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

ENV NEXT_PUBLIC_APP_DOMAIN $NEXT_PUBLIC_APP_DOMAIN
ENV NEXT_PUBLIC_SENTRY_DSN $NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY $NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
