import { useEffect, useState } from 'react'
import { COLUMNS, CURRENT_USER, PROJECTS } from '../data.js'

// Окно создания и редактирования задачи. Без task создаёт новую.
export function TaskModal({ task, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [projectId, setProjectId] = useState(task?.projectId ?? PROJECTS[0].id)
  const [description, setDescription] = useState(task?.description ?? '')
  const [assignToMe, setAssignToMe] = useState(task ? task.assigneeId === CURRENT_USER.id : true)
  const [status, setStatus] = useState(task?.status ?? 'todo')

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      projectId,
      description: description.trim(),
      assigneeId: assignToMe ? CURRENT_USER.id : null,
      ...(task && { status }),
    })
  }

  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2 className="modal-title">{task ? 'Задача' : 'Новая задача'}</h2>

        <label className="field">
          <span>Название</span>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Что нужно сделать?"
            maxLength={120}
            required
          />
        </label>

        <div className="field">
          <span>Проект</span>
          <div className="segmented">
            {PROJECTS.map((p) => (
              <button
                type="button"
                key={p.id}
                className={p.id === projectId ? 'active' : ''}
                style={{ '--tag': p.color }}
                onClick={() => setProjectId(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <label className="field">
          <span>Описание</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Подробности, ссылки, критерии готовности"
            rows={5}
          />
        </label>

        {task && (
          <label className="field">
            <span>Статус</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="checkbox">
          <input
            type="checkbox"
            checked={assignToMe}
            onChange={(e) => setAssignToMe(e.target.checked)}
          />
          Назначить на себя
        </label>

        <div className="modal-actions">
          {onDelete && (
            <button type="button" className="btn btn-danger" onClick={onDelete}>
              Удалить
            </button>
          )}
          <span className="spacer" />
          <button type="button" className="btn" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn-primary">
            {task ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </form>
    </div>
  )
}
