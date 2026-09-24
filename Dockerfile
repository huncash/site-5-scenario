FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* bun.lock* ./

RUN npm install --omit=dev

COPY signaling-server.js ./

EXPOSE 4001

ENV NODE_ENV=production
ENV PORT=4001

CMD ["node", "signaling-server.js"]

