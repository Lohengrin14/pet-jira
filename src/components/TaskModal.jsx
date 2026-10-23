import { useEffect, useState } from 'react'
import { COLUMNS, PRIORITIES } from '../data.js'
import { can } from '../permissions.js'
import { Comments } from './Comments.jsx'

// Окно создания и редактирования задачи. Без task создаёт новую.
export function TaskModal({ task, user, users, projects, run, onCommentsChange, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [projectId, setProjectId] = useState(task?.project.id ?? projects[0]?.id)
  const [description, setDescription] = useState(task?.description ?? '')
  const [assigneeId, setAssigneeId] = useState(task ? (task.assignee?.id ?? '') : user.id)
  const [priority, setPriority] = useState(task?.priority ?? 'MEDIUM')
  const [status, setStatus] = useState(task?.status ?? 'TODO')
  const [saving, setSaving] = useState(false)

  const editable = task ? can.editTask(user, task) : can.createTask(user)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit(e) {
    e.preventDefault()
    if (!title.trim() || saving) return
    const data = {
      title: title.trim(),
      description: description.trim(),
      priority,
      assigneeId: assigneeId === '' ? null : Number(assigneeId),
    }
    setSaving(true)
    // Проект задаётся при создании, у готовой задачи меняется статус
    await onSave(task ? { ...data, status } : { ...data, projectId })
    setSaving(false)
  }

  async function remove() {
    if (!window.confirm(`Удалить задачу ${task.key}?`)) return
    setSaving(true)
    await onDelete()
    setSaving(false)
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <form className="modal-form" onSubmit={submit}>
          <h2 className="modal-title">
            {task ? (
              <>
                <span className="card-key">{task.key}</span> Задача
              </>
            ) : (
              'Новая задача'
            )}
          </h2>
          {task && (
            <p className="muted small">
              Автор: {task.author.name}
              {!editable && ' · Вы можете только смотреть эту задачу'}
            </p>
          )}

          <fieldset className="fields" disabled={!editable || saving}>
            <label className="field">
              <span>Название</span>
              <input
                autoFocus={!task}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Что нужно сделать?"
                maxLength={120}
                required
              />
            </label>

            {!task && (
              <div className="field">
                <span>Проект</span>
                <div className="segmented">
                  {projects.map((p) => (
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
            )}

            <label className="field">
              <span>Описание</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Подробности, ссылки, критерии готовности"
                rows={4}
              />
            </label>

            <div className="field-row">
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
              <label className="field">
                <span>Исполнитель</span>
                <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                  <option value="">Никто</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                      {u.id === user.id ? ' (я)' : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Приоритет</span>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  {PRIORITIES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>

          <div className="modal-actions">
            {task && can.deleteTask(user) && (
              <button type="button" className="btn btn-danger" onClick={remove} disabled={saving}>
                Удалить
              </button>
            )}
            <span className="spacer" />
            <button type="button" className="btn" onClick={onClose}>
              {editable ? 'Отмена' : 'Закрыть'}
            </button>
            {editable && (
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Сохраняем…' : task ? 'Сохранить' : 'Создать'}
              </button>
            )}
          </div>
        </form>

        {task && <Comments task={task} user={user} run={run} onChange={onCommentsChange} />}
      </div>
    </div>
  )
}
