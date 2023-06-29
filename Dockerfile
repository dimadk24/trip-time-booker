FROM node:18.16.0-bullseye-slim

ENV HUSKY=0

RUN corepack enable && corepack prepare pnpm@8.6.5 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml /app/

RUN pnpm install --frozen-lockfile

COPY . /app/

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
