FROM node:18-alpine AS build


#
# Build 
#

COPY thehutgroup.pem /thehutgroup.pem
ENV NODE_EXTRA_CA_CERTS=/thehutgroup.pem
RUN npm install -g pnpm@8.6

WORKDIR /app

COPY package.json .
COPY pnpm-*.yaml .
RUN pnpm fetch --ignore-scripts

COPY publisher/package.json publisher/
RUN pnpm install --offline --frozen-lockfile

COPY tsconfig* .
COPY publisher/tsconfig* publisher/
COPY publisher/src/ publisher/src

RUN pnpm run --filter @self-workerd/publisher build

#
# Build final image
#

FROM node:18-alpine 
ENV NODE_ENV=production
COPY thehutgroup.pem /thehutgroup.pem
ENV NODE_EXTRA_CA_CERTS=/thehutgroup.pem
RUN npm install -g pnpm@8.6

WORKDIR /app

COPY --from=build /app/package.json .
COPY --from=build /app/pnpm-*.yaml .
COPY --from=build /app/publisher/package.json publisher/

RUN pnpm install --frozen-lockfile --prod
COPY publisher/config.template.capnp publisher/
COPY --from=build /app/publisher/dist/ publisher/dist

WORKDIR /app/publisher

EXPOSE 3000
ENTRYPOINT [ "pnpm", "start" ]
