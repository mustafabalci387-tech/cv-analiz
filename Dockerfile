FROM node:20-alpine

WORKDIR /app

# Paket bağımlılıklarını kopyala ve üretim paketlerini yükle
COPY package*.json ./
RUN npm install --omit=dev

# Kaynak dosyalarını kopyala
COPY . .

# Port ve ortam değişkenleri
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

# Uygulamayı başlat
CMD ["node", "server.js"]
