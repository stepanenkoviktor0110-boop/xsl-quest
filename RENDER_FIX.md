# Исправление Build Command на Render.com

## Шаг 1: Откройте настройки

1. Зайдите на https://dashboard.render.com
2. Найдите ваш сервис **xsl-quest** в списке
3. **Кликните** на название сервиса (xsl-quest)
4. В левом меню найдите и нажмите **"Settings"**

## Шаг 2: Найдите Build & Deploy

1. Прокрутите страницу вниз
2. Найдите секцию **"Build & Deploy"**
3. Там будет несколько полей

## Шаг 3: Измените Build Command

Найдите поле **"Build Command"**.

Сейчас там может быть:
- `yarn` (по умолчанию)
- или пусто

**Удалите** всё содержимое и впишите ТОЧНО:
```
cd backend && npm install
```

## Шаг 4: Проверьте Start Command

Чуть ниже найдите поле **"Start Command"**.

Там должно быть:
```
node backend/server.js
```

Если там `yarn start` или что-то другое - измените на:
```
node backend/server.js
```

## Шаг 5: Сохраните изменения

1. Прокрутите в **самый низ** страницы
2. Найдите кнопку **"Save Changes"** (синяя кнопка)
3. **Нажмите** на неё

## Шаг 6: Подождите автоматического деплоя

После нажатия "Save Changes":

1. Render автоматически начнёт новый деплой
2. Вас перебросит на страницу с логами
3. Подождите 5-10 минут
4. В логах должно появиться:

```
==> Running build command 'cd backend && npm install'
...
added 150 packages
==> Build successful 🎉
==> Running 'node backend/server.js'
...
🚀 Server running on port 10000
```

5. Вверху появится зелёная надпись **"Live"**

## Готово!

Теперь приложение должно работать!

URL будет вверху страницы: https://xsl-quest.onrender.com
