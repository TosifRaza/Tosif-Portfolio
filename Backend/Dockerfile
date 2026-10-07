FROM node:22-bookworm-slim

ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app/Backend

COPY Backend/package.json Backend/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY Backend/ ./
RUN mkdir -p /data/uploads \
    && chown -R node:node /app/Backend /data/uploads

USER node
EXPOSE 5000

CMD ["npm", "start"]
