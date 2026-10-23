import { useEffect, useState } from 'react'
import { AdminPage } from './components/AdminPage.jsx'
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
  // Вкладка живёт в адресе (#admin), чтобы переживать перезагрузку и открываться по ссылке
  const [tab, setTab] = useState(() => (window.location.hash === '#admin' ? 'admin' : 'board'))

  useEffect(() => {
    const onHash = () => setTab(window.location.hash === '#admin' ? 'admin' : 'board')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  function openTab(next) {
    window.location.hash = next === 'admin' ? 'admin' : ''
    setTab(next)
  }

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

  if (!user) {
    return (
      <LoginScreen
        options={board.authOptions}
        devUsers={board.devUsers}
        onLogin={board.login}
        onGoogle={board.googleLogin}
        error={error}
      />
    )
  }

  const editedTask = tasks.find((t) => t.id === openTask)
  const showAdmin = tab === 'admin' && can.openAdmin(user)
  // Ошибку уже показал баннер, окно просто остаётся открытым
  const ignore = () => {}

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div>
            <h1 className="title">{showAdmin ? 'Управление' : 'Pet Jira'}</h1>
            <p className="subtitle">
              {showAdmin ? 'Пользователи, роли и проекты' : 'Моковая доска для проверки работы агентов'}
            </p>
          </div>
          {showAdmin && (
            <button className="btn" onClick={() => openTab('board')}>
              ← К доске
            </button>
          )}
        </div>
        <div className="header-actions">
          <span className="assignee" title={ROLES[user.role].hint}>
            <span className="avatar">{user.name[0]}</span>
            {user.name} · {ROLES[user.role].title}
          </span>
          <button className="btn btn-quiet" onClick={board.logout} title="Выйти из аккаунта">
            <LogoutIcon />
            Выйти
          </button>
          {can.openAdmin(user) && (
            <button
              className={`icon-btn ${showAdmin ? 'active' : ''}`}
              onClick={() => openTab(showAdmin ? 'board' : 'admin')}
              title={showAdmin ? 'Вернуться к доске' : 'Управление: пользователи и проекты'}
              aria-label="Управление"
              aria-pressed={showAdmin}
            >
              <GearIcon />
            </button>
          )}
          {!showAdmin && can.createTask(user) && (
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

      {showAdmin ? (
        <AdminPage board={board} />
      ) : (
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
      )}

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

function GearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
