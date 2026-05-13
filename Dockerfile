FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Δηλώνουμε το port που θα χρησιμοποιήσει το Express keep-alive
ENV PORT=10000
EXPOSE 10000

CMD ["node", "atlas.js"]
