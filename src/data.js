// Моковые данные доски: колонки, проекты и текущий пользователь (пока без логина).

export const COLUMNS = [
  { id: 'todo', title: 'К выполнению' },
  { id: 'in_progress', title: 'В работе' },
  { id: 'blocked', title: 'Заблокировано' },
  { id: 'review', title: 'На проверке' },
  { id: 'done', title: 'Готово' },
]

export const PROJECTS = [
  { id: 'p1', name: 'Проект 1', color: '#6366f1' },
  { id: 'p2', name: 'Проект 2', color: '#0ea5a4' },
  { id: 'p3', name: 'Проект 3', color: '#f59e0b' },
]

export const CURRENT_USER = { id: 'me', name: 'Василий' }

export function projectById(id) {
  return PROJECTS.find((p) => p.id === id) ?? PROJECTS[0]
}
