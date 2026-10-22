import { useState } from 'react'
import { TaskCard } from './TaskCard.jsx'

export function Column({ column, tasks, onOpen, onMove, onAssign }) {
  const [isOver, setIsOver] = useState(false)

  return (
    <section
      className={`column ${isOver ? 'column-over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsOver(true)
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsOver(false)
        const id = e.dataTransfer.getData('text/plain')
        if (id) onMove(id)
      }}
    >
      <div className="column-head">
        <span className={`dot dot-${column.id}`} />
        <h2 className="column-title">{column.title}</h2>
        <span className="column-count">{tasks.length}</span>
      </div>

      <div className="column-body">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onOpen={onOpen} onAssign={onAssign} />
        ))}
        {tasks.length === 0 && <p className="column-empty">Пусто</p>}
      </div>
    </section>
  )
}
