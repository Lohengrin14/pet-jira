import { useState } from 'react'
import { Column } from './components/Column.jsx'
import { LoginScreen } from './components/LoginScreen.jsx'
import { TaskModal } from './components/TaskModal.jsx'
import { COLUMNS, ROLES } from './data.js'
import { can } from './permissions.js'
import { useBoard } from './useBoard.js'

export default function App() {
  const board = useBoard()
  const { user, tasks, error } = board
  // null: окно закрыто, 'new': создание задачи, иначе id открытой задачи
  const [openTask, setOpenTask] = useState(null)

  if (board.status === 'loading') {
    return (
      <div className="screen-center">
        <div className="spinner" />
        <p>Подключаемся к серверу…</p>
        <p className="muted">Бесплатный сервер засыпает без дела, первый запуск может занять до минуты.</p>
      </div>
    )
  }

  if (board.status === 'failed') {
    return (
      <div className="screen-center">
        <p>Не получилось подключиться к серверу.</p>
        <p className="muted">{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Попробовать ещё раз
        </button>
      </div>
    )
  }

  if (!user) return <LoginScreen users={board.users} onLogin={board.login} error={error} />

  const editedTask = tasks.find((t) => t.id === openTask)
  // Ошибку уже показал баннер, окно просто остаётся открытым
  const ignore = () => {}

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1 className="title">Pet Jira</h1>
          <p className="subtitle">Моковая доска для проверки работы агентов</p>
        </div>
        <div className="header-actions">
          <span className="assignee" title={ROLES[user.role].hint}>
            <span className="avatar">{user.name[0]}</span>
            {user.name} · {ROLES[user.role].title}
          </span>
          <button className="link-btn" onClick={board.logout}>
            Сменить пользователя
          </button>
          {can.createTask(user) && (
            <button className="btn btn-primary" onClick={() => setOpenTask('new')}>
              + Новая задача
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="banner" role="alert">
          {error}
          <button className="link-btn" onClick={board.clearError} aria-label="Закрыть">
            ✕
          </button>
        </div>
      )}

      <main className="board">
        {COLUMNS.map((column) => (
          <Column
            key={column.id}
            column={column}
            tasks={tasks.filter((t) => t.status === column.id)}
            user={user}
            projects={board.projects}
            onOpen={setOpenTask}
            onMove={(id) => {
              const task = tasks.find((t) => t.id === id)
              if (task && task.status !== column.id) board.updateTask(id, { status: column.id }).catch(ignore)
            }}
            onAssign={(id, assigneeId) => board.updateTask(id, { assigneeId }).catch(ignore)}
          />
        ))}
      </main>

      {openTask === 'new' && (
        <TaskModal
          user={user}
          users={board.users}
          projects={board.projects}
          onClose={() => setOpenTask(null)}
          onSave={(data) =>
            board
              .createTask(data)
              .then(() => setOpenTask(null))
              .catch(ignore)
          }
        />
      )}

      {editedTask && (
        <TaskModal
          task={editedTask}
          user={user}
          users={board.users}
          projects={board.projects}
          run={board.run}
          onCommentsChange={(delta) => board.changeCommentCount(editedTask.id, delta)}
          onClose={() => setOpenTask(null)}
          onSave={(data) =>
            board
              .updateTask(editedTask.id, data)
              .then(() => setOpenTask(null))
              .catch(ignore)
          }
          onDelete={() =>
            board
              .deleteTask(editedTask.id)
              .then(() => setOpenTask(null))
              .catch(ignore)
          }
        />
      )}
    </div>
  )
}
