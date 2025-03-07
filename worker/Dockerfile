FROM node:18-slim AS build


#
# Build 
#

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -qy libc++1 && \
    apt-get clean

COPY thehutgroup.pem /thehutgroup.pem
ENV NODE_EXTRA_CA_CERTS=/thehutgroup.pem
RUN npm install -g pnpm@8.6

WORKDIR /app

COPY package.json .
COPY pnpm-*.yaml .
RUN pnpm fetch

# COPY workerd to root
RUN find node_modules/ -wholename "*cloudflare/workerd*/bin/workerd*" -type f | xargs cp -t .

COPY worker/package.json worker/
RUN pnpm install --offline --frozen-lockfile

COPY tsconfig* .
COPY worker/tsconfig* worker/
COPY worker/src/ worker/src
COPY worker/tasks/ worker/tasks

RUN pnpm run --filter @self-workerd/worker build


#
# Build final image
#
FROM debian:12-slim
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -qy libc++1 curl unzip && \
    apt-get clean

WORKDIR /app

COPY worker/entrypoint.sh .
COPY --from=build /app/worker/dist config
COPY --from=build /app/workerd .

EXPOSE 3000

ENV PUBLISHER_ENDPOINT publisher-service:3000
ENTRYPOINT [ "./entrypoint.sh" ]