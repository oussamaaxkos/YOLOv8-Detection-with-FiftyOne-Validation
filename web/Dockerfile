FROM node:20-alpine AS build-client

WORKDIR /app/client

COPY web/client/package.json ./
RUN npm install

COPY web/client/ ./
RUN npm run build


FROM node:20-alpine AS server

WORKDIR /app/server

COPY web/server/package.json ./
RUN npm install --omit=dev

COPY web/server/ ./

COPY --from=build-client /app/client/dist /app/client/dist

ENV PORT=3001
ENV YOLO_API_URL=http://yolov8-api:5000
ENV CLIENT_DIST=/app/client/dist

EXPOSE 3001

CMD ["node", "src/index.js"]

