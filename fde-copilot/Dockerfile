FROM node:22-bookworm-slim AS build

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

RUN corepack enable
COPY package.json pnpm-lock.yaml ./
# pnpm 11 requires native dependency builds to be explicitly approved. Next.js
# uses sharp opportunistically for image optimisation.
RUN printf 'allowBuilds:\n  esbuild: true\n  sharp: true\n' > pnpm-workspace.yaml \
  && pnpm install --frozen-lockfile

COPY . ./
RUN pnpm build

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Git is used only when the optional commit workflow is enabled.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates git \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable

COPY --from=build /app /app

# The Agent SDK bundles a platform-specific Claude Code binary, but does not
# expose it on PATH. Make it available for the one-time browser login command.
RUN ln -s "$(find /app/node_modules/.pnpm -path '*/node_modules/@anthropic-ai/claude-agent-sdk-linux-*/claude' -type f -perm -u+x -print -quit)" /usr/local/bin/claude

EXPOSE 3939

CMD ["pnpm", "exec", "next", "start", "-H", "0.0.0.0", "-p", "3939"]
