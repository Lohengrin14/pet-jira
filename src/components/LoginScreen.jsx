import { useState } from 'react'
import { ROLES } from '../data.js'

// Вход без пароля: выбираем, под кем смотреть доску. Потом заменим на вход через Google
export function LoginScreen({ users, onLogin, error }) {
  const [pending, setPending] = useState(null)

  async function choose(id) {
    setPending(id)
    try {
      await onLogin(id)
    } catch {
      setPending(null)
    }
  }

  return (
    <div className="screen-center">
      <h1 className="title">Pet Jira</h1>
      <p className="muted">Выберите, под кем войти. От роли зависит, что можно делать на доске.</p>
      <div className="user-list">
        {users.map((u) => (
          <button key={u.id} className="user-option" disabled={pending !== null} onClick={() => choose(u.id)}>
            <span className="avatar avatar-lg">{u.name[0]}</span>
            <span className="user-option-text">
              <strong>{u.name}</strong>
              <span className="muted">
                {ROLES[u.role].title}: {ROLES[u.role].hint}
              </span>
            </span>
            {pending === u.id && <span className="spinner spinner-sm" />}
          </button>
        ))}
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}
