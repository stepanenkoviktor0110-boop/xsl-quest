FROM node:18-alpine

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Копируем остальные файлы
COPY backend ./backend
COPY frontend ./frontend

# Порт
EXPOSE 5000

# Запуск
CMD ["node", "backend/server.js"]
