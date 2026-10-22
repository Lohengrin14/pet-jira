import { useState } from 'react'
import { Column } from './components/Column.jsx'
import { TaskModal } from './components/TaskModal.jsx'
import { COLUMNS } from './data.js'
import { useTasks } from './useTasks.js'

export default function App() {
  const { tasks, createTask, updateTask, deleteTask } = useTasks()
  // null: окно закрыто, 'new': создание задачи, иначе id открытой задачи
  const [openTask, setOpenTask] = useState(null)

  const editedTask = tasks.find((t) => t.id === openTask)

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1 className="title">Pet Jira</h1>
          <p className="subtitle">Моковая доска для проверки работы агентов</p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpenTask('new')}>
          + Новая задача
        </button>
      </header>

      <main className="board">
        {COLUMNS.map((column) => (
          <Column
            key={column.id}
            column={column}
            tasks={tasks.filter((t) => t.status === column.id)}
            onOpen={setOpenTask}
            onMove={(id) => updateTask(id, { status: column.id })}
            onAssign={(id, assigneeId) => updateTask(id, { assigneeId })}
          />
        ))}
      </main>

      {openTask === 'new' && (
        <TaskModal
          onClose={() => setOpenTask(null)}
          onSave={(data) => {
            createTask(data)
            setOpenTask(null)
          }}
        />
      )}

      {editedTask && (
        <TaskModal
          task={editedTask}
          onClose={() => setOpenTask(null)}
          onSave={(data) => {
            updateTask(editedTask.id, data)
            setOpenTask(null)
          }}
          onDelete={() => {
            deleteTask(editedTask.id)
            setOpenTask(null)
          }}
        />
      )}
    </div>
  )
}
