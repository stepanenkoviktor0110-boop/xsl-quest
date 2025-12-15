# Backend - XSL Quest

## Структура проекта

```
backend/
├── config/           # Конфигурационные файлы
│   ├── constants.js  # Константы приложения
│   └── multer.js     # Настройка загрузки файлов
├── controllers/      # Контроллеры для обработки запросов
│   ├── filesController.js
│   └── testController.js
├── middleware/       # Middleware функции
│   └── errorHandler.js
├── routes/           # Маршруты API
│   └── api.js
├── services/         # Бизнес-логика
│   └── excelParser.js
├── utils/            # Вспомогательные функции
│   ├── helpers.js
│   ├── network.js
│   └── testStorage.js
├── uploads/          # Временные загрузки (игнорируется git)
├── package.json
├── results.jsonl     # Результаты тестов
└── server.js         # Точка входа
```

## Основные улучшения

1. **Модульная архитектура**: Код разделен на логические модули
2. **Исправлен баг с setInterval**: Теперь создается только один таймер
3. **Обработка ошибок**: Централизованная обработка через middleware
4. **Разделение ответственности**: Controllers, Routes, Services
5. **Переиспользуемость**: Утилиты вынесены в отдельные модули

## API Endpoints

- `GET /api/test` - Проверка работы сервера
- `GET /api/files` - Список загруженных файлов
- `POST /api/upload` - Загрузка Excel файла
- `GET /api/test/:testId` - Получение теста по ID
- `POST /api/test/:testId/submit` - Отправка ответов на тест

## Запуск

```bash
npm start
# или
npm run dev
```
