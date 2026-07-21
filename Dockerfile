ARG BUILDER_IMAGE=cgr.dev/chainguard/node:latest
ARG RUNTIME_IMAGE=cgr.dev/chainguard/nginx:latest-dev

FROM $BUILDER_IMAGE AS build-stage

WORKDIR /bnpp
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --legacy-peer-deps && npm cache clean --force
COPY --chown=node:node . .
RUN npm run build

FROM $RUNTIME_IMAGE

USER root
RUN apk update && apk add gettext
USER nginx

ARG APP_NAME
ARG BUILD_DATE
ARG CODE_AP="APXXXX"
ARG DESCRIPTION="Single Page App - Angular"
ARG RUNTIME_IMAGE=cgr.dev/chainguard/nginx:latest-dev
LABEL bnpp.container.governance.image.auid="${CODE_AP}" \
    bnpp.container.governance.image.category="APPLICATION" \
    org.opencontainers.image.created="${BUILD_DATE}" \
    org.opencontainers.image.description="${DESCRIPTION}" \
    org.opencontainers.image.source="link_with_your_git_source_code" \
    org.opencontainers.image.vendor="CARDIF" \
    org.opencontainers.image.base.name="${RUNTIME_IMAGE}" \
    org.opencontainers.image.base.digest="Under implementation by CoE Cloud Devops" \
    bnpp.container.governance.image.name="${APP_NAME}" \
    bnpp.container.governance.image.maintainer="maintainer_contact@bnpparibas.com" \
    bnpp.container.governance.image.securitychampion="security_champion_contact@bnpparibas.com"

COPY --chown=nginx:nginx --from=build-stage /bnpp/dist/angular-spa-code-engine/browser /usr/share/nginx/html
COPY --chown=nginx:nginx --from=build-stage /bnpp/dist/angular-spa-code-engine/browser /opt/app-root/src
COPY nginx.conf /etc/nginx/

EXPOSE 8080

# Writing env.js file to /tmp since the image might not run with "nginx" user and won't have write permission on the /opt/app-root/src/assets directory
ENTRYPOINT ["/bin/sh", "-c", "envsubst < /opt/app-root/src/assets/env/env.template.js > /tmp/env.js && /usr/sbin/nginx -c /etc/nginx/nginx.conf -e /dev/stderr -g 'daemon off;'"]
CMD []
