// Справочники доски. Идентификаторы совпадают со значениями на сервере.

export const COLUMNS = [
  { id: 'TODO', title: 'К выполнению' },
  { id: 'IN_PROGRESS', title: 'В работе' },
  { id: 'BLOCKED', title: 'Заблокировано' },
  { id: 'REVIEW', title: 'На проверке' },
  { id: 'DONE', title: 'Готово' },
]

export const PRIORITIES = [
  { id: 'LOW', title: 'Низкий' },
  { id: 'MEDIUM', title: 'Средний' },
  { id: 'HIGH', title: 'Высокий' },
  { id: 'CRITICAL', title: 'Критичный' },
]

export const ROLES = {
  ADMIN: { title: 'Админ', hint: 'может всё, включая роли пользователей' },
  MANAGER: { title: 'Менеджер', hint: 'меняет и удаляет любые задачи' },
  MEMBER: { title: 'Участник', hint: 'создаёт задачи, двигает только свои' },
  VIEWER: { title: 'Наблюдатель', hint: 'только смотрит' },
}

const FALLBACK_COLOR = '#6366f1'

export function projectColor(projects, id) {
  return projects.find((p) => p.id === id)?.color ?? FALLBACK_COLOR
}
