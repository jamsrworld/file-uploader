# syntax=docker/dockerfile:1
ARG NODE_VERSION=20.12.0
ARG PNPM_VERSION=9.6.0

################################################################################
FROM --platform=linux/amd64 node:${NODE_VERSION}-alpine AS base
WORKDIR /app
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}
ENV NODE_ENV=development

################################################################################
# Create a stage for installing production dependecies.
FROM base AS deps
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile

################################################################################
# Create a stage for building the application.
FROM deps AS build
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

################################################################################
FROM base AS final
ENV NODE_ENV=production
USER node
COPY package.json .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD pnpm start
