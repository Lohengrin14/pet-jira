// Те же правила, что на сервере (pet-jira-server/src/permissions.ts).
// Здесь они только прячут кнопки, решает всё равно сервер.
const isStaff = (user) => user.role === 'ADMIN' || user.role === 'MANAGER'

export const can = {
  createTask: (user) => user.role !== 'VIEWER',
  // MEMBER меняет только свои задачи: где он автор или исполнитель
  editTask: (user, task) =>
    isStaff(user) || (user.role === 'MEMBER' && (task.author.id === user.id || task.assignee?.id === user.id)),
  deleteTask: (user) => isStaff(user),
  comment: (user) => user.role !== 'VIEWER',
  deleteComment: (user, comment) => isStaff(user) || comment.author.id === user.id,
  // Вкладка «Админка»
  openAdmin: (user) => user.role === 'ADMIN',
}
