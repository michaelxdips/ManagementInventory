FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Create data directory for SQLite (inside /app/data to match code)
RUN mkdir -p data

EXPOSE 3000

CMD ["node", "src/index.js"]
