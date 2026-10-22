import { CURRENT_USER, projectById } from '../data.js'

export function TaskCard({ task, onOpen, onAssign }) {
  const project = projectById(task.projectId)
  const isMine = task.assigneeId === CURRENT_USER.id

  return (
    <article
      className="card"
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', task.id)}
      onClick={() => onOpen(task.id)}
    >
      <span className="project-tag" style={{ '--tag': project.color }}>
        {project.name}
      </span>
      <h3 className="card-title">{task.title}</h3>
      {task.description && <p className="card-desc">{task.description}</p>}

      <div className="card-foot">
        {isMine ? (
          <span className="assignee" title={CURRENT_USER.name}>
            <span className="avatar">{CURRENT_USER.name[0]}</span>
            {CURRENT_USER.name}
          </span>
        ) : (
          <button
            className="link-btn"
            onClick={(e) => {
              e.stopPropagation()
              onAssign(task.id, CURRENT_USER.id)
            }}
          >
            Назначить на себя
          </button>
        )}
      </div>
    </article>
  )
}
