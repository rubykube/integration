FROM cypress/base:10

ENV NODE_ENV=production \
    APP_DIR=/usr/src/app

WORKDIR $APP_DIR/

COPY package.json package-lock.json $APP_DIR/

RUN npm install

COPY . $APP_DIR/

RUN $(npm bin)/cypress verify

CMD $(npm bin)/cypress run
