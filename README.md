# ExamHub — платформа для онлайн-экзаменов

Next.js (App Router) + TypeScript + Tailwind CSS v4 + MongoDB Atlas (mongoose).
Языки интерфейса и содержимого экзаменов: **English / Azərbaycanca**.

## Быстрый старт

```bash
npm install
cp .env.example .env.local     # впишите MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run seed                   # админ + 9 студентов + пример экзамена
npm run dev                    # http://localhost:3000
```

В MongoDB Atlas: Network Access -> добавьте свой IP (или 0.0.0.0/0 для теста).

## Зависимости

```bash
npm i mongoose jose bcryptjs
npm i -D tsx
```
(всё уже записано в `package.json`, достаточно `npm install`)

## Роли

| Роль | Что может |
|------|-----------|
| **admin** | панель `/admin`: создавать/редактировать/удалять экзамены и вопросы (на EN и AZ), создавать/удалять аккаунты, смотреть результаты всех студентов |
| **user (студент)** | войти в свой аккаунт, пройти опубликованный экзамен, смотреть разбор ответов и свою статистику `/stats` |

Публичной регистрации нет: аккаунты создаёт администратор (`/admin/users`).
Без входа доступна только страница `/login`.

## Студенты из seed

Пароль у всех: значение `SEED_STUDENT_PASSWORD` (по умолчанию `Exam2026!`). Смените после первого входа.

| Имя | E-mail |
|-----|--------|
| Aliyə İsgəndər Fərhad | aliye.isgender@student.examhub.az |
| Aygün Nəcəfova Taleh | aygun.necefova@student.examhub.az |
| Emin Eminov Valeh | emin.eminov@student.examhub.az |
| Əlirza Əyyubzadə Fuad | elirza.eyyubzade@student.examhub.az |
| Hüseyn Məmmədov Amil | huseyn.memmedov@student.examhub.az |
| Kamran Guseinovi Aslan | kamran.guseinovi@student.examhub.az |
| Sənan Nəbiyev Seymur | senan.nebiyev@student.examhub.az |
| Yunis Abulov Rauf | yunis.abulov@student.examhub.az |
| Zərifə İlyasova Elmaz | zerife.ilyasova@student.examhub.az |

Список имён лежит в `src/lib/seed-data.ts`, `npm run seed` можно запускать повторно (дубликаты пропускаются).

## Как это устроено

- **Язык**: cookie `locale` (`az` по умолчанию). Словари: `src/i18n/dictionaries/{en,az}.ts`. Вопросы и варианты хранятся сразу в двух языках; если один язык пуст, показывается второй.
- **Авторизация**: JWT в httpOnly-cookie, пользователь проверяется в БД на каждый запрос. Защита страниц — в `src/app/(app)/layout.tsx` и `admin/layout.tsx`, API — через `guard()` в `src/lib/api.ts`.
- **Экзамен**: таймер считается на сервере (`expiresAt`). По истечении времени ответы отправляются автоматически; если студент ушёл, попытка закрывается при следующем заходе. Правильные ответы клиенту во время экзамена не отправляются.
- **Статистика**: модель `Attempt` хранит балл, процент, результат и даты; страница `/stats` и дашборд админа строятся из неё.

## Структура

```
scripts/seed.ts          заполнение БД
src/app/(auth)/login     вход
src/app/(app)/           каталог, экзамен, прохождение, результат, статистика
src/app/(app)/admin/     админ-панель
src/app/api/             REST API
src/components/          UI
src/i18n/                переводы
src/lib/, src/models/    логика и модели MongoDB
```

> `next.config.ts` в проекте отключает `cacheComponents` (в новых версиях create-next-app он включён по умолчанию),
> потому что все страницы здесь динамические и зависят от сессии. Если вы копируете только `src` в свой проект,
> уберите `cacheComponents` и `partialPrefetching` из вашего `next.config.ts`.
