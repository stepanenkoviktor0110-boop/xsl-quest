# План оптимизации Frontend

## Текущее состояние
- **1 файл**: index.html (1948 строк)
- Все стили inline (642 строки CSS)
- Весь JavaScript inline (840+ строк)
- Дублирование кода
- Трудно поддерживать

## Целевая структура

```
frontend/
├── index.html           # 150-200 строк (только HTML)
├── css/
│   └── styles.css       # Все стили
├── js/
│   ├── utils.js         # Утилиты (encoding, copy)
│   ├── api.js           # API запросы
│   ├── ui.js            # UI логика (экраны, ошибки)
│   ├── test.js          # Логика тестирования
│   └── app.js           # Главный файл, инициализация
└── README.md
```

## Проблемы для исправления

### 1. Дублирование кода
- `showCopySuccess()` определена дважды (строки 1246 и 1352)
- `initCopyButtons()` вызывается многократно
- Обработчики событий создаются повторно

### 2. Смешанная ответственность
- Функции работают и с UI, и с данными
- Нет разделения на слои

### 3. Глобальные переменные
```javascript
let allQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
```

## Решения

### 1. Модульная архитектура
Разделить код на логические модули с четкой ответственностью.

### 2. Использовать модули ES6
```javascript
// utils.js
export function fixEncoding(str) { ... }
export async function copyToClipboard(text) { ... }

// app.js
import { fixEncoding } from './utils.js';
```

### 3. Создать State Manager
```javascript
const AppState = {
  questions: [],
  currentIndex: 0,
  answers: {},
  testId: null
};
```

### 4. Убрать inline стили
Все стили в `styles.css`, использовать CSS классы.

## Результат
- ✅ Читаемый и поддерживаемый код
- ✅ Легко добавлять новые функции
- ✅ Кеширование CSS и JS браузером
- ✅ Меньше ошибок из-за дублирования
