import { useEffect, useRef, useState } from 'react'
import { COLUMNS, ROLES } from '../data.js'

// Режим управления: пользователи, проекты и сводка. Виден только ADMIN.
// Ошибки сервера (например, дубль email) показывает общий баннер доски.
export function AdminPage({ board }) {
  const { user, users, projects, tasks } = board

  return (
    <div className="admin">
      <section className="admin-section">
        <h2 className="admin-title">Пользователи · {users.length}</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Email</th>
                <th>Роль</th>
                <th className="num">Автор</th>
                <th className="num">Исполнитель</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isMe = u.id === user.id
                return (
                  <tr key={u.id}>
                    <td>
                      <span className="cell-user">
                        <span className="avatar">{u.name[0]}</span>
                        <EditableText value={u.name} onSave={(name) => board.updateUser(u.id, { name })} />
                      </span>
                    </td>
                    <td>
                      <EditableText value={u.email} type="email" onSave={(email) => board.updateUser(u.id, { email })} />
                    </td>
                    <td>
                      <select
                        className="cell-input"
                        value={u.role}
                        disabled={isMe}
                        title={isMe ? 'Свою роль менять нельзя' : ROLES[u.role].hint}
                        onChange={(e) => board.updateUser(u.id, { role: e.target.value }).catch(() => {})}
                      >
                        {Object.entries(ROLES).map(([id, r]) => (
                          <option key={id} value={id}>
                            {r.title}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="num">{tasks.filter((t) => t.author.id === u.id).length}</td>
                    <td className="num">{tasks.filter((t) => t.assignee?.id === u.id).length}</td>
                    <td className="actions">
                      {isMe ? (
                        <span className="muted small">это вы</span>
                      ) : (
                        <button
                          className="link-btn danger"
                          onClick={() => {
                            if (window.confirm(`Удалить пользователя ${u.name}?`)) board.deleteUser(u.id).catch(() => {})
                          }}
                        >
                          Удалить
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="muted small">
          Пользователя с задачами или комментариями удалить нельзя: поменяйте ему роль на «Наблюдатель».
        </p>
        <NewUserForm onCreate={board.createUser} />
      </section>

      <section className="admin-section">
        <h2 className="admin-title">Проекты</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Цвет</th>
                <th>Ключ</th>
                <th>Название</th>
                <th className="num">Задачи</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const count = tasks.filter((t) => t.project.id === p.id).length
                return (
                  <tr key={p.id}>
                    <td>
                      <ColorInput
                        value={p.color}
                        label={`Цвет проекта ${p.name}`}
                        onSave={(color) => board.updateProject(p.id, { color }).catch(() => {})}
                      />
                    </td>
                    <td>
                      <span className="card-key">{p.key}</span>
                    </td>
                    <td>
                      <EditableText value={p.name} onSave={(name) => board.updateProject(p.id, { name })} />
                    </td>
                    <td className="num">{count}</td>
                    <td className="actions">
                      {count > 0 ? (
                        <span className="muted small" title="Сначала удалите задачи проекта">
                          есть задачи
                        </span>
                      ) : (
                        <button
                          className="link-btn danger"
                          onClick={() => {
                            if (window.confirm(`Удалить проект ${p.name}?`)) board.deleteProject(p.id).catch(() => {})
                          }}
                        >
                          Удалить
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <NewProjectForm onCreate={board.createProject} />
      </section>
      <section className="admin-section">
        <h2 className="admin-title">Сводка</h2>
        <div className="stats">
          <Stat label="Пользователи" value={users.length} />
          <Stat label="Проекты" value={projects.length} />
          <Stat label="Задачи" value={tasks.length} />
          {COLUMNS.map((c) => (
            <Stat key={c.id} label={c.title} value={tasks.filter((t) => t.status === c.id).length} dot={c.id} />
          ))}
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value, dot }) {
  return (
    <div className="stat">
      <span className="stat-label">
        {dot && <span className={`dot dot-${dot.toLowerCase()}`} />}
        {label}
      </span>
      <span className="stat-value">{value}</span>
    </div>
  )
}

// Поле, которое сохраняется по Enter или при уходе фокуса. Esc отменяет правку
function EditableText({ value, onSave, type = 'text' }) {
  const [draft, setDraft] = useState(value)
  const [shown, setShown] = useState(value)
  // Значение поменялось на сервере (например, после перезагрузки списка): показываем новое
  if (value !== shown) {
    setShown(value)
    setDraft(value)
  }

  async function save() {
    const next = draft.trim()
    if (!next || next === value) {
      setDraft(value)
      return
    }
    try {
      await onSave(next)
    } catch {
      setDraft(value)
    }
  }

  return (
    <input
      className="cell-input"
      type={type}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
        if (e.key === 'Escape') {
          setDraft(value)
          e.currentTarget.blur()
        }
      }}
    />
  )
}

// Палитра: React onChange срабатывает на каждое движение мыши, а сохраняем один раз,
// по нативному change, когда палитру закрыли
function ColorInput({ value, label, onSave }) {
  const ref = useRef(null)

  useEffect(() => {
    const input = ref.current
    const onChange = () => input.value !== value && onSave(input.value)
    input.addEventListener('change', onChange)
    return () => input.removeEventListener('change', onChange)
  }, [value, onSave])

  return <input ref={ref} type="color" className="color-input" key={value} defaultValue={value} aria-label={label} />
}

function NewUserForm({ onCreate }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('MEMBER')

  async function submit(e) {
    e.preventDefault()
    try {
      await onCreate({ name: name.trim(), email: email.trim(), role })
      setName('')
      setEmail('')
      setRole('MEMBER')
    } catch {
      // поля остаются заполненными, ошибка на баннере
    }
  }

  return (
    <form className="inline-form" onSubmit={submit}>
      <input placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
      <input placeholder="email@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        {Object.entries(ROLES).map(([id, r]) => (
          <option key={id} value={id}>
            {r.title}
          </option>
        ))}
      </select>
      <button type="submit" className="btn btn-primary">
        Добавить пользователя
      </button>
    </form>
  )
}

function NewProjectForm({ onCreate }) {
  const [key, setKey] = useState('')
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')

  async function submit(e) {
    e.preventDefault()
    try {
      await onCreate({ key: key.trim(), name: name.trim(), color })
      setKey('')
      setName('')
    } catch {
      // поля остаются заполненными, ошибка на баннере
    }
  }

  return (
    <form className="inline-form" onSubmit={submit}>
      <input type="color" className="color-input" value={color} onChange={(e) => setColor(e.target.value)} aria-label="Цвет" />
      <input
        placeholder="Ключ, например PJ4"
        value={key}
        onChange={(e) => setKey(e.target.value.toUpperCase())}
        required
        pattern="[A-Za-z][A-Za-z0-9]{1,9}"
        title="2–10 латинских букв и цифр, начиная с буквы"
        className="input-key"
      />
      <input placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
      <button type="submit" className="btn btn-primary">
        Добавить проект
      </button>
    </form>
  )
}
