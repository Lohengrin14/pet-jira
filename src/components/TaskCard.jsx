import { PRIORITIES, projectColor } from '../data.js'
import { can } from '../permissions.js'

export function TaskCard({ task, user, projects, onOpen, onAssign }) {
  const editable = can.editTask(user, task)
  const priority = PRIORITIES.find((p) => p.id === task.priority)

  return (
    <article
      className={`card ${editable ? '' : 'card-locked'}`}
      draggable={editable}
      onDragStart={(e) => e.dataTransfer.setData('text/plain', String(task.id))}
      onClick={() => onOpen(task.id)}
    >
      <div className="card-head">
        <span className="project-tag" style={{ '--tag': projectColor(projects, task.project.id) }}>
          {task.project.name}
        </span>
        <span className="card-key">{task.key}</span>
        {(task.priority === 'HIGH' || task.priority === 'CRITICAL') && (
          <span className={`priority priority-${task.priority.toLowerCase()}`}>{priority.title}</span>
        )}
      </div>
      <h3 className="card-title">{task.title}</h3>
      {task.description && <p className="card-desc">{task.description}</p>}

      <div className="card-foot">
        {task.assignee ? (
          <span className="assignee" title={task.assignee.name}>
            <span className="avatar">{task.assignee.name[0]}</span>
            {task.assignee.name}
          </span>
        ) : editable ? (
          <button
            className="link-btn"
            onClick={(e) => {
              e.stopPropagation()
              onAssign(task.id, user.id)
            }}
          >
            Назначить на себя
          </button>
        ) : (
          <span className="muted small">Без исполнителя</span>
        )}
        {task.commentCount > 0 && (
          <span className="comment-count" title="Комментарии">
            💬 {task.commentCount}
          </span>
        )}
      </div>
    </article>
  )
}
