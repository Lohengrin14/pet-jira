# AGENTS.md — pet-jira

Инструкция для AI-агентов, которые работают в этом репозитории.

## Что это

Фронтенд моковой Jira-доски **Pet Jira** (Vite + React 19, без TypeScript). Данные берёт
с сервера [pet-jira-server](https://github.com/Lohengrin14/pet-jira-server) по REST API,
описание API и ролей — в его `AGENTS.md`. Сайт публикуется на GitHub Pages при пуше в `main`.

## Команды

```bash
npm install
npm run dev     # http://localhost:5173, по умолчанию ходит на сервер в Render
npm run lint    # oxlint
npm run build   # сборка в dist/
```

Для локального сервера: `cp .env.example .env.local` (`VITE_API_URL=http://localhost:3000`).
Перед тем как считать задачу готовой, прогоните `npm run lint` и `npm run build`.

## Где что лежит

- `src/api.js` — все запросы к серверу и токен входа.
- `src/useBoard.js` — состояние: кто вошёл, пользователи, проекты, задачи и действия с ними.
- `src/permissions.js` — копия серверных правил ролей. Только прячет кнопки, решает сервер.
  Меняются правила на сервере — меняйте и здесь.
- `src/components/LoginScreen.jsx` — вход через Google (Google Identity Services, Client ID берётся
  с сервера из `GET /auth/options`) и тестовые пользователи.
- `src/components/` — экран входа, доска (колонка, карточка, окно задачи, комментарии), админка.

## Правила

- Тексты интерфейса и комментарии в коде — по-русски, имена в коде — по-английски.
- Сообщения коммитов, названия и описания Pull Request — на английском.
- Работаем в отдельной ветке и открываем Pull Request в `main`, напрямую в `main` не пушим.
