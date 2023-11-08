FROM node:18-alpine3.18

LABEL maintainer 'Fellipe Fagundes'

RUN apk update && apk add --no-cache bash vim 

ENV USR node
ENV GRP node
ENV PROD_DIR /opt/leucotron/findYourNearestStore-service

WORKDIR ${PROD_DIR}

COPY --chown=${USR}:${GRP} . ${PROD_DIR}

RUN npm install --quiet --nooptional --no-fund --loglevel=error\
  && npm run build \
  && npm i -g pm2

EXPOSE 3000  

USER ${USR}

CMD [ "pm2-runtime", "ecosystem.config.js" ]