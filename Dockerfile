FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* bun.lock* ./

RUN npm install --omit=dev

COPY signaling-server.js ./

EXPOSE 5130

ENV NODE_ENV=production
ENV SIGNALING_PORT=5130

CMD ["node", "signaling-server.js"]

